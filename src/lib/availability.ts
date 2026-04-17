import { RecurrenceRule } from "@prisma/client";

/**
 * Days of the week for availability
 */
export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

/**
 * Convert day name to index (0 = Monday, 6 = Sunday)
 */
export function dayNameToIndex(day: DayOfWeek): number {
  return DAYS_OF_WEEK.indexOf(day);
}

/**
 * Convert index to day name
 */
export function indexToDayName(index: number): DayOfWeek {
  return DAYS_OF_WEEK[index % 7];
}

/**
 * Get current day index (0 = Monday, 6 = Sunday)
 */
export function getCurrentDayIndex(): number {
  const now = new Date();
  return (now.getDay() + 6) % 7; // JavaScript: Sunday=0, so we adjust
}

/**
 * Availability slot for a single day and time range
 */
export interface DayAvailability {
  day: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

/**
 * Weekly schedule template
 */
export interface WeeklySchedule {
  Monday: { startTime: string; endTime: string; isAvailable: boolean };
  Tuesday: { startTime: string; endTime: string; isAvailable: boolean };
  Wednesday: { startTime: string; endTime: string; isAvailable: boolean };
  Thursday: { startTime: string; endTime: string; isAvailable: boolean };
  Friday: { startTime: string; endTime: string; isAvailable: boolean };
  Saturday: { startTime: string; endTime: string; isAvailable: boolean };
  Sunday: { startTime: string; endTime: string; isAvailable: boolean };
}

/**
 * Default weekly availability (all days, all hours - "always available")
 */
export function getDefaultWeeklySchedule(): WeeklySchedule {
  const defaultDay = {
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  };

  return {
    Monday: defaultDay,
    Tuesday: defaultDay,
    Wednesday: defaultDay,
    Thursday: defaultDay,
    Friday: defaultDay,
    Saturday: { ...defaultDay, isAvailable: false },
    Sunday: { ...defaultDay, isAvailable: false },
  };
}

/**
 * Create AvailabilitySlot records from weekly schedule
 */
export interface CreateAvailabilityInput {
  userId: string;
  schedule: WeeklySchedule;
}

/**
 * Time to Date conversion helper for this week
 */
export function getNextOccurrenceOfDay(dayIndex: number, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  
  // Get the current ISO weekday (1 = Monday, 7 = Sunday)
  const todayISO = now.getDay() === 0 ? 7 : now.getDay();
  const targetISO = dayIndex + 1; // 0-6 to 1-7
  
  let daysUntilTarget = targetISO - todayISO;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7; // Next week
  } else if (daysUntilTarget === 0) {
    // Same day - check if time has passed
    const targetDate = new Date(now);
    targetDate.setHours(hours, minutes, 0, 0);
    if (targetDate < now) {
      daysUntilTarget = 7; // Next week
    }
  }
  
  const result = new Date(now);
  result.setDate(result.getDate() + daysUntilTarget);
  result.setHours(hours, minutes, 0, 0);
  
  return result;
}

/**
 * Check if user is available at a specific time
 */
export function isAvailableAtTime(
  schedule: WeeklySchedule,
  checkDate: Date = new Date()
): boolean {
  const dayIndex = (checkDate.getDay() + 6) % 7; // Adjust to Monday=0
  const dayName = indexToDayName(dayIndex);
  const hours = String(checkDate.getHours()).padStart(2, "0");
  const minutes = String(checkDate.getMinutes()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;

  const daySlot = schedule[dayName];

  if (!daySlot?.isAvailable) {
    return false;
  }

  return currentTime >= daySlot.startTime && currentTime <= daySlot.endTime;
}

/**
 * Get availability summary for display
 */
export function getAvailabilitySummary(schedule: WeeklySchedule): string {
  const available = Object.entries(schedule)
    .filter(([_, slot]) => slot.isAvailable)
    .map(([day]) => day.substring(0, 3)); // Mon, Tue, etc.

  if (available.length === 0) {
    return "Not available";
  }

  if (available.length === 7) {
    return "Available daily";
  }

  if (available.length === 5) {
    // Check if it's weekdays
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    if (available.every((day) => weekdays.includes(day))) {
      return "Available weekdays";
    }
  }

  if (available.length <= 3) {
    return `Available ${available.join(", ")}`;
  }

  return `Available ${available.length} days/week`;
}

/**
 * Get availability for a specific day
 */
export function getDayAvailability(
  schedule: WeeklySchedule,
  day: DayOfWeek
): DayAvailability {
  const slot = schedule[day];
  return {
    day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isAvailable: slot.isAvailable,
  };
}

/**
 * Format time for display
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Parse time string to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if time range is valid
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return start < end && start >= 0 && end <= 24 * 60;
}

/**
 * Get friendly availability description
 */
export function getAvailabilityDescription(schedule: WeeklySchedule): string[] {
  return Object.entries(schedule)
    .filter(([_, slot]) => slot.isAvailable)
    .map(([day, slot]) => `${day} ${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`);
}

/**
 * Calculate overlapping availability between two users
 */
export function getOverlappingAvailability(
  schedule1: WeeklySchedule,
  schedule2: WeeklySchedule
): WeeklySchedule {
  const overlapping = { ...schedule1 };

  for (const day of DAYS_OF_WEEK) {
    const slot1 = schedule1[day];
    const slot2 = schedule2[day];

    if (!slot1.isAvailable || !slot2.isAvailable) {
      overlapping[day] = { ...slot1, isAvailable: false };
      continue;
    }

    // Both available - find overlapping time range
    const start1 = timeToMinutes(slot1.startTime);
    const end1 = timeToMinutes(slot1.endTime);
    const start2 = timeToMinutes(slot2.startTime);
    const end2 = timeToMinutes(slot2.endTime);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    if (overlapStart < overlapEnd) {
      const startHours = Math.floor(overlapStart / 60);
      const startMins = overlapStart % 60;
      const endHours = Math.floor(overlapEnd / 60);
      const endMins = overlapEnd % 60;

      overlapping[day] = {
        startTime: `${String(startHours).padStart(2, "0")}:${String(startMins).padStart(2, "0")}`,
        endTime: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
        isAvailable: true,
      };
    } else {
      overlapping[day] = { ...slot1, isAvailable: false };
    }
  }

  return overlapping;
}
