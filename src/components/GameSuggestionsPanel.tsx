import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  LogIn,
  Send,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import type {
  AgeGroup,
  GameSuggestion,
  StudentProfile,
  SuggestionCategory,
} from '../types';
import { AvatarIcon } from './AvatarIcon';

interface GameSuggestionsPanelProps {
  userSignedIn: boolean;
  currentUid: string | null;
  profile: StudentProfile;
  suggestions: GameSuggestion[];
  votedIds: string[];
  loading: boolean;
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

const CATEGORY_OPTIONS: Array<{ id: SuggestionCategory; label: string }> = [
  { id: 'vocabulario', label: 'Vocabulario' },
  { id: 'memoria', label: 'Memoria' },
  { id: 'pronunciacion', label: 'Pronunciación' },
  { id: 'lectura', label: 'Lectura' },
  { id: 'aventura', label: 'Aventura' },
];

const CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  vocabulario: 'Vocabulario',
  pronunciacion: 'Pronunciación',
  lectura: 'Lectura',
  memoria: 'Memoria',
  aventura: 'Aventura',
};

const AGE_OPTIONS: Array<{ id: AgeGroup; label: string }> = [
  { id: '7-8', label: '7–8 años' },
  { id: '9-10', label: '9–10 años' },
  { id: '11', label: '11 años' },
];

const QUICK_IDEA_TEMPLATES: Array<{
  label: string;
  title: string;
  category: SuggestionCategory;
  description: string;
}> = [
  {
    label: 'Sopa de letras',
    title: 'Sopa de letras de animales y colores',
    category: 'vocabulario',
    description:
      'Encontrar palabras escondidas en inglés con dibujos de pistas para repasar vocabulario del colegio.',
  },
  {
    label: 'Reto de voz',
    title: 'Aventura con micrófono para pronunciar',
    category: 'pronunciacion',
    description:
      'Decir en voz alta el nombre del objeto o animal que aparece en pantalla para avanzar por el mapa.',
  },
  {
    label: 'Cómic interactivo',
    title: 'Historias cortas con preguntas',
    category: 'lectura',
    description:
      'Leer un mini cómic en inglés con diálogos sencillos y elegir cómo continúa la aventura.',
  },
];

