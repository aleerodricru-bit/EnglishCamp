import type { AvatarId } from '../types';

interface AvatarIconProps {
  avatarId: AvatarId;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarIcon({ avatarId, size = 'md' }: AvatarIconProps) {
  const sizeClass =
    size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';

  switch (avatarId) {
    case 'fox':
      return (
        <div
          className={`${sizeClass} rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
            <polygon points="7,16 12,5 19,14" fill="#EA580C" />
            <polygon points="33,16 28,5 21,14" fill="#EA580C" />
            <circle cx="20" cy="22" r="12" fill="#F97316" />
            <path d="M10 24 Q20 35 30 24 Q20 27 10 24 Z" fill="#FFF7ED" />
            <circle cx="15.5" cy="20" r="1.8" fill="#0F172A" />
            <circle cx="24.5" cy="20" r="1.8" fill="#0F172A" />
            <circle cx="20" cy="25" r="2" fill="#0F172A" />
          </svg>
        </div>
      );
    case 'owl':
      return (
        <div
          className={`${sizeClass} rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
            <circle cx="20" cy="21" r="12" fill="#0284C7" />
            <circle cx="15" cy="19" r="4.2" fill="#FFFFFF" />
            <circle cx="25" cy="19" r="4.2" fill="#FFFFFF" />
            <circle cx="15.5" cy="19" r="2" fill="#0F172A" />
            <circle cx="24.5" cy="19" r="2" fill="#0F172A" />
            <polygon points="20,21 17.5,25 22.5,25" fill="#F59E0B" />
          </svg>
        </div>
      );
    case 'panda':
      return (
        <div
          className={`${sizeClass} rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
            <circle cx="11" cy="11" r="4.5" fill="#1E293B" />
            <circle cx="29" cy="11" r="4.5" fill="#1E293B" />
            <circle cx="20" cy="22" r="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <ellipse cx="15" cy="20" rx="3.4" ry="4" fill="#1E293B" />
            <ellipse cx="25" cy="20" rx="3.4" ry="4" fill="#1E293B" />
            <circle cx="15" cy="19.5" r="1.3" fill="#FFFFFF" />
            <circle cx="25" cy="19.5" r="1.3" fill="#FFFFFF" />
            <ellipse cx="20" cy="25" rx="2.3" ry="1.6" fill="#0F172A" />
          </svg>
        </div>
      );
    case 'koala':
      return (
        <div
          className={`${sizeClass} rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
            <circle cx="9" cy="18" r="5.5" fill="#64748B" />
            <circle cx="31" cy="18" r="5.5" fill="#64748B" />
            <circle cx="20" cy="21" r="11" fill="#94A3B8" />
            <circle cx="15.5" cy="19" r="1.8" fill="#0F172A" />
            <circle cx="24.5" cy="19" r="1.8" fill="#0F172A" />
            <ellipse cx="20" cy="23.5" rx="3" ry="4" fill="#334155" />
          </svg>
        </div>
      );
    case 'explorer':
      return (
        <div
          className={`${sizeClass} rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
            <circle cx="20" cy="20" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="8.5" fill="#FEF3C7" />
            <polygon points="20,12 22.5,20 20,28 17.5,20" fill="#DC2626" />
            <circle cx="20" cy="20" r="2" fill="#0F172A" />
          </svg>
        </div>
      );
    case 'astronaut':
    default:
      return (
        <div
          className={`${sizeClass} rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
            <circle cx="20" cy="20" r="12" fill="#E2E8F0" stroke="#2563EB" strokeWidth="2" />
            <rect x="11" y="13" width="18" height="12" rx="6" fill="#1E3A8A" />
            <path d="M14 16 Q17 14 21 15" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );
  }
}
