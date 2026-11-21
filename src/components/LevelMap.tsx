import { useState } from 'react';
import { CheckCircle2, Lock, Map, Play, Star } from 'lucide-react';
import { CITY_ARTWORK_URL, FOREST_ARTWORK_URL, LEVELS } from '../data/curriculum';
import type { LevelDefinition, StudentProfile } from '../types';

interface LevelMapProps {
  profile: StudentProfile;
  onStartLevel: (levelId: number) => void;
}

export function LevelMap({ profile, onStartLevel }: LevelMapProps) {
  const [forestImgErr, setForestImgErr] = useState(false);
  const [cityImgErr, setCityImgErr] = useState(false);

  const world1Levels = LEVELS.filter((l) => l.id <= 3);
  const world2Levels = LEVELS.filter((l) => l.id >= 4);

  const renderLevelCard = (level: LevelDefinition) => {
    const isUnlocked = level.id <= profile.unlockedLevel;
    const stars = profile.levelStars[level.id - 1] ?? 0;
    const isCompleted = stars > 0;
    const isRecommendedForAge = level.ageGroupTag === profile.ageGroup;

    return (
      <article
        key={level.id}
        className={`bg-white border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors ${
          isUnlocked
            ? 'border-slate-200 hover:border-blue-300'
            : 'border-slate-200 bg-slate-50/70 opacity-85'
        }`}
      >
        <div className="space-y-3">
          {/* Unboxed clean metadata row */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Nivel {level.id}</span>
              <span aria-hidden="true">·</span>
              <span>{level.recommendedAges}</span>
            </div>
            {isRecommendedForAge && (
              <span className="text-xs font-semibold text-blue-700">Tu edad</span>
            )}
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">
              {level.title.replace(`Nivel ${level.id}: `, '')}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              {level.subtitle}
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Temas: {level.concepts.join(' · ')}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Stars & explicit state text */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5" aria-label={`${stars} de 3 estrellas`}>
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${
                    n <= stars
                      ? 'text-amber-500 fill-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-slate-600 tabular-nums">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Superado
                </span>
              ) : isUnlocked ? (
                'Disponible'
              ) : (
                `Completa el Nivel ${level.id - 1}`
              )}
            </span>
          </div>

          {isUnlocked ? (
            <button
              type="button"
              onClick={() => onStartLevel(level.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isCompleted ? 'Repasar' : 'Jugar'}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200/80 text-slate-600 text-xs font-semibold whitespace-nowrap shrink-0">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              Bloqueado
            </span>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Ruta progresiva de niveles
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Avanza paso a paso desde vocabulario básico hasta construir historias en pasado.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 tabular-nums">
          {profile.unlockedLevel} de 6 niveles desbloqueados
        </span>
      </div>

      {/* Diagnostic Placement Card */}
      <div className="bg-white border border-amber-300 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-amber-800">
            <span className="font-semibold">Evaluación Inicial</span>
            <span aria-hidden="true">·</span>
            <span>6 preguntas progresivas</span>
            <span aria-hidden="true">·</span>
            <span>Desbloquea tu nivel ideal</span>
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            Nivel de Diagnóstico: ¿Desde dónde empezamos?
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Responde 1 reto por cada nivel (del 1 al 6) para comprobar qué recuerdas del colegio y desbloquear directamente el nivel recomendado para tu edad.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onStartLevel(0)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          <Play className="w-4 h-4 fill-current" />
          {profile.totalSessions > 0 ? 'Repetir diagnóstico' : 'Hacer diagnóstico'}
        </button>
      </div>

      {/* World 1 */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-4 relative min-h-[180px] bg-emerald-50">
            {!forestImgErr ? (
              <img
                src={FOREST_ARTWORK_URL}
                alt="Sendero soleado en el bosque con zorro y búho"
                referrerPolicy="no-referrer"
                onError={() => setForestImgErr(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-emerald-800">
                <Map className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">Mundo 1 · Campamento Soleado</span>
              </div>
            )}
          </div>
          <div className="md:col-span-8 p-6 flex flex-col justify-center gap-2">
            <span className="text-xs font-semibold text-emerald-700">
              Mundo 1 · Niveles 1 al 3
            </span>
            <h3 className="font-display text-xl font-bold text-slate-900">
              Campamento Soleado: Fundamentos y Naturaleza
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ideal para arrancar las vacaciones: saludos, números, colores, animales, adjetivos, días de la semana y verbos de rutina escolar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {world1Levels.map(renderLevelCard)}
        </div>
      </div>

      {/* World 2 */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-4 relative min-h-[180px] bg-sky-50">
            {!cityImgErr ? (
              <img
                src={CITY_ARTWORK_URL}
                alt="Plaza soleada de la ciudad con panadería, escuela y torre del reloj"
                referrerPolicy="no-referrer"
                onError={() => setCityImgErr(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-sky-800">
                <Map className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">Mundo 2 · Ciudad Aventura</span>
              </div>
            )}
          </div>
          <div className="md:col-span-8 p-6 flex flex-col justify-center gap-2">
            <span className="text-xs font-semibold text-blue-700">
              Mundo 2 · Niveles 4 al 6
            </span>
            <h3 className="font-display text-xl font-bold text-slate-900">
              Ciudad Aventura: Vida Real y Viaje al Pasado
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pensado para afianzar estructuras de 9 a 11 años: comidas, gustos, clima, lugares de la ciudad, presente continuo y pasado simple.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {world2Levels.map(renderLevelCard)}
        </div>
      </div>
    </section>
  );
}
