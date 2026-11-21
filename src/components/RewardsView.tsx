import { useState } from 'react';
import {
  Award,
  CalendarCheck2,
  Check,
  Compass,
  Ear,
  Lock,
  MapPin,
  Star,
  Trophy,
} from 'lucide-react';
import { AVATARS, BADGES, CHAMPION_BADGE_URL } from '../data/curriculum';
import type { AvatarId, BadgeDefinition, StudentProfile } from '../types';
import { AvatarIcon } from './AvatarIcon';

interface RewardsViewProps {
  profile: StudentProfile;
  onSelectAvatar: (avatarId: AvatarId) => void;
}

function renderBadgeIcon(iconKey: BadgeDefinition['iconKey'], unlocked: boolean) {
  const cls = `w-6 h-6 ${unlocked ? 'text-amber-700' : 'text-slate-400'}`;
  switch (iconKey) {
    case 'compass':
      return <Compass className={cls} />;
    case 'calendar':
      return <CalendarCheck2 className={cls} />;
    case 'ear':
      return <Ear className={cls} />;
    case 'map':
      return <MapPin className={cls} />;
    case 'star':
      return <Star className={cls} />;
    case 'trophy':
    default:
      return <Trophy className={cls} />;
  }
}

export function RewardsView({ profile, onSelectAvatar }: RewardsViewProps) {
  const [badgeImgErr, setBadgeImgErr] = useState(false);
  const unlockedSet = new Set(profile.badges);

  return (
    <section className="space-y-8">
      {/* Showcase Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3 flex justify-center">
          {!badgeImgErr ? (
            <img
              src={CHAMPION_BADGE_URL}
              alt="Medalla dorada de explorador con tres estrellas y laureles"
              referrerPolicy="no-referrer"
              onError={() => setBadgeImgErr(true)}
              className="w-36 h-36 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-36 h-36 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Award className="w-14 h-14" />
            </div>
          )}
        </div>
        <div className="md:col-span-9 space-y-2">
          <span className="text-xs font-semibold text-amber-700">
            Sala de Trofeos y Avatares
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Tus recompensas de vacaciones
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Cada partida suma puntos XP para desbloquear nuevos compañeros exploradores y medallas especiales que se muestran junto a tu nombre en el tablero compartido.
          </p>
          <div className="pt-1 text-xs font-semibold text-slate-700 tabular-nums">
            {profile.badges.length} de {BADGES.length} insignias · {profile.xp} XP acumulados
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-slate-900">
          Insignias coleccionables
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const unlocked = unlockedSet.has(badge.id);
            return (
              <article
                key={badge.id}
                className={`rounded-2xl border p-5 flex items-start gap-4 ${
                  unlocked
                    ? 'bg-white border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    unlocked
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {renderBadgeIcon(badge.iconKey, unlocked)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">
                      {badge.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {badge.description}
                  </p>
                  <p
                    className={`pt-1 text-xs font-semibold ${
                      unlocked ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {unlocked ? 'Desbloqueada' : `Requisito: ${badge.requirementLabel}`}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Avatars Picker */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            Elige tu avatar explorador
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Desbloquea más personajes al acumular puntos XP en las misiones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVATARS.map((avatar) => {
            const unlocked = profile.xp >= avatar.minXp;
            const equipped = profile.avatarId === avatar.id;

            return (
              <div
                key={avatar.id}
                className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 ${
                  equipped ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AvatarIcon avatarId={avatar.id} size="md" />
                  <div className="min-w-0">
                    <p className="font-display font-bold text-slate-900 truncate">
                      {avatar.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{avatar.title}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      {avatar.unlockRequirement}
                    </p>
                  </div>
                </div>

                {equipped ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    Activo
                  </span>
                ) : unlocked ? (
                  <button
                    type="button"
                    onClick={() => onSelectAvatar(avatar.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Elegir
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold shrink-0 tabular-nums">
                    <Lock className="w-3.5 h-3.5" />
                    {avatar.minXp} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
