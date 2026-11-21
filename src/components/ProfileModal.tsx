import { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { AVATARS } from '../data/curriculum';
import type { AgeGroup, AvatarId, StudentProfile } from '../types';
import { AvatarIcon } from './AvatarIcon';

interface ProfileModalProps {
  profile: StudentProfile;
  onClose: () => void;
  onSaveProfile: (displayName: string, ageGroup: AgeGroup, avatarId: AvatarId) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function ProfileModal({
  profile,
  onClose,
  onSaveProfile,
  onSignOut,
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(profile.ageGroup);
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setErrorMsg('El apodo debe tener entre 2 y 30 caracteres.');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      await onSaveProfile(trimmed, ageGroup, avatarId);
      onClose();
    } catch {
      setErrorMsg('No se pudo guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="profile-modal-title" className="font-display text-xl font-bold text-slate-900">
            Perfil del Explorador
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="nickname-input" className="block text-xs font-semibold text-slate-700">
              Apodo visible en la clasificación (sin datos personales)
            </label>
            <input
              id="nickname-input"
              type="text"
              maxLength={30}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-2 focus:outline-blue-600"
              placeholder="Ej. Leo Explorador"
            />
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700">Grupo de edad</span>
            <div className="grid grid-cols-3 gap-2">
              {(['7-8', '9-10', '11'] as const).map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setAgeGroup(age)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    ageGroup === age
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {age} años
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700">Avatar</span>
            <div className="grid grid-cols-3 gap-2">
              {AVATARS.map((av) => {
                const unlocked = profile.xp >= av.minXp;
                const selected = avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setAvatarId(av.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                      selected
                        ? 'border-blue-600 bg-blue-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AvatarIcon avatarId={av.id} size="sm" />
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-full">
                      {av.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>}

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
