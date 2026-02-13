import { DayEntry, MonthSummary, Calendar } from "../types/index";
import {
  isWeekday,
  isWeekend,
  roundToNearestMinute,
} from "./dateUtils";

const CALENDARS_STORAGE_KEY = "pontaj_calendars";
const ACTIVE_CALENDAR_KEY = "pontaj_active_calendar";

// Calendar Management Functions

export const createCalendar = (name: string): Calendar => {
  const id = `calendar_${Date.now()}`;
  const calendar: Calendar = {
    id,
    name,
    createdAt: new Date(),
    entries: [],
  };
  saveCalendar(calendar);
  setActiveCalendar(id);
  return calendar;
};

export const getAllCalendars = (): Calendar[] => {
  const data = localStorage.getItem(CALENDARS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getCalendarById = (id: string): Calendar | undefined => {
  const calendars = getAllCalendars();
  return calendars.find((c) => c.id === id);
};

export const saveCalendar = (calendar: Calendar): void => {
  const calendars = getAllCalendars();
  const existingIndex = calendars.findIndex((c) => c.id === calendar.id);

  if (existingIndex >= 0) {
    calendars[existingIndex] = calendar;
  } else {
    calendars.push(calendar);
  }

  localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars));
};

export const deleteCalendar = (id: string): void => {
  const calendars = getAllCalendars().filter((c) => c.id !== id);
  localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars));

  // If deleted calendar was active, switch to first available
  if (getActiveCalendarId() === id) {
    if (calendars.length > 0) {
      setActiveCalendar(calendars[0].id);
    } else {
      localStorage.removeItem(ACTIVE_CALENDAR_KEY);
    }
  }
};

export const renameCalendar = (id: string, newName: string): void => {
  const calendar = getCalendarById(id);
  if (calendar) {
    calendar.name = newName;
    saveCalendar(calendar);
  }
};

export const setActiveCalendar = (id: string): void => {
  localStorage.setItem(ACTIVE_CALENDAR_KEY, id);
};

export const getActiveCalendarId = (): string | null => {
  return localStorage.getItem(ACTIVE_CALENDAR_KEY);
};

export const getActiveCalendar = (): Calendar | null => {
  const id = getActiveCalendarId();
  if (!id) {
    // If no active calendar, create a default one
    const calendars = getAllCalendars();
    if (calendars.length === 0) {
      return createCalendar("Personal");
    } else {
      setActiveCalendar(calendars[0].id);
      return calendars[0];
    }
  }
  return getCalendarById(id) || null;
};

// Entry Management Functions (for active calendar)

export const saveEntry = (entry: DayEntry): void => {
  const calendar = getActiveCalendar();
  if (!calendar) return;

  const existingIndex = calendar.entries.findIndex(
    (e) =>
      new Date(e.date).toDateString() === new Date(entry.date).toDateString()
  );

  if (existingIndex >= 0) {
    calendar.entries[existingIndex] = entry;
  } else {
    calendar.entries.push(entry);
  }

  saveCalendar(calendar);
};

export const getAllEntries = (): DayEntry[] => {
  const calendar = getActiveCalendar();
  return calendar ? calendar.entries : [];
};

export const getEntryByDate = (date: Date): DayEntry | undefined => {
  const entries = getAllEntries();
  const found = entries.find(
    (e) =>
      new Date(e.date).toDateString() === date.toDateString()
  );
  if (!found) return undefined;
  // ensure returned entry.date is a Date object for consumers
  return {
    ...found,
    date: new Date(found.date),
  };
};

export const deleteEntry = (date: Date): void => {
  const calendar = getActiveCalendar();
  if (!calendar) return;

  calendar.entries = calendar.entries.filter(
    (e) =>
      new Date(e.date).toDateString() !== date.toDateString()
  );
  saveCalendar(calendar);
};

