import type { IllustrationId } from '../types';

interface WordIllustrationProps {
  id: IllustrationId;
  className?: string;
}

export function WordIllustration({ id, className = 'w-28 h-28' }: WordIllustrationProps) {
  switch (id) {
    case 'sun':
    case 'sunny':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#E0F2FE" />
          <g stroke="#F59E0B" strokeWidth="5" strokeLinecap="round">
            <line x1="60" y1="14" x2="60" y2="26" />
            <line x1="60" y1="94" x2="60" y2="106" />
            <line x1="14" y1="60" x2="26" y2="60" />
            <line x1="94" y1="60" x2="106" y2="60" />
            <line x1="27" y1="27" x2="36" y2="36" />
            <line x1="84" y1="84" x2="93" y2="93" />
            <line x1="93" y1="27" x2="84" y2="36" />
            <line x1="36" y1="84" x2="27" y2="93" />
          </g>
          <circle cx="60" cy="60" r="24" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
          <circle cx="52" cy="56" r="2.5" fill="#78350F" />
          <circle cx="68" cy="56" r="2.5" fill="#78350F" />
          <path d="M53 66 Q60 72 67 66" stroke="#78350F" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'backpack':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FEF3C7" />
          <path d="M46 28 C46 18, 74 18, 74 28" stroke="#9A3412" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="30" y="28" width="60" height="72" rx="18" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
          <path d="M30 50 Q60 62 90 50" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
          <rect x="40" y="64" width="40" height="26" rx="8" fill="#FCA5A5" stroke="#991B1B" strokeWidth="2.5" />
          <line x1="48" y1="72" x2="72" y2="72" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" />
          <rect x="56" y="49" width="8" height="10" rx="2" fill="#FBBF24" />
        </svg>
      );

    case 'apple':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#ECFDF5" />
          <path d="M60 36 Q64 20 72 18" stroke="#78350F" strokeWidth="4" strokeLinecap="round" fill="none" />
          <ellipse cx="72" cy="28" rx="10" ry="5" transform="rotate(-25 72 28)" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
          <path
            d="M60 38 C42 32, 26 48, 30 70 C33 90, 48 100, 60 94 C72 100, 87 90, 90 70 C94 48, 78 32, 60 38 Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="3"
          />
          <path d="M42 48 Q38 58 41 68" stroke="#FCA5A5" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'rainbow':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#EFF6FF" />
          <path d="M20 82 A40 40 0 0 1 100 82" stroke="#EF4444" strokeWidth="8" fill="none" />
          <path d="M28 82 A32 32 0 0 1 92 82" stroke="#F59E0B" strokeWidth="8" fill="none" />
          <path d="M36 82 A24 24 0 0 1 84 82" stroke="#22C55E" strokeWidth="8" fill="none" />
          <path d="M44 82 A16 16 0 0 1 76 82" stroke="#3B82F6" strokeWidth="8" fill="none" />
          <circle cx="26" cy="84" r="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="38" cy="86" r="9" fill="#FFFFFF" />
          <circle cx="94" cy="84" r="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="82" cy="86" r="9" fill="#FFFFFF" />
        </svg>
      );

    case 'fox':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FFF7ED" />
          <polygon points="24,52 34,20 52,42" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
          <polygon points="96,52 86,20 68,42" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
          <circle cx="60" cy="66" r="32" fill="#F97316" stroke="#9A3412" strokeWidth="2.5" />
          <path d="M30 72 Q60 100 90 72 Q60 80 30 72 Z" fill="#FFF7ED" />
          <circle cx="48" cy="60" r="4" fill="#0F172A" />
          <circle cx="72" cy="60" r="4" fill="#0F172A" />
          <circle cx="60" cy="74" r="5" fill="#0F172A" />
        </svg>
      );

    case 'owl':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#F0F9FF" />
          <rect x="20" y="92" width="80" height="8" rx="4" fill="#92400E" />
          <ellipse cx="60" cy="60" rx="30" ry="34" fill="#0284C7" stroke="#075985" strokeWidth="2.5" />
          <ellipse cx="60" cy="72" rx="18" ry="18" fill="#E0F2FE" />
          <circle cx="48" cy="50" r="10" fill="#FFFFFF" stroke="#075985" strokeWidth="2" />
          <circle cx="72" cy="50" r="10" fill="#FFFFFF" stroke="#075985" strokeWidth="2" />
          <circle cx="49" cy="50" r="4.5" fill="#0F172A" />
          <circle cx="71" cy="50" r="4.5" fill="#0F172A" />
          <polygon points="60,55 54,65 66,65" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        </svg>
      );

    case 'rabbit':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FDF2F8" />
          <ellipse cx="46" cy="34" rx="9" ry="22" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
          <ellipse cx="74" cy="34" rx="9" ry="22" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
          <ellipse cx="46" cy="35" rx="4" ry="14" fill="#FBCFE8" />
          <ellipse cx="74" cy="35" rx="4" ry="14" fill="#FBCFE8" />
          <circle cx="60" cy="72" r="28" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
          <circle cx="50" cy="68" r="3.5" fill="#0F172A" />
          <circle cx="70" cy="68" r="3.5" fill="#0F172A" />
          <ellipse cx="60" cy="76" rx="4" ry="3" fill="#F472B6" />
        </svg>
      );

    case 'turtle':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#ECFDF5" />
          <circle cx="94" cy="66" r="11" fill="#4ADE80" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="97" cy="64" r="2.2" fill="#0F172A" />
          <rect x="34" y="76" width="12" height="14" rx="4" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
          <rect x="68" y="76" width="12" height="14" rx="4" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
          <path d="M26 76 A32 30 0 0 1 88 76 Z" fill="#16A34A" stroke="#14532D" strokeWidth="3" />
          <circle cx="57" cy="60" r="10" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
        </svg>
      );

    case 'butterfly':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FAF5FF" />
          <ellipse cx="40" cy="48" rx="22" ry="18" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
          <ellipse cx="80" cy="48" rx="22" ry="18" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
          <ellipse cx="44" cy="76" rx="16" ry="14" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
          <ellipse cx="76" cy="76" rx="16" ry="14" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
          <rect x="56" y="34" width="8" height="54" rx="4" fill="#334155" />
          <path d="M58 34 Q48 20 42 22" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M62 34 Q72 20 78 22" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'river':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#DCFCE7" />
          <path d="M46 12 Q78 34 44 60 Q20 84 62 108 L92 108 Q56 84 74 60 Q98 34 72 12 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
          <path d="M56 38 Q64 42 54 48" stroke="#E0F2FE" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M46 76 Q56 82 52 90" stroke="#E0F2FE" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'pencil':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FEF9C3" />
          <g transform="rotate(-40 60 60)">
            <rect x="46" y="24" width="28" height="60" fill="#FBBF24" stroke="#92400E" strokeWidth="2.5" />
            <rect x="46" y="16" width="28" height="12" rx="4" fill="#F472B6" stroke="#9D174D" strokeWidth="2.5" />
            <polygon points="46,84 74,84 60,104" fill="#FDE68A" stroke="#92400E" strokeWidth="2.5" />
            <polygon points="56,98 64,98 60,104" fill="#0F172A" />
          </g>
        </svg>
      );

    case 'notebook':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#E0E7FF" />
          <rect x="32" y="20" width="60" height="80" rx="8" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="3" />
          <rect x="44" y="34" width="36" height="18" rx="4" fill="#FFFFFF" />
          <g fill="#CBD5E1" stroke="#1E3A8A" strokeWidth="1.5">
            <rect x="24" y="30" width="12" height="6" rx="3" />
            <rect x="24" y="48" width="12" height="6" rx="3" />
            <rect x="24" y="66" width="12" height="6" rx="3" />
            <rect x="24" y="84" width="12" height="6" rx="3" />
          </g>
        </svg>
      );

    case 'book':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#F0FDF4" />
          <path d="M22 32 Q42 26 60 36 L60 88 Q42 78 22 84 Z" fill="#FFFFFF" stroke="#15803D" strokeWidth="3" />
          <path d="M98 32 Q78 26 60 36 L60 88 Q78 78 98 84 Z" fill="#FFFFFF" stroke="#15803D" strokeWidth="3" />
          <line x1="30" y1="48" x2="50" y2="48" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="60" x2="50" y2="60" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="48" x2="90" y2="48" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="60" x2="90" y2="60" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'soccer':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#DCFCE7" />
          <circle cx="60" cy="60" r="34" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
          <polygon points="60,46 73,56 68,71 52,71 47,56" fill="#0F172A" />
          <line x1="60" y1="46" x2="60" y2="26" stroke="#0F172A" strokeWidth="3" />
          <line x1="73" y1="56" x2="92" y2="50" stroke="#0F172A" strokeWidth="3" />
          <line x1="47" y1="56" x2="28" y2="50" stroke="#0F172A" strokeWidth="3" />
          <line x1="68" y1="71" x2="80" y2="88" stroke="#0F172A" strokeWidth="3" />
          <line x1="52" y1="71" x2="40" y2="88" stroke="#0F172A" strokeWidth="3" />
        </svg>
      );

    case 'teacher':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FEF3C7" />
          <rect x="20" y="24" width="80" height="50" rx="6" fill="#166534" stroke="#78350F" strokeWidth="4" />
          <text x="60" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
            A B C
          </text>
          <circle cx="60" cy="86" r="12" fill="#FDBA74" stroke="#9A3412" strokeWidth="2" />
          <path d="M40 108 C40 96, 80 96, 80 108" fill="#2563EB" />
        </svg>
      );

    case 'strawberry':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FFE4E6" />
          <path d="M40 42 C32 56, 44 92, 60 96 C76 92, 88 56, 80 42 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="3" />
          <path d="M40 42 L50 30 L60 40 L70 30 L80 42 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
          <circle cx="52" cy="56" r="2" fill="#FDE047" />
          <circle cx="68" cy="56" r="2" fill="#FDE047" />
          <circle cx="60" cy="68" r="2" fill="#FDE047" />
          <circle cx="52" cy="78" r="2" fill="#FDE047" />
          <circle cx="68" cy="78" r="2" fill="#FDE047" />
        </svg>
      );

    case 'bread':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FEF3C7" />
          <path d="M24 66 C24 40, 96 40, 96 66 L96 82 C96 86, 24 86, 24 82 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
          <line x1="44" y1="50" x2="50" y2="62" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="48" x2="66" y2="62" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <line x1="76" y1="50" x2="82" y2="62" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'cheese':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FEF9C3" />
          <polygon points="24,78 96,78 86,42 24,62" fill="#FACC15" stroke="#A16207" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="48" cy="68" r="5.5" fill="#CA8A04" />
          <circle cx="72" cy="64" r="7" fill="#CA8A04" />
          <circle cx="60" cy="54" r="4" fill="#CA8A04" />
        </svg>
      );

    case 'juice':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FFEDD5" />
          <path d="M68 20 L68 42" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          <path d="M68 20 L82 18" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          <polygon points="40,42 80,42 74,94 46,94" fill="#F97316" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="56" cy="64" r="4" fill="#FDBA74" />
          <circle cx="64" cy="76" r="3" fill="#FDBA74" />
        </svg>
      );

    case 'breakfast':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FFF7ED" />
          <ellipse cx="60" cy="76" rx="40" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
          <ellipse cx="60" cy="72" rx="28" ry="10" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <ellipse cx="60" cy="62" rx="26" ry="9" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
          <rect x="52" y="54" width="16" height="7" rx="2" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
        </svg>
      );

    case 'library':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#EEF2FF" />
          <polygon points="20,44 60,20 100,44" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="3" />
          <rect x="28" y="44" width="64" height="50" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="3" />
          <rect x="36" y="54" width="12" height="32" fill="#EF4444" />
          <rect x="54" y="54" width="12" height="32" fill="#22C55E" />
          <rect x="72" y="54" width="12" height="32" fill="#F59E0B" />
        </svg>
      );

    case 'bakery':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#FEF3C7" />
          <rect x="26" y="46" width="68" height="48" rx="6" fill="#FDE68A" stroke="#92400E" strokeWidth="3" />
          <path d="M22 46 L34 28 L86 28 L98 46 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="3" />
          <ellipse cx="60" cy="64" rx="16" ry="9" fill="#D97706" stroke="#78350F" strokeWidth="2" />
          <rect x="50" y="76" width="20" height="18" fill="#78350F" />
        </svg>
      );

    case 'rainy':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#E0F2FE" />
          <circle cx="44" cy="46" r="16" fill="#94A3B8" />
          <circle cx="64" cy="40" r="20" fill="#94A3B8" />
          <circle cx="80" cy="48" r="14" fill="#94A3B8" />
          <rect x="38" y="46" width="46" height="16" rx="8" fill="#94A3B8" />
          <g stroke="#0284C7" strokeWidth="4" strokeLinecap="round">
            <line x1="42" y1="74" x2="36" y2="90" />
            <line x1="60" y1="74" x2="54" y2="90" />
            <line x1="78" y1="74" x2="72" y2="90" />
          </g>
        </svg>
      );

    case 'jacket':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#ECFDF5" />
          <path
            d="M42 28 L20 48 L30 62 L40 52 L40 94 L80 94 L80 52 L90 62 L100 48 L78 28 Z"
            fill="#10B981"
            stroke="#065F46"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <line x1="60" y1="32" x2="60" y2="94" stroke="#065F46" strokeWidth="3" />
        </svg>
      );

    case 'bike':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#EFF6FF" />
          <circle cx="34" cy="76" r="16" fill="none" stroke="#0F172A" strokeWidth="4" />
          <circle cx="86" cy="76" r="16" fill="none" stroke="#0F172A" strokeWidth="4" />
          <polyline points="34,76 54,48 76,48 86,76 56,76 54,48" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinejoin="round" />
          <line x1="48" y1="42" x2="60" y2="42" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          <line x1="74" y1="40" x2="84" y2="40" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'dolphin':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#E0F2FE" />
          <path d="M24 72 C32 34, 78 30, 96 64 C84 68, 70 62, 54 68 C42 74, 34 86, 22 86 Z" fill="#0284C7" stroke="#075985" strokeWidth="3" />
          <polygon points="56,40 66,24 68,42" fill="#0284C7" stroke="#075985" strokeWidth="2.5" />
          <circle cx="80" cy="54" r="2.8" fill="#FFFFFF" />
          <path d="M20 92 Q40 84 60 92 Q80 100 100 92" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'park':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#ECFDF5" />
          <rect x="12" y="84" width="96" height="20" rx="6" fill="#4ADE80" />
          <rect x="34" y="54" width="10" height="34" fill="#92400E" />
          <circle cx="39" cy="42" r="20" fill="#16A34A" stroke="#14532D" strokeWidth="2.5" />
          <rect x="64" y="72" width="32" height="7" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="2" />
          <line x1="68" y1="79" x2="68" y2="88" stroke="#78350F" strokeWidth="3" />
          <line x1="92" y1="79" x2="92" y2="88" stroke="#78350F" strokeWidth="3" />
        </svg>
      );

    case 'calendar':
    default:
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect width="120" height="120" rx="20" fill="#F1F5F9" />
          <rect x="24" y="28" width="72" height="68" rx="10" fill="#FFFFFF" stroke="#334155" strokeWidth="3" />
          <rect x="24" y="28" width="72" height="20" rx="8" fill="#EF4444" />
          <text x="60" y="78" textAnchor="middle" fill="#0F172A" fontSize="26" fontWeight="bold" fontFamily="sans-serif">
            15
          </text>
        </svg>
      );
  }
}
