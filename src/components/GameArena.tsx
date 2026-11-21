import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Star,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { BADGES, DIAGNOSTIC_TOPICS } from '../data/curriculum';
import type {
  BuilderQuestion,
  GameQuestion,
  IllustrationId,
  ImageChoiceQuestion,
  ImageMemoryQuestion,
  LevelDefinition,
  MatchQuestion,
  PairsQuestion,
  SpellingQuestion,
} from '../types';
import {
  playClickSound,
  playCorrectSound,
  playVictorySound,
  playWrongSound,
  speakEnglish,
} from '../utils/sound';
import { WordIllustration } from './WordIllustration';

type MemoryCardItem =
  | { uid: string; pairId: string; kind: 'image'; illustrationId: IllustrationId; en: string }
  | { uid: string; pairId: string; kind: 'word'; es: string; en: string };

export interface SessionCompletionResult {
  levelId: number;
  score: number;
  totalQuestions: number;
  stars: number;
  xpEarned: number;
  recommendedLevel?: number;
  weeklyBonusAwarded: boolean;
  newlyUnlockedLevel: number | null;
  newlyUnlockedBadges: string[];
  addedNewDayToday: boolean;
  newWeekDaysCount: number;
}

interface GameArenaProps {
  level: LevelDefinition;
  isMinigameMode?: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  onGoToLevel: (levelId: number) => void;
  onCompleteSession: (
    levelId: number,
    score: number,
    stars: number,
    xpEarned: number
  ) => Promise<SessionCompletionResult>;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function GameArena({
  level,
  isMinigameMode = false,
  muted,
  onToggleMute,
  onExit,
  onGoToLevel,
  onCompleteSession,
}: GameArenaProps) {
  const isDiagnostic = level.id === 0;

  const sessionQuestions = useMemo<GameQuestion[]>(() => {
    if (isDiagnostic) {
      return level.questions.slice(0, 6);
    }
    if (isMinigameMode) {
      return shuffleArray(level.questions).slice(0, 6);
    }
    const imageChoices = shuffleArray(
      level.questions.filter((q): q is ImageChoiceQuestion => q.type === 'image_choice')
    );
    const imageMemories = shuffleArray(
      level.questions.filter((q): q is ImageMemoryQuestion => q.type === 'image_memory')
    );
    const chosen: GameQuestion[] = [];
    if (imageChoices.length > 0) chosen.push(imageChoices[0]);
    if (imageMemories.length > 0) chosen.push(imageMemories[0]);
    const chosenIds = new Set(chosen.map((q) => q.id));
    const remaining = shuffleArray(level.questions.filter((q) => !chosenIds.has(q.id)));
    return shuffleArray([...chosen, ...remaining.slice(0, Math.max(0, 6 - chosen.length))]);
  }, [isDiagnostic, isMinigameMode, level]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [sessionXp, setSessionXp] = useState(0);
  const [phase, setPhase] = useState<'PLAYING' | 'FEEDBACK' | 'SUMMARY'>('PLAYING');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [completionResult, setCompletionResult] = useState<SessionCompletionResult | null>(null);
  const [savingResult, setSavingResult] = useState(false);

  const currentQuestion = sessionQuestions[roundIndex];

  // --- Match & Image Choice State ---
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // --- Builder State ---
  const [builderBank, setBuilderBank] = useState<Array<{ id: string; word: string }>>([]);
  const [builderPlaced, setBuilderPlaced] = useState<Array<{ id: string; word: string }>>([]);

  // --- Spelling State ---
  const [spellingLetters, setSpellingLetters] = useState<Array<{ id: string; char: string }>>([]);
  const [spellingPlaced, setSpellingPlaced] = useState<Array<{ id: string; char: string }>>([]);
  const [hintUsed, setHintUsed] = useState(false);

  // --- Pairs State ---
  const [pairsLeft, setPairsLeft] = useState<string[]>([]);
  const [pairsRight, setPairsRight] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedEn, setMatchedEn] = useState<string[]>([]);
  const [pairMistakes, setPairMistakes] = useState(0);
  const [pairMismatchFlash, setPairMismatchFlash] = useState(false);

  // --- Image Memory State ---
  const [memoryCards, setMemoryCards] = useState<MemoryCardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [memoryAttempts, setMemoryAttempts] = useState(0);
  const [memoryLocked, setMemoryLocked] = useState(false);
  const memoryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (memoryTimerRef.current !== null) {
        window.clearTimeout(memoryTimerRef.current);
      }
    };
  }, []);

  // Initialize question-specific state whenever roundIndex changes
  useEffect(() => {
    if (memoryTimerRef.current !== null) {
      window.clearTimeout(memoryTimerRef.current);
      memoryTimerRef.current = null;
    }
    if (!currentQuestion) return;
    setSelectedMatch(null);
    setHintUsed(false);

    if (currentQuestion.type === 'builder') {
      const pool = shuffleArray(
        [...currentQuestion.targetWords, ...currentQuestion.extraWords].map((w, idx) => ({
          id: `${currentQuestion.id}-w-${idx}`,
          word: w,
        }))
      );
      setBuilderBank(pool);
      setBuilderPlaced([]);
    } else if (currentQuestion.type === 'spelling') {
      const extraAlphabet = 'AEIORSTLN';
      const targetChars = currentQuestion.targetWord.split('');
      const distractorCount = targetChars.length <= 5 ? 2 : 1;
      const extras: string[] = [];
      for (let i = 0; i < distractorCount; i++) {
        extras.push(extraAlphabet[(i * 3 + roundIndex) % extraAlphabet.length]);
      }
      const bank = shuffleArray(
        [...targetChars, ...extras].map((c, idx) => ({
          id: `${currentQuestion.id}-c-${idx}`,
          char: c,
        }))
      );
      setSpellingLetters(bank);
      setSpellingPlaced([]);
    } else if (currentQuestion.type === 'pairs') {
      setPairsLeft(shuffleArray(currentQuestion.pairs.map((p) => p.en)));
      setPairsRight(shuffleArray(currentQuestion.pairs.map((p) => p.es)));
      setSelectedLeft(null);
      setMatchedEn([]);
      setPairMistakes(0);
      setPairMismatchFlash(false);
    } else if (currentQuestion.type === 'image_memory') {
      const deck: MemoryCardItem[] = [];
      currentQuestion.pairs.forEach((p) => {
        deck.push({
          uid: `${currentQuestion.id}-${p.id}-img`,
          pairId: p.id,
          kind: 'image',
          illustrationId: p.illustrationId,
          en: p.en,
        });
        deck.push({
          uid: `${currentQuestion.id}-${p.id}-es`,
          pairId: p.id,
          kind: 'word',
          es: p.es,
          en: p.en,
        });
      });
      setMemoryCards(shuffleArray(deck));
      setFlippedUids([]);
      setMatchedPairIds([]);
      setMemoryAttempts(0);
      setMemoryLocked(false);
    }
  }, [currentQuestion, roundIndex]);

  const finishRound = useCallback(
    (isCorrect: boolean, spokenPhrase?: string) => {
      setLastCorrect(isCorrect);
      setRoundResults((prev) => [...prev, isCorrect]);
      setPhase('FEEDBACK');
      if (isCorrect) {
        playCorrectSound(muted);
        setCorrectCount((prev) => prev + 1);
        setSessionXp((prev) => prev + 20);
      } else {
        playWrongSound(muted);
        setSessionXp((prev) => prev + 5);
      }
      if (spokenPhrase) {
        speakEnglish(spokenPhrase);
      }
    },
    [muted]
  );

  const handleNextRound = useCallback(async () => {
    playClickSound(muted);
    if (roundIndex + 1 < sessionQuestions.length) {
      setRoundIndex((prev) => prev + 1);
      setPhase('PLAYING');
      return;
    }

    const total = sessionQuestions.length;
    const finalStars =
      total <= 2
        ? correctCount >= total
          ? 3
          : correctCount >= 1
          ? 2
          : 1
        : correctCount >= total
        ? 3
        : correctCount >= Math.ceil(total * 0.65)
        ? 2
        : 1;
    const totalXp = sessionXp + (finalStars === 3 ? 25 : 10);

    setPhase('SUMMARY');
    playVictorySound(muted);
    setSavingResult(true);
    try {
      const result = await onCompleteSession(level.id, correctCount, finalStars, totalXp);
      setCompletionResult(result);
    } finally {
      setSavingResult(false);
    }
  }, [
    correctCount,
    level.id,
    muted,
    onCompleteSession,
    roundIndex,
    sessionQuestions.length,
    sessionXp,
  ]);

  // --- Match & Image Choice Handler ---
  const handleSelectMatch = useCallback(
    (option: string, q: MatchQuestion | ImageChoiceQuestion) => {
      if (phase !== 'PLAYING') return;
      setSelectedMatch(option);
      finishRound(option === q.correctAnswer, q.englishAudio);
    },
    [finishRound, phase]
  );

  // --- Image Memory Handler ---
  const handleFlipMemoryCard = (card: MemoryCardItem, q: ImageMemoryQuestion) => {
    if (phase !== 'PLAYING' || memoryLocked) return;
    if (flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId)) return;

    playClickSound(muted);
    if (card.kind === 'image') {
      speakEnglish(card.en);
    }

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length < 2) return;

    const firstCard = memoryCards.find((c) => c.uid === nextFlipped[0]);
    if (!firstCard) return;

    const nextAttempts = memoryAttempts + 1;
    setMemoryAttempts(nextAttempts);

    if (firstCard.pairId === card.pairId) {
      playCorrectSound(muted);
      const nextMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(nextMatched);
      setFlippedUids([]);
      if (nextMatched.length === q.pairs.length) {
        finishRound(nextAttempts <= 12);
      }
    } else {
      playWrongSound(muted);
      setMemoryLocked(true);
      memoryTimerRef.current = window.setTimeout(() => {
        setFlippedUids([]);
        setMemoryLocked(false);
        memoryTimerRef.current = null;
      }, 750);
    }
  };

  // Keyboard shortcuts 1-4 for match and image_choice questions
  useEffect(() => {
    if (
      phase !== 'PLAYING' ||
      (currentQuestion?.type !== 'match' && currentQuestion?.type !== 'image_choice')
    ) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = Number.parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < currentQuestion.options.length) {
        handleSelectMatch(currentQuestion.options[idx], currentQuestion);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentQuestion, handleSelectMatch, phase]);

  // --- Builder Handlers ---
  const handlePlaceWord = (item: { id: string; word: string }) => {
    if (phase !== 'PLAYING') return;
    playClickSound(muted);
    setBuilderBank((prev) => prev.filter((x) => x.id !== item.id));
    setBuilderPlaced((prev) => [...prev, item]);
  };

  const handleRemoveWord = (item: { id: string; word: string }) => {
    if (phase !== 'PLAYING') return;
    playClickSound(muted);
    setBuilderPlaced((prev) => prev.filter((x) => x.id !== item.id));
    setBuilderBank((prev) => [...prev, item]);
  };

  const handleCheckBuilder = (q: BuilderQuestion) => {
    if (phase !== 'PLAYING' || builderPlaced.length === 0) return;
    const userSentence = builderPlaced.map((x) => x.word).join(' ');
    const targetSentence = q.targetWords.join(' ');
    finishRound(userSentence === targetSentence, targetSentence);
  };

  // --- Spelling Handlers ---
  const handlePlaceLetter = (item: { id: string; char: string }) => {
    if (phase !== 'PLAYING') return;
    playClickSound(muted);
    setSpellingLetters((prev) => prev.filter((x) => x.id !== item.id));
    setSpellingPlaced((prev) => [...prev, item]);
  };

  const handleRemoveLetter = (item: { id: string; char: string }) => {
    if (phase !== 'PLAYING') return;
    playClickSound(muted);
    setSpellingPlaced((prev) => prev.filter((x) => x.id !== item.id));
    setSpellingLetters((prev) => [...prev, item]);
  };

  const handleSpellingHint = (q: SpellingQuestion) => {
    if (phase !== 'PLAYING' || hintUsed) return;
    const nextIndex = spellingPlaced.length;
    if (nextIndex >= q.targetWord.length) return;
    const neededChar = q.targetWord[nextIndex];
    const matchInBank = spellingLetters.find((item) => item.char === neededChar);
    if (matchInBank) {
      playClickSound(muted);
      setSpellingLetters((prev) => prev.filter((x) => x.id !== matchInBank.id));
      setSpellingPlaced((prev) => [...prev, matchInBank]);
      setHintUsed(true);
    }
  };

  const handleCheckSpelling = (q: SpellingQuestion) => {
    if (phase !== 'PLAYING' || spellingPlaced.length === 0) return;
    const typed = spellingPlaced.map((x) => x.char).join('');
    finishRound(typed === q.targetWord, q.targetWord.toLowerCase());
  };

  // --- Pairs Handlers ---
  const handleSelectRightPair = (esWord: string, q: PairsQuestion) => {
    if (phase !== 'PLAYING' || !selectedLeft) return;
    const expected = q.pairs.find((p) => p.en === selectedLeft);
    if (expected && expected.es === esWord) {
      playCorrectSound(muted);
      speakEnglish(selectedLeft);
      const updated = [...matchedEn, selectedLeft];
      setMatchedEn(updated);
      setSelectedLeft(null);
      if (updated.length === q.pairs.length) {
        finishRound(pairMistakes <= 1);
      }
    } else {
      playWrongSound(muted);
      setPairMistakes((prev) => prev + 1);
      setPairMismatchFlash(true);
      setSelectedLeft(null);
      setTimeout(() => setPairMismatchFlash(false), 450);
    }
  };

  if (phase === 'SUMMARY') {
    const total = sessionQuestions.length;
    const fallbackStars =
      total <= 2
        ? correctCount >= total
          ? 3
          : correctCount >= 1
          ? 2
          : 1
        : correctCount >= total
        ? 3
        : correctCount >= Math.ceil(total * 0.65)
        ? 2
        : 1;
    const stars = completionResult?.stars ?? fallbackStars;
    const totalXpShown = completionResult?.xpEarned ?? sessionXp;
    const recommendedLevel =
      completionResult?.recommendedLevel ?? (correctCount <= 1 ? 1 : Math.min(6, correctCount));
    const unlockedBadgeDefs = (completionResult?.newlyUnlockedBadges ?? [])
      .map((id) => BADGES.find((b) => b.id === id))
      .filter((b): b is NonNullable<typeof b> => Boolean(b));

    return (
      <section className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          {!isDiagnostic && (
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-10 h-10 transition-transform ${
                    n <= stars ? 'text-amber-500 fill-amber-400 scale-105' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          )}
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {isDiagnostic
              ? `Resultado del Diagnóstico: Nivel ${recommendedLevel}`
              : stars === 3
              ? '¡Misión perfecta!'
              : stars === 2
              ? '¡Muy buen trabajo!'
              : '¡Buen repaso completado!'}
          </h2>
          <p className="text-sm text-slate-600">
            {level.title} · {correctCount} de {sessionQuestions.length} aciertos
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <div>
            <span className="block text-xs text-slate-500">Puntos ganados</span>
            <span className="font-mono text-xl font-bold text-blue-700 tabular-nums">
              +{totalXpShown} XP
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Días esta semana</span>
            <span className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
              {completionResult ? `${completionResult.newWeekDaysCount} / 3` : '—'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">
              {isDiagnostic ? 'Nivel ubicado' : 'Estrellas'}
            </span>
            <span className="font-mono text-xl font-bold text-amber-600 tabular-nums">
              {isDiagnostic ? `Nivel ${recommendedLevel}` : `${stars} / 3`}
            </span>
          </div>
        </div>

        {isDiagnostic && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-600">
              Diagnóstico por nivel del colegio:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIAGNOSTIC_TOPICS.map((topic, idx) => {
                const passed = roundResults[idx] === true;
                return (
                  <div
                    key={topic}
                    className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs ${
                      passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <span className="font-medium truncate">{topic}</span>
                    <span className="font-semibold shrink-0">
                      {passed ? 'Dominado' : 'Por reforzar'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completionResult?.addedNewDayToday && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
            <span className="font-semibold">¡Día de práctica registrado!</span>{' '}
            {completionResult.newWeekDaysCount >= 3
              ? 'Cumpliste la meta mínima de 3 días esta semana.'
              : `Llevas ${completionResult.newWeekDaysCount} de 3 días esta semana.`}
            {completionResult.weeklyBonusAwarded && (
              <span className="block mt-1 font-semibold">
                +150 XP extra desbloqueados por completar el Reto Semanal.
              </span>
            )}
          </div>
        )}

        {!isMinigameMode && completionResult?.newlyUnlockedLevel && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 font-medium">
            {isDiagnostic
              ? `¡Ubicación completada! Quedaron desbloqueados los niveles hasta el Nivel ${completionResult.newlyUnlockedLevel}.`
              : `¡Nuevo nivel desbloqueado! Ya puedes jugar el Nivel ${completionResult.newlyUnlockedLevel}.`}
          </div>
        )}

        {unlockedBadgeDefs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-800">
              Insignia nueva conseguida:
            </p>
            {unlockedBadgeDefs.map((b) => (
              <div key={b.id} className="text-sm font-bold text-slate-900">
                {b.title} — <span className="font-normal text-slate-700">{b.description}</span>
              </div>
            ))}
          </div>
        )}

        {savingResult && (
          <p className="text-xs text-center text-slate-500">Guardando progreso...</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setRoundIndex(0);
              setCorrectCount(0);
              setRoundResults([]);
              setSessionXp(0);
              setCompletionResult(null);
              setPhase('PLAYING');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {isDiagnostic ? 'Repetir diagnóstico' : 'Jugar de nuevo'}
          </button>
          {isDiagnostic ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setRoundIndex(0);
                  setCorrectCount(0);
                  setRoundResults([]);
                  setSessionXp(0);
                  setCompletionResult(null);
                  setPhase('PLAYING');
                  onGoToLevel(recommendedLevel);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Ir al Nivel {recommendedLevel}
              </button>
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Ver ruta
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {isMinigameMode ? 'Volver a Juegos' : 'Volver a la ruta'}
            </button>
          )}
        </div>
      </section>
    );
  }

  const progressPct = ((roundIndex + (phase === 'FEEDBACK' ? 1 : 0)) / sessionQuestions.length) * 100;

  return (
    <section className="max-w-3xl mx-auto space-y-5">
      {/* Unobtrusive Top Game HUD */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Salir
        </button>

        <div className="flex-1 max-w-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="truncate">{level.title}</span>
            <span className="tabular-nums shrink-0 ml-2">
              {roundIndex + 1} / {sessionQuestions.length}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs sm:text-sm font-bold text-amber-700 tabular-nums">
            +{sessionXp} XP
          </span>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Activar sonidos' : 'Silenciar sonidos'}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Play Stage */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            {currentQuestion.type === 'match' && 'Mini-juego: Atrapa la Palabra'}
            {currentQuestion.type === 'image_choice' && 'Mini-juego: Describe la Imagen'}
            {currentQuestion.type === 'image_memory' && 'Mini-juego: Memoria de Imágenes'}
            {currentQuestion.type === 'builder' && 'Mini-juego: Constructor de Oraciones'}
            {currentQuestion.type === 'spelling' && 'Mini-juego: Deletreo Relámpago'}
            {currentQuestion.type === 'pairs' && 'Mini-juego: Parejas de Palabras'}
          </span>
          <span>Ronda {roundIndex + 1}</span>
        </div>

        {/* Question Type 1: MATCH */}
        {currentQuestion.type === 'match' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-3xl shrink-0"
                  aria-hidden="true"
                >
                  {currentQuestion.clueSymbol}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {currentQuestion.promptEs}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => speakEnglish(currentQuestion.englishAudio)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Escuchar en inglés
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedMatch === option;
                const isCorrectOpt = option === currentQuestion.correctAnswer;
                let styleClass =
                  'bg-white border-slate-200 text-slate-900 hover:border-blue-400 hover:bg-blue-50/40';
                if (phase === 'FEEDBACK') {
                  if (isCorrectOpt) {
                    styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-900';
                  } else if (isSelected && !isCorrectOpt) {
                    styleClass = 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    styleClass = 'bg-slate-50 border-slate-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={phase !== 'PLAYING'}
                    onClick={() => handleSelectMatch(option, currentQuestion)}
                    className={`min-h-[58px] px-5 py-3.5 rounded-xl border-2 text-left font-semibold text-base flex items-center justify-between gap-3 transition-all cursor-pointer disabled:cursor-default ${styleClass}`}
                  >
                    <span>{option}</span>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Type 2: BUILDER */}
        {currentQuestion.type === 'builder' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                {currentQuestion.promptEs}
              </h3>
              <p className="text-sm text-slate-600">
                Significado: <span className="font-semibold text-slate-800">{currentQuestion.spanishMeaning}</span>
              </p>
            </div>

            {/* Sentence Tray */}
            <div className="min-h-[76px] p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-wrap items-center gap-2">
              {builderPlaced.length === 0 ? (
                <span className="text-sm text-slate-400">
                  Toca las palabras de abajo en el orden correcto...
                </span>
              ) : (
                builderPlaced.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={phase !== 'PLAYING'}
                    onClick={() => handleRemoveWord(item)}
                    className="px-4 py-2 rounded-xl bg-white border border-blue-300 text-slate-900 font-semibold text-sm shadow-xs hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                  >
                    {item.word}
                  </button>
                ))
              )}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap items-center gap-2.5">
              {builderBank.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={phase !== 'PLAYING'}
                  onClick={() => handlePlaceWord(item)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {item.word}
                </button>
              ))}
            </div>

            {phase === 'PLAYING' && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => speakEnglish(currentQuestion.targetWords.join(' '))}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Escuchar pista
                </button>
                <button
                  type="button"
                  disabled={builderPlaced.length === 0}
                  onClick={() => handleCheckBuilder(currentQuestion)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-45 transition-colors cursor-pointer"
                >
                  Comprobar oración
                </button>
              </div>
            )}
          </div>
        )}

        {/* Question Type 3: SPELLING */}
        {currentQuestion.type === 'spelling' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shrink-0"
                  aria-hidden="true"
                >
                  {currentQuestion.clueSymbol}
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                    {currentQuestion.promptEs}
                  </h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Palabra de {currentQuestion.targetWord.length} letras
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => speakEnglish(currentQuestion.targetWord.toLowerCase())}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Escuchar palabra
              </button>
            </div>

            {/* Letter Slots */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-3">
              {Array.from({ length: currentQuestion.targetWord.length }, (_, idx) => {
                const placed = spellingPlaced[idx];
                return placed ? (
                  <button
                    key={placed.id}
                    type="button"
                    disabled={phase !== 'PLAYING'}
                    onClick={() => handleRemoveLetter(placed)}
                    className="w-12 h-14 rounded-xl bg-blue-600 text-white font-mono text-xl font-bold flex items-center justify-center shadow-xs hover:bg-blue-700 cursor-pointer"
                  >
                    {placed.char}
                  </button>
                ) : (
                  <div
                    key={`slot-${idx}`}
                    className="w-12 h-14 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center font-mono text-slate-400"
                  >
                    _
                  </div>
                );
              })}
            </div>

            {/* Letter Tile Bank */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {spellingLetters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={phase !== 'PLAYING'}
                  onClick={() => handlePlaceLetter(item)}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-lg font-bold hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {item.char}
                </button>
              ))}
            </div>

            {phase === 'PLAYING' && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={hintUsed}
                  onClick={() => handleSpellingHint(currentQuestion)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold hover:bg-amber-100 disabled:opacity-50 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  {hintUsed ? 'Pista usada' : 'Pista (1 letra)'}
                </button>
                <button
                  type="button"
                  disabled={spellingPlaced.length !== currentQuestion.targetWord.length}
                  onClick={() => handleCheckSpelling(currentQuestion)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-45 transition-colors cursor-pointer"
                >
                  Comprobar palabra
                </button>
              </div>
            )}
          </div>
        )}

        {/* Question Type 4: PAIRS */}
        {currentQuestion.type === 'pairs' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                {currentQuestion.promptEs}
              </h3>
              <span className="text-xs font-semibold text-slate-500 tabular-nums shrink-0">
                {matchedEn.length} / {currentQuestion.pairs.length} parejas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <span className="block text-xs font-semibold text-slate-500">Inglés</span>
                {pairsLeft.map((enWord) => {
                  const isMatched = matchedEn.includes(enWord);
                  const isSelected = selectedLeft === enWord;
                  return (
                    <button
                      key={enWord}
                      type="button"
                      disabled={isMatched || phase !== 'PLAYING'}
                      onClick={() => {
                        playClickSound(muted);
                        speakEnglish(enWord);
                        setSelectedLeft(enWord);
                      }}
                      className={`w-full min-h-[50px] px-4 py-2.5 rounded-xl border-2 text-left font-semibold text-sm sm:text-base transition-all cursor-pointer ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-75'
                          : isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-900 hover:border-blue-400'
                      }`}
                    >
                      {enWord}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2.5">
                <span className="block text-xs font-semibold text-slate-500">Español</span>
                {pairsRight.map((esWord) => {
                  const matchedPair = currentQuestion.pairs.find(
                    (p) => p.es === esWord && matchedEn.includes(p.en)
                  );
                  return (
                    <button
                      key={esWord}
                      type="button"
                      disabled={Boolean(matchedPair) || phase !== 'PLAYING'}
                      onClick={() => handleSelectRightPair(esWord, currentQuestion)}
                      className={`w-full min-h-[50px] px-4 py-2.5 rounded-xl border-2 text-left font-semibold text-sm sm:text-base transition-all cursor-pointer ${
                        matchedPair
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-75'
                          : pairMismatchFlash
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : selectedLeft
                          ? 'bg-white border-blue-200 text-slate-900 hover:border-blue-500 hover:bg-blue-50/40'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {esWord}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Question Type 5: IMAGE CHOICE (Describe la Imagen) */}
        {currentQuestion.type === 'image_choice' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-2 rounded-2xl bg-amber-50/70 border border-amber-200 shrink-0">
                <WordIllustration id={currentQuestion.illustrationId} className="w-32 h-32" />
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {currentQuestion.promptEs}
                </h3>
                <button
                  type="button"
                  onClick={() => speakEnglish(currentQuestion.englishAudio)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Escuchar pista en inglés
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedMatch === option;
                const isCorrectOpt = option === currentQuestion.correctAnswer;
                let styleClass =
                  'bg-white border-slate-200 text-slate-900 hover:border-blue-400 hover:bg-blue-50/40';
                if (phase === 'FEEDBACK') {
                  if (isCorrectOpt) {
                    styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-900';
                  } else if (isSelected && !isCorrectOpt) {
                    styleClass = 'bg-rose-50 border-rose-400 text-rose-900';
                  } else {
                    styleClass = 'bg-slate-50 border-slate-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={phase !== 'PLAYING'}
                    onClick={() => handleSelectMatch(option, currentQuestion)}
                    className={`min-h-[58px] px-5 py-3.5 rounded-xl border-2 text-left font-semibold text-base flex items-center justify-between gap-3 transition-all cursor-pointer disabled:cursor-default ${styleClass}`}
                  >
                    <span>{option}</span>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Type 6: IMAGE MEMORY (Memoria Imagen + Español) */}
        {currentQuestion.type === 'image_memory' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                {currentQuestion.promptEs}
              </h3>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 tabular-nums shrink-0">
                <span>
                  {matchedPairIds.length} / {currentQuestion.pairs.length} parejas
                </span>
                <span aria-hidden="true">·</span>
                <span>Intentos: {memoryAttempts}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {memoryCards.map((card, idx) => {
                const isMatched = matchedPairIds.includes(card.pairId);
                const isFlipped = isMatched || flippedUids.includes(card.uid);

                return (
                  <button
                    key={card.uid}
                    type="button"
                    disabled={isFlipped || memoryLocked || phase !== 'PLAYING'}
                    onClick={() => handleFlipMemoryCard(card, currentQuestion)}
                    aria-label={
                      isFlipped
                        ? card.kind === 'image'
                          ? `Imagen ${card.en}`
                          : `Palabra ${card.es}`
                        : `Voltear carta ${idx + 1}`
                    }
                    className={`min-h-[136px] rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-1.5 transition-transform duration-150 cursor-pointer disabled:cursor-default ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                        : isFlipped
                        ? 'bg-white border-blue-500 text-slate-900 shadow-xs'
                        : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 hover:-translate-y-0.5'
                    }`}
                  >
                    {!isFlipped ? (
                      <>
                        <span className="font-mono text-lg font-bold tabular-nums">
                          ?
                        </span>
                        <span className="text-[11px] font-semibold text-amber-800">
                          Carta {idx + 1}
                        </span>
                      </>
                    ) : card.kind === 'image' ? (
                      <>
                        <WordIllustration
                          id={card.illustrationId}
                          className="w-16 h-16"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {card.en}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Español
                        </span>
                        <span className="font-display text-base font-bold text-slate-900 text-center leading-tight">
                          {card.es}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Constructive Feedback Banner */}
        {phase === 'FEEDBACK' && (
          <div
            className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              lastCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {lastCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-sm">
                <p className="font-bold">
                  {lastCorrect
                    ? '¡Excelente! Respuesta correcta (+20 XP)'
                    : '¡Casi! Revisa la respuesta para recordarla (+5 XP)'}
                </p>
                {!lastCorrect &&
                  (currentQuestion.type === 'match' ||
                    currentQuestion.type === 'image_choice') && (
                    <p className="font-semibold">
                      Respuesta correcta: {currentQuestion.correctAnswer}
                    </p>
                  )}
                {!lastCorrect && currentQuestion.type === 'builder' && (
                  <p className="font-semibold">
                    Oración correcta: {currentQuestion.targetWords.join(' ')}
                  </p>
                )}
                {!lastCorrect && currentQuestion.type === 'spelling' && (
                  <p className="font-semibold">
                    Se escribe: {currentQuestion.targetWord}
                  </p>
                )}
                <p className="text-xs opacity-90">{currentQuestion.tipEs}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleNextRound()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {roundIndex + 1 < sessionQuestions.length ? 'Siguiente ronda' : 'Ver resultado'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
