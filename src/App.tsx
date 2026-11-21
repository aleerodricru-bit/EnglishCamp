import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { GameArena, type SessionCompletionResult } from './components/GameArena';
import {
  filterLevelsByScope,
  GamesHub,
  type GameDifficultyScope,
} from './components/GamesHub';
import { HeroBanner } from './components/HeroBanner';
import { LeaderboardView } from './components/LeaderboardView';
import { LevelMap } from './components/LevelMap';
import { ProfileModal } from './components/ProfileModal';
import { RewardsView } from './components/RewardsView';
import { TopBar } from './components/TopBar';
import { WeeklyChallenge } from './components/WeeklyChallenge';
import { DIAGNOSTIC_LEVEL, LEVELS } from './data/curriculum';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import type {
  AgeGroup,
  AvatarId,
  GameSuggestion,
  LeaderboardEntry,
  LevelDefinition,
  NavSection,
  PracticeSession,
  QuestionType,
  StudentProfile,
  SuggestionCategory,
} from './types';
import { getCurrentDayKey, getISOWeekKey } from './utils/date';

function createDefaultGuestProfile(): StudentProfile {
  return {
    uid: 'guest',
    displayName: 'Explorador',
    ageGroup: '9-10',
    avatarId: 'fox',
    xp: 0,
    unlockedLevel: 1,
    levelStars: [0, 0, 0, 0, 0, 0],
    badges: [],
    activeWeekKey: getISOWeekKey(),
    weekDaysCompleted: [],
    weeklyXp: 0,
    weeksCompletedCount: 0,
    totalSessions: 0,
  };
}

function normalizeWeekState(profile: StudentProfile): StudentProfile {
  const currentWeek = getISOWeekKey();
  if (profile.activeWeekKey === currentWeek) {
    return profile;
  }
  return {
    ...profile,
    activeWeekKey: currentWeek,
    weekDaysCompleted: [],
    weeklyXp: 0,
  };
}

function sanitizeNickname(rawName: string | null | undefined): string {
  const clean = (rawName ?? 'Explorador').trim().slice(0, 30);
  return clean.length >= 1 ? clean : 'Explorador';
}

