"use client";

import { Badge } from "@/components/ui/badge";
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  formatTime,
  getAvailabilitySummary,
  WeeklySchedule,
} from "@/lib/availability";

interface AvailabilityDisplayProps {
  schedule: WeeklySchedule;
  compact?: boolean;
}

/**
 * AvailabilityDisplay: Read-only view of availability
 * Shows formatted availability for each day of the week
 */
export function AvailabilityDisplay({
  schedule,
  compact = false,
}: AvailabilityDisplayProps) {
  const availableDays = DAYS_OF_WEEK.filter((day) => schedule[day].isAvailable);

  if (availableDays.length === 0) {
    return (
      <div className="text-gray-500 italic">
        Not currently accepting new collaborations
      </div>
    );
  }

  if (compact) {
    return (
      <Badge variant="secondary">{getAvailabilitySummary(schedule)}</Badge>
    );
  }

  return (
    <div className="space-y-2">
      {availableDays.map((day) => {
        const slot = schedule[day];
        return (
          <div key={day} className="flex items-center gap-3 text-sm">
            <span className="font-medium text-gray-700 min-w-24">{day}</span>
            <span className="text-gray-600">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface AvailabilityCardProps {
  userName: string;
  schedule: WeeklySchedule;
}

/**
 * AvailabilityCard: Compact card showing user's availability
 * Useful for profile displays and collaboration cards
 */
export function AvailabilityCard({ userName, schedule }: AvailabilityCardProps) {
  const summary = getAvailabilitySummary(schedule);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900">Availability</h4>
          <p className="text-xs text-gray-600">{userName}'s weekly schedule</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {summary}
        </Badge>
      </div>
      <div className="text-sm text-gray-700 space-y-1">
        {DAYS_OF_WEEK.filter((day) => schedule[day].isAvailable).map((day) => {
          const slot = schedule[day];
          return (
            <div key={day} className="flex justify-between">
              <span className="text-gray-600">{day}</span>
              <span className="font-medium">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TimelineViewProps {
  schedule: WeeklySchedule;
}

/**
 * TimelineView: Visual timeline representation of weekly availability
 */
export function TimelineView({ schedule }: TimelineViewProps) {
  const hoursInDay = 24;
  const hours = Array.from({ length: hoursInDay }, (_, i) => i);

  return (
    <div className="space-y-2">
      {/* Hour labels */}
      <div className="flex gap-1">
        <div className="w-20" />
        <div className="flex-1 flex gap-0.5 text-xs text-gray-500">
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center">
              {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline bars */}
      {DAYS_OF_WEEK.map((day) => {
        const slot = schedule[day];
        if (!slot.isAvailable) {
          return (
            <div key={day} className="flex gap-1">
              <div className="w-20 text-sm font-medium text-gray-700">
                {day.substring(0, 3)}
              </div>
              <div className="flex-1 bg-gray-100 rounded h-6" />
            </div>
          );
        }

        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const startPercent = ((startH + startM / 60) / 24) * 100;
        const endPercent = ((endH + endM / 60) / 24) * 100;
        const width = endPercent - startPercent;

        return (
          <div key={day} className="flex gap-1">
            <div className="w-20 text-sm font-medium text-gray-700">
              {day.substring(0, 3)}
            </div>
            <div className="flex-1 h-6 bg-gray-100 rounded relative overflow-hidden">
              <div
                className="absolute h-full bg-blue-500 rounded"
                style={{
                  left: `${startPercent}%`,
                  width: `${width}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
