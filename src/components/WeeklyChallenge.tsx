import { CalendarCheck2, CheckCircle2, Clock, Flame, Play } from 'lucide-react';
import type { PracticeSession, StudentProfile } from '../types';
import { getCurrentWeekDays, getWeeklyChallengeTitle } from '../utils/date';

interface WeeklyChallengeProps {
  profile: StudentProfile;
  recentSessions: PracticeSession[];
  onStartDailyPractice: () => void;
}

export function WeeklyChallenge({
  profile,
  recentSessions,
  onStartDailyPractice,
}: WeeklyChallengeProps) {
  const weekDays = getCurrentWeekDays();
  const completedSet = new Set(profile.weekDaysCompleted);
  const daysDone = profile.weekDaysCompleted.length;
  const goalMet = daysDone >= 3;
  const progressPct = Math.min(100, Math.round((daysDone / 3) * 100));
  const themeTitle = getWeeklyChallengeTitle(profile.activeWeekKey);

  const todaySlot = weekDays.find((d) => d.isToday);
  const practicedToday = todaySlot ? completedSet.has(todaySlot.dayKey) : false;

  const hasThreeStars = profile.levelStars.some((s) => s === 3);

  return (
    <section className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Semana {profile.activeWeekKey}</span>
              <span aria-hidden="true">·</span>
              <span>Continuidad Escolar en Vacaciones</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {themeTitle}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Juega al menos <strong>3 días diferentes cada semana</strong> para no olvidar el inglés del colegio y ganar el bono de <strong>+150 XP</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartDailyPractice}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {practicedToday ? 'Seguir practicando hoy' : 'Completar día de hoy'}
          </button>
        </div>

        {/* 3-Day Progress Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarCheck2
                className={`w-5 h-5 ${goalMet ? 'text-emerald-600' : 'text-blue-600'}`}
                aria-hidden="true"
              />
              <span className="text-sm font-bold text-slate-900">
                Progreso del reto: <span className="font-mono tabular-nums">{daysDone} / 3 días</span>
              </span>
            </div>
            <span
              className={`text-xs font-semibold ${
                goalMet ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {goalMet
                ? 'Reto semanal completado (+150 XP ganados)'
                : `Te faltan ${Math.max(0, 3 - daysDone)} día${3 - daysDone === 1 ? '' : 's'} esta semana`}
            </span>
          </div>

          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                goalMet ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 7-Day Calendar Grid */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-slate-800">Calendario de esta semana (Lun–Dom)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
            {weekDays.map((slot) => {
              const done = completedSet.has(slot.dayKey);
              return (
                <div
                  key={slot.dayKey}
                  className={`rounded-xl border p-3 text-center space-y-1.5 ${
                    done
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : slot.isToday
                      ? 'bg-blue-50/70 border-blue-300 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-semibold">{slot.shortLabel}</div>
                  <div className="font-mono text-lg font-bold tabular-nums">{slot.dayNumber}</div>
                  <div className="text-[11px] font-semibold flex items-center justify-center gap-1">
                    {done ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                        <span>Hecho</span>
                      </>
                    ) : slot.isToday ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                        <span>Hoy</span>
                      </>
                    ) : (
                      <span>Pendiente</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Milestones + Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Objetivos de la semana
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 tabular-nums">
              <Flame className="w-4 h-4" aria-hidden="true" />
              {profile.weeksCompletedCount} semana{profile.weeksCompletedCount === 1 ? '' : 's'} logradas
            </span>
          </div>

          <ul className="divide-y divide-slate-100">
            <li className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">1. Practicar hoy</p>
                <p className="text-xs text-slate-500">Completa una ronda de 6 preguntas en cualquier nivel.</p>
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  practicedToday ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {practicedToday ? 'Completado' : 'Pendiente'}
              </span>
            </li>
            <li className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">2. Alcanzar 3 días distintos</p>
                <p className="text-xs text-slate-500">Bono automático de +150 XP al completar el 3er día.</p>
              </div>
              <span
                className={`text-xs font-semibold tabular-nums whitespace-nowrap ${
                  goalMet ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {daysDone} / 3 días
              </span>
            </li>
            <li className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">3. Conseguir 3 estrellas en un nivel</p>
                <p className="text-xs text-slate-500">Responde correctamente las 6 rondas de una partida.</p>
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  hasThreeStars ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {hasThreeStars ? 'Logrado' : 'En progreso'}
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Partidas recientes
          </h3>

          {recentSessions.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-600">
                Aún no registraste partidas esta semana.
              </p>
              <p className="text-xs text-slate-500">
                Juega tu primera ronda para empezar a contar los 3 días semanales.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentSessions.slice(0, 5).map((s, idx) => (
                <li
                  key={s.id ?? `${s.dayKey}-${idx}`}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {s.levelId === 0 ? 'Nivel de Diagnóstico' : `Nivel ${s.levelId}`}
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {s.dayKey} · {s.score}/6 aciertos
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="font-mono font-bold text-blue-700">+{s.xpEarned} XP</p>
                    <p className="text-xs text-amber-700">{s.stars} estrellas</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
