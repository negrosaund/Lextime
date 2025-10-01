import { Holiday } from '../lib/supabase';

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateString = date.toISOString().split('T')[0];
  return holidays.some(h => h.holiday_date === dateString);
}

export function isBusinessDay(date: Date, holidays: Holiday[]): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

export function addBusinessDays(startDate: Date, businessDays: number, holidays: Holiday[]): Date {
  let currentDate = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    currentDate.setDate(currentDate.getDate() + 1);

    if (isBusinessDay(currentDate, holidays)) {
      daysAdded++;
    }
  }

  return currentDate;
}

export function subtractBusinessDays(endDate: Date, businessDays: number, holidays: Holiday[]): Date {
  let currentDate = new Date(endDate);
  let daysSubtracted = 0;

  while (daysSubtracted < businessDays) {
    currentDate.setDate(currentDate.getDate() - 1);

    if (isBusinessDay(currentDate, holidays)) {
      daysSubtracted++;
    }
  }

  return currentDate;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDaysUntil(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getUrgencyColor(daysUntil: number): string {
  if (daysUntil < 0) return 'text-gray-500';
  if (daysUntil === 0) return 'text-red-600';
  if (daysUntil <= 3) return 'text-orange-600';
  if (daysUntil <= 7) return 'text-yellow-600';
  return 'text-green-600';
}

export function getUrgencyBadge(daysUntil: number): string {
  if (daysUntil < 0) return 'bg-gray-100 text-gray-700';
  if (daysUntil === 0) return 'bg-red-100 text-red-700';
  if (daysUntil <= 3) return 'bg-orange-100 text-orange-700';
  if (daysUntil <= 7) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}