function formatCreatedAt(createdAt: unknown): string {
  const seconds = (createdAt as { seconds?: number } | undefined)?.seconds;
  if (!seconds) return 'Recién enviada';
  return new Date(seconds * 1000).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function GameSuggestionsPanel({
  userSignedIn,
  currentUid,
  profile,
  suggestions,
  votedIds,
  loading,
  isAuthenticating,
  onSignIn,
  onCreateSuggestion,
  onToggleVote,
  onDeleteSuggestion,
}: GameSuggestionsPanelProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SuggestionCategory>('vocabulario');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(profile.ageGroup);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busySuggestionId, setBusySuggestionId] = useState<string | null>(null);
  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [filterCategory, setFilterCategory] = useState<'all' | SuggestionCategory>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

  const votedSet = useMemo(() => new Set(votedIds), [votedIds]);

  const displayedSuggestions = useMemo(() => {
    const filtered =
      filterCategory === 'all'
        ? suggestions
        : suggestions.filter((item) => item.category === filterCategory);

    return [...filtered].sort((a, b) => {
      if (sortBy === 'votes' && b.votesCount !== a.votesCount) {
        return b.votesCount - a.votesCount;
      }
      const aSec = (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
      const bSec = (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
      return bSec - aSec;
    });
  }, [filterCategory, sortBy, suggestions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (cleanTitle.length < 3) {
      setFormFeedback({
        type: 'error',
        message: 'Escribe un nombre de al menos 3 letras para tu idea de juego.',
      });
      return;
    }
    if (cleanDesc.length < 5) {
      setFormFeedback({
        type: 'error',
        message: 'Cuéntanos brevemente cómo se jugaría (mínimo 5 letras).',
      });
      return;
    }

    setSubmitting(true);
    setFormFeedback(null);
    try {
      await onCreateSuggestion({
        title: cleanTitle.slice(0, 80),
        category,
        ageGroup,
        description: cleanDesc.slice(0, 280),
      });
      setTitle('');
      setDescription('');
      setFormFeedback({
        type: 'success',
        message: '¡Idea publicada! Ya aparece en el muro para que otros compañeros puedan votarla.',
      });
    } catch {
      setFormFeedback({
        type: 'error',
        message: 'No pudimos guardar tu sugerencia ahora. Inténtalo nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteClick = async (suggestion: GameSuggestion) => {
    if (busySuggestionId) return;
    setBusySuggestionId(suggestion.id);
    try {
      await onToggleVote(suggestion);
    } catch {
      setFormFeedback({
        type: 'error',
        message: 'No pudimos actualizar tu voto en este momento.',
      });
    } finally {
      setBusySuggestionId(null);
    }
  };

  const handleDeleteClick = async (suggestionId: string) => {
    if (busySuggestionId) return;
    setBusySuggestionId(suggestionId);
    try {
      await onDeleteSuggestion(suggestionId);
    } catch {
      setFormFeedback({
        type: 'error',
        message: 'No pudimos eliminar la sugerencia en este momento.',
      });
    } finally {
      setBusySuggestionId(null);
    }
  };

  return (
    <section
      id="panel-sugerencias"
      aria-labelledby="sugerencias-heading"
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Buzón de exploradores</span>
            <span aria-hidden="true">·</span>
            <span>Nuevas ideas para próximas vacaciones</span>
          </div>
          <h2
            id="sugerencias-heading"
            className="font-display text-2xl font-bold text-slate-900"
          >
            Panel de sugerencias e ideas de juegos
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            ¿Qué otro minijuego te gustaría tener en EnglishCamp? Comparte tu idea y vota por las propuestas de otros estudiantes para inspirar los próximos niveles.
          </p>
        </div>

        {userSignedIn && (
          <div className="text-xs font-semibold text-slate-600 tabular-nums shrink-0">
            {suggestions.length} {suggestions.length === 1 ? 'idea propuesta' : 'ideas propuestas'}
          </div>
        )}
      </div>

      {!userSignedIn ? (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-amber-600">
            <Lightbulb className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Inicia sesión para proponer y votar ideas
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Con tu cuenta de Google puedes enviar ideas nuevas usando solo tu apodo de explorador y apoyar tus juegos favoritos.
            </p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            disabled={isAuthenticating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {isAuthenticating ? 'Conectando...' : 'Entrar con Google'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Zone: Suggestion Submission Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Propón un juego nuevo
              </h3>
              <p className="text-xs text-slate-500">
                Publicando como <span className="font-semibold text-slate-700">{profile.displayName}</span>
              </p>
            </div>

            {/* Quick inspiration starters */}
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-500">
                ¿Necesitas inspiración? Prueba una base rápida:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_IDEA_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => {
                      setTitle(tpl.title);
                      setCategory(tpl.category);
                      setDescription(tpl.description);
                      setFormFeedback(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="suggestion-title"
                className="block text-xs font-semibold text-slate-700"
              >
                Nombre del juego que te gustaría
              </label>
              <input
                id="suggestion-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="Ej: Bingo de verbos en inglés"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600 focus:border-transparent"
              />
              <div className="flex justify-end text-[11px] text-slate-400 tabular-nums">
                {title.trim().length} / 80
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-700">
                ¿Qué habilidad practicaría?
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((opt) => {
                  const active = category === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCategory(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-700">
                Edad recomendada
              </span>
              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {AGE_OPTIONS.map((opt) => {
                  const active = ageGroup === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAgeGroup(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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

            <div className="space-y-1.5">
              <label
                htmlFor="suggestion-desc"
                className="block text-xs font-semibold text-slate-700"
              >
                ¿Cómo se jugaría?
              </label>
              <textarea
                id="suggestion-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={280}
                placeholder="Describe qué tendrías que hacer para ganar puntos o estrellas..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600 focus:border-transparent resize-none"
              />
              <div className="flex justify-end text-[11px] text-slate-400 tabular-nums">
                {description.trim().length} / 280
              </div>
            </div>

            {formFeedback && (
              <div
                role={formFeedback.type === 'error' ? 'alert' : 'status'}
                className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium flex items-start gap-2 ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <span>{formFeedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-55 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Publicando idea...' : 'Enviar sugerencia'}
            </button>
          </form>

          {/* Right Zone: Community Suggestions Wall */}
          <div className="lg:col-span-7 space-y-4 lg:border-l lg:border-slate-100 lg:pl-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Filtrar ideas por categoría"
                className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filterCategory === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas
                </button>
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilterCategory(opt.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      filterCategory === opt.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div
                role="group"
                aria-label="Ordenar sugerencias"
                className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto"
              >
                <button
                  type="button"
                  onClick={() => setSortBy('votes')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    sortBy === 'votes'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Más votadas
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('recent')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    sortBy === 'recent'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Recientes
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Cargando ideas de juegos...
              </div>
            ) : displayedSuggestions.length === 0 ? (
              <div className="py-10 px-4 rounded-xl border border-dashed border-slate-200 text-center space-y-1.5">
                <p className="text-sm font-semibold text-slate-700">
                  {filterCategory === 'all'
                    ? 'Todavía no hay sugerencias guardadas.'
                    : 'No hay sugerencias en esta categoría todavía.'}
                </p>
                <p className="text-xs text-slate-500">
                  Usa el formulario para proponer el primer juego que te gustaría ver en EnglishCamp.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {displayedSuggestions.map((item) => {
                  const hasVoted = votedSet.has(item.id);
                  const isMine = item.authorUid === currentUid;
                  const isBusy = busySuggestionId === item.id;

                  return (
                    <li
                      key={item.id}
                      className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <AvatarIcon avatarId={item.authorAvatarId} size="sm" />
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">
                              {CATEGORY_LABELS[item.category]}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{item.ageGroup} años</span>
                            <span aria-hidden="true">·</span>
                            <span>por {item.authorNickname}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatCreatedAt(item.createdAt)}</span>
                          </div>
                          <h4 className="font-display text-base font-bold text-slate-900">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 sm:pt-1">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleVoteClick(item)}
                          aria-pressed={hasVoted}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-55 ${
                            hasVoted
                              ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700'
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`}
                            aria-hidden="true"
                          />
                          <span>{hasVoted ? 'Apoyada' : 'Apoyar'}</span>
                          <span className="font-mono tabular-nums pl-1 border-l border-current/20">
                            {item.votesCount}
                          </span>
                        </button>

                        {isMine && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDeleteClick(item.id)}
                            aria-label={`Eliminar sugerencia ${item.title}`}
                            title="Eliminar mi sugerencia"
                            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer disabled:opacity-55"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
