import { useState } from 'react';
import { CalendarCheck2, Compass, Play, Star, Trophy } from 'lucide-react';
import { HERO_BANNER_URL } from '../data/curriculum';
import type { AgeGroup, NavSection, StudentProfile } from '../types';

interface HeroBannerProps {
  profile: StudentProfile;
  userSignedIn: boolean;
  onAgeGroupChange: (ageGroup: AgeGroup) => void;
  onStartLevel: (levelId: number) => void;
  onNavigate: (section: NavSection) => void;
}

const AGE_OPTIONS: Array<{ value: AgeGroup; label: string }> = [
  { value: '7-8', label: '7–8 años' },
  { value: '9-10', label: '9–10 años' },
  { value: '11', label: '11 años' },
];

export function HeroBanner({
  profile,
  userSignedIn,
  onAgeGroupChange,
  onStartLevel,
  onNavigate,
}: HeroBannerProps) {
  const [imgError, setImgError] = useState(false);

  const daysCompleted = profile.weekDaysCompleted.length;
  const weeklyGoalMet = daysCompleted >= 3;
  const totalStars = profile.levelStars.reduce((sum, s) => sum + s, 0);
  const daysRemaining = Math.max(0, 3 - daysCompleted);

  return (
    <section className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Content Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span>Vacaciones Escolares</span>
                <span aria-hidden="true">·</span>
                <span>Inglés 7 a 11 años</span>
                <span aria-hidden="true">·</span>
                <span>Meta mínima: 3 días por semana</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                Aprende inglés jugando cada semana de vacaciones
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                Repasa los temas del año escolar con misiones rápidas de 5 minutos, suma estrellas por nivel y cumple tu reto de 3 días semanales junto a tus compañeros.
              </p>

              {/* Age Track Segmented Control */}
              <div className="pt-1 space-y-2">
                <span className="block text-xs font-semibold text-slate-600">
                  Elige tu edad para adaptar las sugerencias:
                </span>
                <div
                  role="group"
                  aria-label="Selector de edad"
                  className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200"
                >
                  {AGE_OPTIONS.map((option) => {
                    const active = profile.ageGroup === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onAgeGroupChange(option.value)}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onStartLevel(profile.unlockedLevel)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm sm:text-base font-semibold hover:bg-blue-700 active:scale-[0.99] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Play className="w-4 h-4 fill-current" />
                Jugar Nivel {profile.unlockedLevel}
              </button>

              <button
                type="button"
                onClick={() => onStartLevel(0)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-semibold hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Hacer diagnóstico
              </button>

              <button
                type="button"
                onClick={() => onNavigate('reto')}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Ver reto semanal
              </button>

              {!userSignedIn && (
                <span className="text-xs text-slate-500">
                  Modo prueba activo · Inicia sesión con Google para guardar en la clasificación
                </span>
              )}
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-sky-50 border-t lg:border-t-0 lg:border-l border-slate-200">
            {!imgError ? (
              <img
                src={HERO_BANNER_URL}
                alt="Mesa de campamento de estudio al aire libre con mochila de explorador, cuaderno y tarjetas ilustradas"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full lg:h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[240px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-sky-50 to-amber-50 text-center">
                <Compass className="w-12 h-12 text-blue-600 mb-3" />
                <p className="font-display font-bold text-slate-800">Campamento EnglishCamp</p>
                <p className="text-xs text-slate-600 mt-1">Inglés activo durante las vacaciones</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4-column Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Días esta semana</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {daysCompleted} / 3
          </div>
          <p className={`mt-1 text-xs font-semibold ${weeklyGoalMet ? 'text-emerald-700' : 'text-amber-700'}`}>
            {weeklyGoalMet
              ? 'Meta semanal cumplida'
              : `Falta${daysRemaining === 1 ? '' : 'n'} ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Progreso en la ruta</span>
            <Compass className="w-4 h-4 text-blue-600" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            Nivel {profile.unlockedLevel} / 6
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {profile.totalSessions} partida{profile.totalSessions === 1 ? '' : 's'} jugadas
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Experiencia total</span>
            <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {profile.xp} XP
          </div>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            Esta semana: {profile.weeklyXp} XP
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Estrellas ganadas</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {totalStars} / 18
          </div>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {profile.badges.length} / 6 insignias logradas
          </p>
        </div>
      </div>
    </section>
  );
}
