import { useMemo, useState } from 'react';
import {
  Blocks,
  Columns2,
  Grid2x2,
  Image as ImageIcon,
  Keyboard,
  Lightbulb,
  Play,
  Volume2,
} from 'lucide-react';
import { LEVELS } from '../data/curriculum';
import type {
  AgeGroup,
  GameSuggestion,
  IllustrationId,
  QuestionType,
  StudentProfile,
  SuggestionCategory,
} from '../types';
import { GameSuggestionsPanel } from './GameSuggestionsPanel';
import { WordIllustration } from './WordIllustration';

export type GameDifficultyScope = 'all' | 'basic' | 'intermediate' | 'advanced';

interface GamesHubProps {
  onStartSpecificGame: (gameType: QuestionType, scope: GameDifficultyScope) => void;
  userSignedIn: boolean;
  currentUid: string | null;
  profile: StudentProfile;
  suggestions: GameSuggestion[];
  votedIds: string[];
  suggestionsLoading: boolean;
  isAuthenticating: boolean;
  onSignIn: () => void;
  onCreateSuggestion: (input: {
    title: string;
    category: SuggestionCategory;
    ageGroup: AgeGroup;
    description: string;
  }) => Promise<void>;
  onToggleVote: (suggestion: GameSuggestion) => Promise<void>;
  onDeleteSuggestion: (suggestionId: string) => Promise<void>;
}

interface GameCatalogItem {
  type: QuestionType;
  title: string;
  subtitle: string;
  skillLabel: string;
  previewIllustration?: IllustrationId;
  iconKey: 'image' | 'memory' | 'audio' | 'builder' | 'spelling' | 'pairs';
}

const GAME_CATALOG: GameCatalogItem[] = [
  {
    type: 'image_choice',
    title: 'Describe la Imagen',
    subtitle: 'Observa la ilustración y elige qué palabra o frase en inglés la describe.',
    skillLabel: 'Vocabulario visual · Lectura',
    previewIllustration: 'rainbow',
    iconKey: 'image',
  },
  {
    type: 'image_memory',
    title: 'Memoria de Imágenes',
    subtitle: 'Voltea cartas boca abajo y une cada imagen en inglés con su palabra en español.',
    skillLabel: 'Memoria visual · Traducción',
    previewIllustration: 'fox',
    iconKey: 'memory',
  },
  {
    type: 'match',
    title: 'Atrapa la Palabra',
    subtitle: 'Escucha la pronunciación en inglés y selecciona el significado correcto.',
    skillLabel: 'Comprensión auditiva',
    iconKey: 'audio',
  },
  {
    type: 'builder',
    title: 'Constructor de Oraciones',
    subtitle: 'Ordena las palabras sueltas para construir frases reales en inglés.',
    skillLabel: 'Gramática · Orden de palabras',
    iconKey: 'builder',
  },
  {
    type: 'spelling',
    title: 'Deletreo Relámpago',
    subtitle: 'Completa cada palabra letra por letra usando el banco de letras y pistas.',
    skillLabel: 'Ortografía en inglés',
    iconKey: 'spelling',
  },
  {
    type: 'pairs',
    title: 'Parejas de Palabras',
    subtitle: 'Conecta columnas de palabras en inglés con su significado en español.',
    skillLabel: 'Vocabulario rápido',
    iconKey: 'pairs',
  },
];

const SCOPE_OPTIONS: Array<{ id: GameDifficultyScope; label: string }> = [
  { id: 'all', label: 'Todos los niveles (1–6)' },
  { id: 'basic', label: '7–8 años (Niveles 1–2)' },
  { id: 'intermediate', label: '9–10 años (Niveles 3–4)' },
  { id: 'advanced', label: '10–11 años (Niveles 5–6)' },
];

