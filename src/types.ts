export type AgeGroup = '7-8' | '9-10' | '11';

export type AvatarId = 'fox' | 'owl' | 'panda' | 'astronaut' | 'explorer' | 'koala';

export type NavSection = 'ruta' | 'juegos' | 'reto' | 'clasificacion' | 'recompensas';

export interface StudentProfile {
  uid: string;
  displayName: string;
  email?: string;
  ageGroup: AgeGroup;
  avatarId: AvatarId;
  xp: number;
  unlockedLevel: number;
  levelStars: number[]; // Length 6, values 0..3
  badges: string[];
  activeWeekKey: string;
  weekDaysCompleted: string[]; // Array of YYYY-MM-DD strings (max 7)
  weeklyXp: number;
  weeksCompletedCount: number;
  totalSessions: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LeaderboardEntry {
  uid: string;
  nickname: string;
  avatarId: AvatarId;
  ageGroup: AgeGroup;
  xp: number;
  weeklyXp: number;
  activeWeekKey: string;
  weekDaysCount: number;
  weeksCompletedCount: number;
  unlockedLevel: number;
  badgesCount: number;
  updatedAt?: unknown;
}

export interface PracticeSession {
  id?: string;
  uid: string;
  levelId: number;
  score: number;
  xpEarned: number;
  stars: number;
  dayKey: string;
  weekKey: string;
  createdAt?: unknown;
}

export type QuestionType =
  | 'match'
  | 'builder'
  | 'spelling'
  | 'pairs'
  | 'image_choice'
  | 'image_memory';

export type IllustrationId =
  | 'sun'
  | 'backpack'
  | 'apple'
  | 'rainbow'
  | 'fox'
  | 'owl'
  | 'rabbit'
  | 'turtle'
  | 'butterfly'
  | 'river'
  | 'pencil'
  | 'notebook'
  | 'book'
  | 'soccer'
  | 'teacher'
  | 'strawberry'
  | 'bread'
  | 'cheese'
  | 'juice'
  | 'breakfast'
  | 'library'
  | 'bakery'
  | 'sunny'
  | 'rainy'
  | 'jacket'
  | 'bike'
  | 'dolphin'
  | 'park'
  | 'calendar';

export interface MatchQuestion {
  id: string;
  type: 'match';
  promptEs: string;
  englishAudio: string;
  clueSymbol: string;
  options: string[];
  correctAnswer: string;
  tipEs: string;
}

export interface ImageChoiceQuestion {
  id: string;
  type: 'image_choice';
  promptEs: string;
  illustrationId: IllustrationId;
  englishAudio: string;
  options: string[];
  correctAnswer: string;
  tipEs: string;
}

export interface ImageMemoryQuestion {
  id: string;
  type: 'image_memory';
  promptEs: string;
  pairs: Array<{
    id: string;
    illustrationId: IllustrationId;
    en: string;
    es: string;
  }>;
  tipEs: string;
}

export interface BuilderQuestion {
  id: string;
  type: 'builder';
  promptEs: string;
  spanishMeaning: string;
  targetWords: string[];
  extraWords: string[];
  tipEs: string;
}

export interface SpellingQuestion {
  id: string;
  type: 'spelling';
  promptEs: string;
  spanishMeaning: string;
  clueSymbol: string;
  targetWord: string;
  tipEs: string;
}

export interface PairsQuestion {
  id: string;
  type: 'pairs';
  promptEs: string;
  pairs: Array<{ en: string; es: string }>;
  tipEs: string;
}

export type GameQuestion =
  | MatchQuestion
  | ImageChoiceQuestion
  | ImageMemoryQuestion
  | BuilderQuestion
  | SpellingQuestion
  | PairsQuestion;

export interface LevelDefinition {
  id: number;
  worldTitle: string;
  title: string;
  subtitle: string;
  recommendedAges: string;
  ageGroupTag: AgeGroup;
  concepts: string[];
  artworkUrl: string;
  questions: GameQuestion[];
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  requirementLabel: string;
  iconKey: 'compass' | 'calendar' | 'ear' | 'map' | 'trophy' | 'star';
}

export interface AvatarDefinition {
  id: AvatarId;
  name: string;
  title: string;
  unlockRequirement: string;
  minXp: number;
  accentBg: string;
  accentText: string;
}

export type SuggestionCategory =
  | 'vocabulario'
  | 'pronunciacion'
  | 'lectura'
  | 'memoria'
  | 'aventura';

export interface GameSuggestion {
  id: string;
  authorUid: string;
  authorNickname: string;
  authorAvatarId: AvatarId;
  title: string;
  category: SuggestionCategory;
  ageGroup: AgeGroup;
  description: string;
  votesCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}