export const calculateMonthlySummary = (
  year: number,
  month: number
): MonthSummary => {
  const entries = getAllEntries();
  const monthEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === year && entryDate.getMonth() === month;
  });

  let totalFTL = 0;
  let totalOL = 0;
  let totalWeekend = 0;
  let workDays = 0;
  let csMonth = 0;
  let csTotal = 0;

  // Sum total OL and weekend hours from entries (for the month)
  monthEntries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const dayTotalMinutes = entry.shifts.reduce(
      (sum, shift) => sum + shift.duration,
      0
    );

    totalOL += dayTotalMinutes;

    // sum CS minutes for this month
    const csForDay = entry.shifts
      .filter((s) => s.type === "cs")
      .reduce((sum, s) => sum + s.duration, 0);
    csMonth += csForDay;

    if (isWeekday(entryDate)) {
      workDays += 1;
    } else if (isWeekend(entryDate)) {
      totalWeekend += dayTotalMinutes;
    }
  });

  // Calculate total FTL as every weekday in the month counts for 8 hours
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let weekdaysCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (isWeekday(date)) weekdaysCount += 1;
  }

  totalFTL = weekdaysCount * 8 * 60; // minutes

  // Calculate cumulative CS total up to and including this month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const allEntries = getAllEntries();
  const entriesUpToMonth = allEntries.filter((entry) => {
    const d = new Date(entry.date);
    return d <= lastDayOfMonth;
  });

  entriesUpToMonth.forEach((entry) => {
    const cs = entry.shifts
      .filter((s) => s.type === "cs")
      .reduce((sum, s) => sum + s.duration, 0);
    csTotal += cs;
  });

  // Calculate cumulative OL up to month
  let totalOLUpToMonth = 0;
  entriesUpToMonth.forEach((entry) => {
    totalOLUpToMonth += entry.shifts.reduce((sum, s) => sum + s.duration, 0);
  });

  // Calculate cumulative FTL (sum of weekdays*8h) from first entry month to target month
  let totalFTLUpToMonth = 0;
  if (entriesUpToMonth.length > 0) {
    const sorted = entriesUpToMonth
      .map((e) => new Date(e.date))
      .sort((a, b) => a.getTime() - b.getTime());
    const start = new Date(sorted[0].getFullYear(), sorted[0].getMonth(), 1);
    const end = lastDayOfMonth;

    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
      const dim = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
      let wdCount = 0;
      for (let d = 1; d <= dim; d++) {
        const dt = new Date(cur.getFullYear(), cur.getMonth(), d);
        if (isWeekday(dt)) wdCount += 1;
      }
      totalFTLUpToMonth += wdCount * 8 * 60;
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  }

  const osMonth = totalOL - totalFTL; // month OS (no CS subtraction)
  // osTotal: sum OS only for months that actually have entries
  let osTotal = 0;
  const monthlyBreakdown: {
    year: number;
    month: number;
    monthOL: number;
    monthFTL: number;
    monthOS: number;
    monthCS: number;
  }[] = [];

  // determine earliest month to consider (earliest saved entry or target month)
  const all = getAllEntries();
  let startYear = year;
  let startMonth = month;
  if (all.length > 0) {
    const sortedAll = all
      .map((e) => new Date(e.date))
      .sort((a, b) => a.getTime() - b.getTime());
    startYear = sortedAll[0].getFullYear();
    startMonth = sortedAll[0].getMonth();
  }

  let cur = new Date(startYear, startMonth, 1);
  const target = new Date(year, month, 1);
  while (cur <= target) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const monthEntriesAll = all.filter((entry) => {
      const d = new Date(entry.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });

    const monthOL = monthEntriesAll.reduce(
      (sum, entry) => sum + entry.shifts.reduce((s, sh) => s + sh.duration, 0),
      0
    );

    // calculate month FTL (weekdays * 8h)
    const dim = new Date(y, m + 1, 0).getDate();
    let monthWeekdays = 0;
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(y, m, d);
      if (isWeekday(dt)) monthWeekdays += 1;
    }
    const monthFTL = monthWeekdays * 8 * 60;

    const monthCS = monthEntriesAll.reduce(
      (sum, entry) =>
        sum +
        entry.shifts.filter((s) => s.type === "cs").reduce((s2, s3) => s2 + s3.duration, 0),
      0
    );

    const monthOS = monthOL - monthFTL;

    // only add to osTotal if there are entries (monthOL > 0)
    if (monthOL > 0) osTotal += monthOS;

    monthlyBreakdown.push({
      year: y,
      month: m,
      monthOL,
      monthFTL,
      monthOS,
      monthCS,
    });

    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  // csBalance (not shown in UI anymore) would be osTotal - csTotal if needed
  const csBalance = osTotal - csTotal;

  // Calculate OS debt: show unpaid OS from exactly 4 months ago (when 90 days have passed)
  // OS from month M becomes debt visible in month M+4
  let osDebt90d = 0;
  
  // Find the month that is exactly 4 months before current viewed month
  let debtMonth = month - 4;
  let debtYear = year;
  
  // Handle negative months (wrap to previous year)
  while (debtMonth < 0) {
    debtMonth += 12;
    debtYear -= 1;
  }

  // Find OS from that month
  const debtMonthData = monthlyBreakdown.find(
    (m) => m.year === debtYear && m.month === debtMonth
  );

  if (debtMonthData) {
    const { monthOS, monthCS } = debtMonthData;
    // CS pays off the debt from this month
    osDebt90d = Math.max(0, monthOS - monthCS);
  }

  return {
    totalFTL: roundToNearestMinute(totalFTL),
    totalOL: roundToNearestMinute(totalOL),
    totalWeekend: roundToNearestMinute(totalWeekend),
    workDays,
    offDays: 0,
    csMonth: roundToNearestMinute(csMonth),
    csTotal: roundToNearestMinute(csTotal),
    osMonth: roundToNearestMinute(osMonth),
    osTotal: roundToNearestMinute(osTotal),
    csBalance: roundToNearestMinute(csBalance),
    osDebt90d: roundToNearestMinute(osDebt90d),
  };
};

// Debug helper: attach a function to window to inspect per-month breakdown and raw entries
if (typeof window !== "undefined") {
  (window as any).pontajDebug = (y?: number, m?: number) => {
    // if year/month provided, call calculateMonthlySummary for that point
    if (typeof y === "number" && typeof m === "number") {
      // @ts-ignore
      const s = calculateMonthlySummary(y, m);
      console.log("Monthly summary for", `${m + 1}/${y}`, s);
      return s;
    }

    const calendars = localStorage.getItem(CALENDARS_STORAGE_KEY);
    const parsed = calendars ? JSON.parse(calendars) : [];
    console.log("Stored calendars:", parsed);
    const activeId = localStorage.getItem(ACTIVE_CALENDAR_KEY);
    const cal = parsed.find((c: any) => c.id === activeId) || parsed[0];
    if (!cal) {
      console.warn("No calendar data found in localStorage.");
      return parsed;
    }

    const entries = (cal.entries || []).map((e: any) => ({
      date: new Date(e.date).toDateString(),
      minutes: e.shifts.reduce((s: number, sh: any) => s + (sh.duration || 0), 0),
      shifts: e.shifts.map((s: any) => s.type).join(","),
    }));
    console.table(entries);
    return { calendars: parsed, active: cal, entries };
  };
}
