import { useMemo, useState } from 'react';
import { Award, CheckCircle2, Crown, LogIn, Users } from 'lucide-react';
import type { AgeGroup, LeaderboardEntry, StudentProfile } from '../types';
import { AvatarIcon } from './AvatarIcon';

interface LeaderboardViewProps {
  userSignedIn: boolean;
  currentUid: string | null;
  profile: StudentProfile;
  entries: LeaderboardEntry[];
  loading: boolean;
  onSignIn: () => void;
  isAuthenticating: boolean;
}

type SortMode = 'weekly' | 'total';
type AgeFilter = 'all' | AgeGroup;

export function LeaderboardView({
  userSignedIn,
  currentUid,
  profile,
  entries,
  loading,
  onSignIn,
  isAuthenticating,
}: LeaderboardViewProps) {
  const [sortMode, setSortMode] = useState<SortMode>('weekly');
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');

  const filteredAndSorted = useMemo(() => {
    const filtered =
      ageFilter === 'all'
        ? entries
        : entries.filter((item) => item.ageGroup === ageFilter);

    return [...filtered].sort((a, b) => {
      if (sortMode === 'weekly') {
        const weekA = a.activeWeekKey === profile.activeWeekKey ? a.weekDaysCount : 0;
        const weekB = b.activeWeekKey === profile.activeWeekKey ? b.weekDaysCount : 0;
        if (weekB !== weekA) return weekB - weekA;
        const wXpA = a.activeWeekKey === profile.activeWeekKey ? a.weeklyXp : 0;
        const wXpB = b.activeWeekKey === profile.activeWeekKey ? b.weeklyXp : 0;
        if (wXpB !== wXpA) return wXpB - wXpA;
      }
      return b.xp - a.xp;
    });
  }, [ageFilter, entries, profile.activeWeekKey, sortMode]);

  const myRank = useMemo(() => {
    if (!currentUid) return null;
    const index = filteredAndSorted.findIndex((item) => item.uid === currentUid);
    return index >= 0 ? index + 1 : null;
  }, [currentUid, filteredAndSorted]);

  if (!userSignedIn) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <Users className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Tablero de Clasificación Compartido
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Inicia sesión con Google para compartir tus puntos de forma segura usando solo tu apodo de explorador (sin mostrar tu correo) y ver el avance de tus compañeros durante las vacaciones.
          </p>
        </div>
        <button
          type="button"
          onClick={onSignIn}
          disabled={isAuthenticating}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          {isAuthenticating ? 'Conectando...' : 'Entrar con Google y unirme'}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Tablero de clasificación compartido
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Compite de manera sana por constancia semanal (mínimo 3 días) y experiencia acumulada.
          </p>
        </div>

        {myRank !== null && (
          <div className="text-sm font-semibold text-blue-700 tabular-nums">
            Tu posición actual: #{myRank} de {filteredAndSorted.length}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Ranking Mode Segmented Control */}
        <div
          role="group"
          aria-label="Orden de clasificación"
          className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start"
        >
          <button
            type="button"
            onClick={() => setSortMode('weekly')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sortMode === 'weekly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reto Semanal (3 días)
          </button>
          <button
            type="button"
            onClick={() => setSortMode('total')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sortMode === 'total'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            XP Total
          </button>
        </div>

        {/* Age Group Filter */}
        <div
          role="group"
          aria-label="Filtrar por edad"
          className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start"
        >
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: '7-8', label: '7–8 años' },
              { id: '9-10', label: '9–10 años' },
              { id: '11', label: '11 años' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAgeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                ageFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Cargando clasificación compartida...
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Todavía no hay estudiantes en este grupo de edad.
            </p>
            <p className="text-xs text-slate-500">
              Completa una partida para estrenar el primer lugar de la tabla.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3.5 px-4 w-16">Puesto</th>
                  <th className="py-3.5 px-4">Explorador</th>
                  <th className="py-3.5 px-4">Meta 3 días</th>
                  <th className="py-3.5 px-4">Nivel</th>
                  <th className="py-3.5 px-4 text-right">Insignias</th>
                  <th className="py-3.5 px-4 text-right">
                    {sortMode === 'weekly' ? 'XP Semana' : 'XP Total'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAndSorted.map((entry, idx) => {
                  const rank = idx + 1;
                  const isMe = entry.uid === currentUid;
                  const weekDays =
                    entry.activeWeekKey === profile.activeWeekKey ? entry.weekDaysCount : 0;
                  const weekXp =
                    entry.activeWeekKey === profile.activeWeekKey ? entry.weeklyXp : 0;
                  const goalDone = weekDays >= 3;

                  return (
                    <tr
                      key={entry.uid}
                      className={isMe ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold tabular-nums text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          {rank === 1 && (
                            <Crown className="w-4 h-4 text-amber-500 fill-amber-400" aria-hidden="true" />
                          )}
                          #{rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <AvatarIcon avatarId={entry.avatarId} size="sm" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[180px]">
                              {entry.nickname}
                              {isMe && (
                                <span className="ml-1.5 text-xs font-semibold text-blue-700">
                                  (Tú)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {entry.ageGroup} años · {entry.weeksCompletedCount} sem. cumplidas
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums">
                          {goalDone && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                          )}
                          <span className={goalDone ? 'text-emerald-700' : 'text-slate-700'}>
                            {weekDays} / 3 días
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 tabular-nums">
                        Nivel {entry.unlockedLevel}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-slate-700 tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          {entry.badgesCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {sortMode === 'weekly' ? `${weekXp} XP` : `${entry.xp} XP`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
