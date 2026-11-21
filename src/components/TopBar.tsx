import { UserRound } from 'lucide-react';
import type { NavSection, StudentProfile } from '../types';
import { AvatarIcon } from './AvatarIcon';

interface TopBarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  userSignedIn: boolean;
  profile: StudentProfile;
  onSignIn: () => void;
  onOpenProfile: () => void;
  isAuthenticating: boolean;
}

const NAV_ITEMS: Array<{ id: NavSection; label: string }> = [
  { id: 'ruta', label: 'Ruta' },
  { id: 'juegos', label: 'Juegos' },
  { id: 'reto', label: 'Reto Semanal' },
  { id: 'clasificacion', label: 'Clasificación' },
  { id: 'recompensas', label: 'Recompensas' },
];

export function TopBar({
  activeSection,
  onNavigate,
  userSignedIn,
  profile,
  onSignIn,
  onOpenProfile,
  isAuthenticating,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFBF5]/95 backdrop-blur-sm border-b border-amber-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8 text-[#31708e]">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('ruta')}
          className="font-display text-xl font-bold tracking-tight text-[#000000] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          EnglishCamp
        </button>

        {/* Zone 2: 4 single-line nav links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: User profile icon/avatar + primary action */}
        <div className="shrink-0 flex items-center gap-2.5">
          {userSignedIn ? (
            <>
              <button
                type="button"
                onClick={onOpenProfile}
                aria-label="Abrir perfil y avatar del explorador"
                title="Mi perfil"
                className="rounded-xl hover:ring-2 hover:ring-blue-500 transition-all shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <AvatarIcon avatarId={profile.avatarId} size="sm" />
              </button>
              <button
                type="button"
                onClick={onOpenProfile}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 max-w-[170px] truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {profile.displayName}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onSignIn}
                disabled={isAuthenticating}
                aria-label="Perfil e inicio de sesión"
                title="Entrar a tu perfil"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60 flex items-center justify-center transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <UserRound className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onSignIn}
                disabled={isAuthenticating}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {isAuthenticating ? 'Conectando...' : 'Entrar con Google'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden border-t border-amber-100 px-3 flex items-center justify-around bg-[#FFFBF5]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`py-2.5 px-2 text-xs font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