export function filterLevelsByScope(scope: GameDifficultyScope) {
  switch (scope) {
    case 'basic':
      return LEVELS.filter((l) => l.id <= 2);
    case 'intermediate':
      return LEVELS.filter((l) => l.id >= 3 && l.id <= 4);
    case 'advanced':
      return LEVELS.filter((l) => l.id >= 5);
    case 'all':
    default:
      return LEVELS;
  }
}

function renderGameIcon(iconKey: GameCatalogItem['iconKey']) {
  const cls = 'w-6 h-6 text-blue-700';
  switch (iconKey) {
    case 'image':
      return <ImageIcon className={cls} />;
    case 'memory':
      return <Grid2x2 className={cls} />;
    case 'audio':
      return <Volume2 className={cls} />;
    case 'builder':
      return <Blocks className={cls} />;
    case 'spelling':
      return <Keyboard className={cls} />;
    case 'pairs':
    default:
      return <Columns2 className={cls} />;
  }
}

export function GamesHub({
  onStartSpecificGame,
  userSignedIn,
  currentUid,
  profile,
  suggestions,
  votedIds,
  suggestionsLoading,
  isAuthenticating,
  onSignIn,
  onCreateSuggestion,
  onToggleVote,
  onDeleteSuggestion,
}: GamesHubProps) {
  const [scope, setScope] = useState<GameDifficultyScope>('all');

  const countsByType = useMemo(() => {
    const scopedLevels = filterLevelsByScope(scope);
    const map: Record<QuestionType, number> = {
      image_choice: 0,
      image_memory: 0,
      match: 0,
      builder: 0,
      spelling: 0,
      pairs: 0,
    };
    scopedLevels.forEach((lvl) => {
      lvl.questions.forEach((q) => {
        map[q.type] += 1;
      });
    });
    return map;
  }, [scope]);

  const scrollToSuggestions = () => {
    const el = document.getElementById('panel-sugerencias');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Práctica libre por minijuego</span>
              <span aria-hidden="true">·</span>
              <span>Suma XP y días para el reto semanal</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Elige el juego que quieres practicar hoy
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Selecciona una dificultad y entra directamente a tu minijuego favorito: describe imágenes, juega al memorama en español, arma oraciones o practica deletreo.
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToSuggestions}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs sm:text-sm font-semibold hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 self-start cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-700" aria-hidden="true" />
            Sugerir un juego nuevo
          </button>
        </div>

        {/* Difficulty Scope Selector */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-slate-600">
            Dificultad de las preguntas:
          </span>
          <div
            role="group"
            aria-label="Filtrar juegos por dificultad"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200"
          >
            {SCOPE_OPTIONS.map((opt) => {
              const active = scope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setScope(opt.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6 Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAME_CATALOG.map((game) => {
          const availableCount = countsByType[game.type];
          return (
            <article
              key={game.type}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-5 hover:border-blue-300 transition-colors shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  {game.previewIllustration ? (
                    <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-200 shrink-0">
                      <WordIllustration
                        id={game.previewIllustration}
                        className="w-12 h-12"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      {renderGameIcon(game.iconKey)}
                    </div>
                  )}

                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {availableCount} {availableCount === 1 ? 'reto' : 'retos'}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {game.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    {game.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500 truncate">
                  {game.skillLabel}
                </span>

                <button
                  type="button"
                  disabled={availableCount === 0}
                  onClick={() => onStartSpecificGame(game.type, scope)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 disabled:opacity-45 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Jugar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Dedicated Community Game Suggestions & Ideas Panel */}
      <GameSuggestionsPanel
        userSignedIn={userSignedIn}
        currentUid={currentUid}
        profile={profile}
        suggestions={suggestions}
        votedIds={votedIds}
        loading={suggestionsLoading}
        isAuthenticating={isAuthenticating}
        onSignIn={onSignIn}
        onCreateSuggestion={onCreateSuggestion}
        onToggleVote={onToggleVote}
        onDeleteSuggestion={onDeleteSuggestion}
      />
    </section>
  );
}