const MINIGAME_TITLES: Record<QuestionType, string> = {
  image_choice: 'Describe la Imagen',
  image_memory: 'Memoria de Imágenes',
  match: 'Atrapa la Palabra',
  builder: 'Constructor de Oraciones',
  spelling: 'Deletreo Relámpago',
  pairs: 'Parejas de Palabras',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<StudentProfile>(createDefaultGuestProfile);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [votedSuggestionIds, setVotedSuggestionIds] = useState<string[]>([]);

  const [activeSection, setActiveSection] = useState<NavSection>('ruta');
  const [playingLevelId, setPlayingLevelId] = useState<number | null>(null);
  const [customGameLevel, setCustomGameLevel] = useState<LevelDefinition | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  // Sync Firebase Auth state and load/bootstrap Firestore profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setAuthReady(true);
        setLeaderboard([]);
        setRecentSessions([]);
        setSuggestions([]);
        setVotedSuggestionIds([]);
        return;
      }

      const userPath = `users/${firebaseUser.uid}`;
      const leaderboardPath = `leaderboard/${firebaseUser.uid}`;
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        const currentWeek = getISOWeekKey();

        if (snap.exists()) {
          const data = snap.data() as StudentProfile;
          const normalized = normalizeWeekState({
            ...data,
            levelStars:
              Array.isArray(data.levelStars) && data.levelStars.length === 6
                ? data.levelStars
                : [0, 0, 0, 0, 0, 0],
            badges: Array.isArray(data.badges) ? data.badges : [],
            weekDaysCompleted: Array.isArray(data.weekDaysCompleted)
              ? data.weekDaysCompleted
              : [],
          });
          setProfile(normalized);

          // Ensure leaderboard doc exists for existing users
          const lbRef = doc(db, 'leaderboard', firebaseUser.uid);
          const lbSnap = await getDoc(lbRef);
          if (!lbSnap.exists()) {
            await writeBatch(db)
              .set(lbRef, {
                uid: firebaseUser.uid,
                nickname: sanitizeNickname(normalized.displayName),
                avatarId: normalized.avatarId,
                ageGroup: normalized.ageGroup,
                xp: normalized.xp,
                weeklyXp: normalized.weeklyXp,
                activeWeekKey: normalized.activeWeekKey,
                weekDaysCount: normalized.weekDaysCompleted.length,
                weeksCompletedCount: normalized.weeksCompletedCount,
                unlockedLevel: normalized.unlockedLevel,
                badgesCount: normalized.badges.length,
                updatedAt: serverTimestamp(),
              })
              .commit();
          }
        } else {
          // Bootstrap profile & leaderboard entry (preserving any guest trial progress!)
          const firstName = sanitizeNickname(
            firebaseUser.displayName?.split(' ')[0] ?? 'Explorador'
          );
          const guestBase = normalizeWeekState(profile);
          const initialProfile: StudentProfile = {
            uid: firebaseUser.uid,
            displayName: firstName,
            ...(firebaseUser.email ? { email: firebaseUser.email.slice(0, 120) } : {}),
            ageGroup: guestBase.ageGroup,
            avatarId: guestBase.avatarId,
            xp: guestBase.xp,
            unlockedLevel: guestBase.unlockedLevel,
            levelStars: guestBase.levelStars,
            badges: guestBase.badges,
            activeWeekKey: currentWeek,
            weekDaysCompleted: guestBase.weekDaysCompleted,
            weeklyXp: guestBase.weeklyXp,
            weeksCompletedCount: guestBase.weeksCompletedCount,
            totalSessions: guestBase.totalSessions,
          };

          const batch = writeBatch(db);
          batch.set(userRef, {
            ...initialProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          batch.set(doc(db, 'leaderboard', firebaseUser.uid), {
            uid: firebaseUser.uid,
            nickname: sanitizeNickname(initialProfile.displayName),
            avatarId: initialProfile.avatarId,
            ageGroup: initialProfile.ageGroup,
            xp: initialProfile.xp,
            weeklyXp: initialProfile.weeklyXp,
            activeWeekKey: initialProfile.activeWeekKey,
            weekDaysCount: initialProfile.weekDaysCompleted.length,
            weeksCompletedCount: initialProfile.weeksCompletedCount,
            unlockedLevel: initialProfile.unlockedLevel,
            badgesCount: initialProfile.badges.length,
            updatedAt: serverTimestamp(),
          });
          await batch.commit();
          setProfile(initialProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `${userPath} / ${leaderboardPath}`);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time Shared Leaderboard listener (only when authenticated)
  useEffect(() => {
    if (!authReady || !user) return;
    setLeaderboardLoading(true);
    const lbQuery = query(
      collection(db, 'leaderboard'),
      where('xp', '>=', 0),
      orderBy('xp', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(
      lbQuery,
      (snapshot) => {
        const items: LeaderboardEntry[] = snapshot.docs.map(
          (docSnap) => docSnap.data() as LeaderboardEntry
        );
        setLeaderboard(items);
        setLeaderboardLoading(false);
      },
      (error) => {
        setLeaderboardLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'leaderboard');
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  // Real-time recent practice sessions listener (only when authenticated)
  useEffect(() => {
    if (!authReady || !user) return;
    const sessionsPath = `users/${user.uid}/sessions`;
    const sessionsQuery = query(
      collection(db, 'users', user.uid, 'sessions'),
      where('uid', '==', user.uid),
      limit(25)
    );
    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const items: PracticeSession[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as PracticeSession),
          }))
          .sort((a, b) => {
            const aSec = (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
            const bSec = (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
            return bSec - aSec;
          })
          .slice(0, 10);
        setRecentSessions(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, sessionsPath);
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  // Real-time Game Suggestions listener (only when authenticated)
  useEffect(() => {
    if (!authReady || !user) return;
    setSuggestionsLoading(true);
    const sugQuery = query(
      collection(db, 'gameSuggestions'),
      where('votesCount', '>=', 0),
      orderBy('votesCount', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(
      sugQuery,
      (snapshot) => {
        const items: GameSuggestion[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<GameSuggestion, 'id'>),
        }));
        setSuggestions(items);
        setSuggestionsLoading(false);
      },
      (error) => {
        setSuggestionsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'gameSuggestions');
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  // Real-time current user's suggestion vote receipts
  useEffect(() => {
    if (!authReady || !user) return;
    const votesPath = `users/${user.uid}/suggestionVotes`;
    const votesQuery = query(
      collection(db, 'users', user.uid, 'suggestionVotes'),
      where('uid', '==', user.uid),
      limit(100)
    );
    const unsubscribe = onSnapshot(
      votesQuery,
      (snapshot) => {
        setVotedSuggestionIds(snapshot.docs.map((d) => d.id));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, votesPath);
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('No pudimos iniciar sesión con Google. Revisa si tu navegador bloqueó la ventana emergente.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setProfileModalOpen(false);
    setProfile(createDefaultGuestProfile());
  };

  const handleUpdatePreferences = useCallback(
    async (displayName: string, ageGroup: AgeGroup, avatarId: AvatarId) => {
      const cleanName = sanitizeNickname(displayName);
      setProfile((prev) => ({
        ...prev,
        displayName: cleanName,
        ageGroup,
        avatarId,
      }));

      if (!user) return;

      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid), {
        displayName: cleanName,
        ageGroup,
        avatarId,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'leaderboard', user.uid), {
        nickname: cleanName,
        ageGroup,
        avatarId,
        updatedAt: serverTimestamp(),
      });

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    },
    [user]
  );

  const handleAgeGroupChange = (ageGroup: AgeGroup) => {
    void handleUpdatePreferences(profile.displayName, ageGroup, profile.avatarId);
  };

  const handleSelectAvatar = (avatarId: AvatarId) => {
    void handleUpdatePreferences(profile.displayName, profile.ageGroup, avatarId);
  };

  const handleCreateSuggestion = useCallback(
    async (input: {
      title: string;
      category: SuggestionCategory;
      ageGroup: AgeGroup;
      description: string;
    }) => {
      if (!user) return;
      const suggestionId = `sug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const path = `gameSuggestions/${suggestionId}`;
      try {
        await setDoc(doc(db, 'gameSuggestions', suggestionId), {
          authorUid: user.uid,
          authorNickname: sanitizeNickname(profile.displayName),
          authorAvatarId: profile.avatarId,
          title: input.title.trim().slice(0, 80),
          category: input.category,
          ageGroup: input.ageGroup,
          description: input.description.trim().slice(0, 280),
          votesCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [profile.avatarId, profile.displayName, user]
  );

  const handleToggleSuggestionVote = useCallback(
    async (suggestion: GameSuggestion) => {
      if (!user) return;
      const hasVoted = votedSuggestionIds.includes(suggestion.id);
      const batch = writeBatch(db);
      const voteRef = doc(db, 'gameSuggestions', suggestion.id, 'votes', user.uid);
      const userVoteRef = doc(db, 'users', user.uid, 'suggestionVotes', suggestion.id);
      const suggestionRef = doc(db, 'gameSuggestions', suggestion.id);

      if (hasVoted) {
        batch.delete(voteRef);
        batch.delete(userVoteRef);
        batch.update(suggestionRef, {
          votesCount: Math.max(0, suggestion.votesCount - 1),
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(voteRef, {
          uid: user.uid,
          suggestionId: suggestion.id,
          createdAt: serverTimestamp(),
        });
        batch.set(userVoteRef, {
          uid: user.uid,
          suggestionId: suggestion.id,
          createdAt: serverTimestamp(),
        });
        batch.update(suggestionRef, {
          votesCount: suggestion.votesCount + 1,
          updatedAt: serverTimestamp(),
        });
      }

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `gameSuggestions/${suggestion.id}`);
      }
    },
    [user, votedSuggestionIds]
  );

  const handleDeleteSuggestion = useCallback(
    async (suggestionId: string) => {
      if (!user) return;
      const path = `gameSuggestions/${suggestionId}`;
      try {
        await deleteDoc(doc(db, 'gameSuggestions', suggestionId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user]
  );

  const handleStartSpecificGame = useCallback(
    (gameType: QuestionType, scope: GameDifficultyScope) => {
      const scopedLevels = filterLevelsByScope(scope);
      const questions = scopedLevels.flatMap((l) =>
        l.questions.filter((q) => q.type === gameType)
      );
      if (questions.length === 0) return;

      const representativeLevelId =
        scope === 'basic'
          ? 1
          : scope === 'intermediate'
          ? 3
          : scope === 'advanced'
          ? 5
          : profile.unlockedLevel;

      setPlayingLevelId(null);
      setCustomGameLevel({
        id: representativeLevelId,
        worldTitle: 'Práctica libre',
        title: MINIGAME_TITLES[gameType],
        subtitle: 'Práctica libre de minijuego',
        recommendedAges:
          scope === 'basic'
            ? '7-8 años'
            : scope === 'intermediate'
            ? '9-10 años'
            : scope === 'advanced'
            ? '10-11 años'
            : '7-11 años',
        ageGroupTag:
          scope === 'basic'
            ? '7-8'
            : scope === 'advanced'
            ? '11'
            : '9-10',
        concepts: [MINIGAME_TITLES[gameType]],
        artworkUrl: scopedLevels[0]?.artworkUrl ?? '',
        questions,
      });
    },
    [profile.unlockedLevel]
  );

  const handleCompleteSession = useCallback(
    async (
      levelId: number,
      score: number,
      stars: number,
      baseXpEarned: number
    ): Promise<SessionCompletionResult> => {
      const currentWeekKey = getISOWeekKey();
      const todayKey = getCurrentDayKey();
      const base = normalizeWeekState(profile);

      const alreadyPracticedToday = base.weekDaysCompleted.includes(todayKey);
      const nextWeekDays = alreadyPracticedToday
        ? [...base.weekDaysCompleted]
        : [...base.weekDaysCompleted, todayKey].slice(0, 7);
      const addedNewDayToday = !alreadyPracticedToday;

      const weeklyBonusAwarded =
        addedNewDayToday && nextWeekDays.length === 3;
      const totalXpEarned = baseXpEarned + (weeklyBonusAwarded ? 150 : 0);

      const nextXp = Math.min(1000000, base.xp + totalXpEarned);
      const nextWeeklyXp = Math.min(100000, base.weeklyXp + totalXpEarned);
      const nextWeeksCompletedCount = weeklyBonusAwarded
        ? base.weeksCompletedCount + 1
        : base.weeksCompletedCount;

      const isMinigame = customGameLevel !== null;
      const isDiagnostic = !isMinigame && levelId === 0;
      const nextLevelStars = [...base.levelStars];
      if (!isMinigame && !isDiagnostic && stars > nextLevelStars[levelId - 1]) {
        nextLevelStars[levelId - 1] = stars;
      }

      const recommendedLevel = isDiagnostic
        ? score <= 1
          ? 1
          : Math.min(6, score)
        : undefined;

      const candidateUnlock = isMinigame
        ? base.unlockedLevel
        : isDiagnostic
        ? recommendedLevel ?? 1
        : stars >= 1
        ? Math.min(6, levelId + 1)
        : base.unlockedLevel;
      const nextUnlockedLevel = Math.max(base.unlockedLevel, candidateUnlock);
      const newlyUnlockedLevel =
        nextUnlockedLevel > base.unlockedLevel ? nextUnlockedLevel : null;

      // Evaluate Badges
      const existingBadges = new Set(base.badges);
      const newlyUnlockedBadges: string[] = [];
      const grantBadge = (id: string) => {
        if (!existingBadges.has(id)) {
          existingBadges.add(id);
          newlyUnlockedBadges.push(id);
        }
      };

      grantBadge('first_step');
      if (nextWeekDays.length >= 3) grantBadge('three_days');
      if (stars === 3) grantBadge('perfect_ears');
      if (nextUnlockedLevel >= 3) grantBadge('level_three');
      if (nextXp >= 500) grantBadge('xp_500');
      if (nextLevelStars.every((s) => s > 0)) grantBadge('holiday_champion');

      const nextBadges = Array.from(existingBadges).slice(0, 20);
      const nextTotalSessions = base.totalSessions + 1;

      const updatedProfile: StudentProfile = {
        ...base,
        xp: nextXp,
        unlockedLevel: nextUnlockedLevel,
        levelStars: nextLevelStars,
        badges: nextBadges,
        activeWeekKey: currentWeekKey,
        weekDaysCompleted: nextWeekDays,
        weeklyXp: nextWeeklyXp,
        weeksCompletedCount: nextWeeksCompletedCount,
        totalSessions: nextTotalSessions,
      };

      setProfile(updatedProfile);

      const newSessionRecord: PracticeSession = {
        uid: user?.uid ?? 'guest',
        levelId,
        score,
        xpEarned: totalXpEarned,
        stars,
        dayKey: todayKey,
        weekKey: currentWeekKey,
      };

      if (!user) {
        setRecentSessions((prev) => [newSessionRecord, ...prev].slice(0, 10));
      } else {
        const sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const batch = writeBatch(db);
        batch.update(doc(db, 'users', user.uid), {
          xp: nextXp,
          unlockedLevel: nextUnlockedLevel,
          levelStars: nextLevelStars,
          badges: nextBadges,
          activeWeekKey: currentWeekKey,
          weekDaysCompleted: nextWeekDays,
          weeklyXp: nextWeeklyXp,
          weeksCompletedCount: nextWeeksCompletedCount,
          totalSessions: nextTotalSessions,
          updatedAt: serverTimestamp(),
        });
        batch.update(doc(db, 'leaderboard', user.uid), {
          xp: nextXp,
          weeklyXp: nextWeeklyXp,
          activeWeekKey: currentWeekKey,
          weekDaysCount: nextWeekDays.length,
          weeksCompletedCount: nextWeeksCompletedCount,
          unlockedLevel: nextUnlockedLevel,
          badgesCount: nextBadges.length,
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'users', user.uid, 'sessions', sessionId), {
          uid: user.uid,
          levelId,
          score,
          xpEarned: totalXpEarned,
          stars,
          dayKey: todayKey,
          weekKey: currentWeekKey,
          createdAt: serverTimestamp(),
        });

        try {
          await batch.commit();
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }

      return {
        levelId,
        score,
        totalQuestions: customGameLevel ? Math.min(6, customGameLevel.questions.length) : 6,
        stars,
        xpEarned: totalXpEarned,
        recommendedLevel,
        weeklyBonusAwarded,
        newlyUnlockedLevel,
        newlyUnlockedBadges,
        addedNewDayToday,
        newWeekDaysCount: nextWeekDays.length,
      };
    },
    [customGameLevel, profile, user]
  );

  const activeLevel =
    customGameLevel ??
    (playingLevelId === 0
      ? DIAGNOSTIC_LEVEL
      : playingLevelId !== null
      ? LEVELS.find((l) => l.id === playingLevelId) ?? null
      : null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF6EA] via-[#FDF1E4] to-[#FCE9D8] text-slate-900">
      <TopBar
        activeSection={activeSection}
        onNavigate={(section) => {
          setPlayingLevelId(null);
          setCustomGameLevel(null);
          setActiveSection(section);
        }}
        userSignedIn={Boolean(user)}
        profile={profile}
        onSignIn={() => void handleSignIn()}
        onOpenProfile={() => setProfileModalOpen(true)}
        isAuthenticating={isAuthenticating}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {authError && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-4"
          >
            <span>{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="text-xs font-semibold underline shrink-0 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {activeLevel ? (
          <GameArena
            key={customGameLevel ? `mg-${customGameLevel.title}-${customGameLevel.id}` : activeLevel.id}
            level={activeLevel}
            isMinigameMode={Boolean(customGameLevel)}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onExit={() => {
              setPlayingLevelId(null);
              setCustomGameLevel(null);
            }}
            onGoToLevel={(targetLevelId) => {
              setCustomGameLevel(null);
              setPlayingLevelId(targetLevelId);
            }}
            onCompleteSession={handleCompleteSession}
          />
        ) : (
          <>
            {activeSection === 'ruta' && (
              <>
                <HeroBanner
                  profile={profile}
                  userSignedIn={Boolean(user)}
                  onAgeGroupChange={handleAgeGroupChange}
                  onStartLevel={(levelId) => setPlayingLevelId(levelId)}
                  onNavigate={(section) => setActiveSection(section)}
                />
                <LevelMap
                  profile={profile}
                  onStartLevel={(levelId) => setPlayingLevelId(levelId)}
                />
              </>
            )}

            {activeSection === 'juegos' && (
              <GamesHub
                onStartSpecificGame={handleStartSpecificGame}
                userSignedIn={Boolean(user)}
                currentUid={user?.uid ?? null}
                profile={profile}
                suggestions={suggestions}
                votedIds={votedSuggestionIds}
                suggestionsLoading={suggestionsLoading}
                isAuthenticating={isAuthenticating}
                onSignIn={() => void handleSignIn()}
                onCreateSuggestion={handleCreateSuggestion}
                onToggleVote={handleToggleSuggestionVote}
                onDeleteSuggestion={handleDeleteSuggestion}
              />
            )}

            {activeSection === 'reto' && (
              <WeeklyChallenge
                profile={profile}
                recentSessions={recentSessions}
                onStartDailyPractice={() => setPlayingLevelId(profile.unlockedLevel)}
              />
            )}

            {activeSection === 'clasificacion' && (
              <LeaderboardView
                userSignedIn={Boolean(user)}
                currentUid={user?.uid ?? null}
                profile={profile}
                entries={leaderboard}
                loading={leaderboardLoading}
                onSignIn={() => void handleSignIn()}
                isAuthenticating={isAuthenticating}
              />
            )}

            {activeSection === 'recompensas' && (
              <RewardsView
                profile={profile}
                onSelectAvatar={handleSelectAvatar}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-amber-200/70 bg-[#FFFBF5] mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>EnglishCamp · Inglés interactivo para vacaciones escolares (7 a 11 años)</span>
          <span>Meta semanal recomendada: mínimo 3 días de práctica</span>
        </div>
      </footer>

      {profileModalOpen && user && (
        <ProfileModal
          profile={profile}
          onClose={() => setProfileModalOpen(false)}
          onSaveProfile={handleUpdatePreferences}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}
