export function formatDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentDayKey(): string {
  return formatDayKey(new Date());
}

export function getISOWeekKey(date: Date = new Date()): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export interface WeekDaySlot {
  dayKey: string;
  shortLabel: string;
  fullLabel: string;
  dayNumber: number;
  isToday: boolean;
}

const DAY_SHORT_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_FULL_LABELS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function getCurrentWeekDays(): WeekDaySlot[] {
  const now = new Date();
  const todayKey = formatDayKey(now);
  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon...
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const slotDate = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + index
    );
    const dayKey = formatDayKey(slotDate);
    return {
      dayKey,
      shortLabel: DAY_SHORT_LABELS[index],
      fullLabel: DAY_FULL_LABELS[index],
      dayNumber: slotDate.getDate(),
      isToday: dayKey === todayKey,
    };
  });
}

export function getWeeklyChallengeTitle(weekKey: string): string {
  const themes = [
    'Misión Explorador: 3 días de práctica en inglés',
    'Semana de Vocabulario Vivo y Verbos en Acción',
    'Campamento de Lectura, Oído y Deletreo',
    'Reto Continuidad Escolar: 3 días activos',
  ];
  const weekNum = Number.parseInt(weekKey.split('-W')[1] ?? '1', 10) || 1;
  return themes[weekNum % themes.length];
}
