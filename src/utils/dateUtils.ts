// Romanian legal holidays for 2024-2026
export const romanianHolidays: Record<string, string[]> = {
  2024: [
    "2024-01-01", // New Year's Day
    "2024-01-02",
    "2024-01-24", // Unification Day
    "2024-02-10",
    "2024-03-08", // International Women's Day
    "2024-03-09",
    "2024-05-01", // Labour Day
    "2024-12-01", // National Day
    "2024-12-25", // Christmas
    "2024-12-26",
  ],
  2025: [
    "2025-01-01", // New Year's Day
    "2025-01-02",
    "2025-01-24", // Unification Day
    "2025-02-10",
    "2025-03-08", // International Women's Day
    "2025-03-09",
    "2025-05-01", // Labour Day
    "2025-12-01", // National Day
    "2025-12-25", // Christmas
    "2025-12-26",
  ],
  2026: [
    "2026-01-01", // New Year's Day
    "2026-01-02",
    "2026-01-24", // Unification Day
    "2026-02-10",
    "2026-03-08", // International Women's Day
    "2026-03-09",
    "2026-05-01", // Labour Day
    "2026-12-01", // National Day
    "2026-12-25", // Christmas
    "2026-12-26",
  ],
};

export const isRomanianHoliday = (date: Date): boolean => {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const holidays = romanianHolidays[year as keyof typeof romanianHolidays] || [];
  return holidays.includes(dateStr);
};

export const roundToNearestMinute = (minutes: number): number => {
  return Math.round(minutes);
};

export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const calculateWorkHours = (
  startTime: string,
  endTime: string
): number => {
  const start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);

  // If end time is earlier than start time, it's a night shift
  if (end < start) {
    end += 24 * 60; // Add 24 hours
  }

  return end - start;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

export const isWeekday = (date: Date): boolean => {
  return !isWeekend(date);
};
