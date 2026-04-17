"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  DayAvailability,
  formatTime,
} from "@/lib/availability";
import { useState } from "react";

interface DaySelectorProps {
  day: DayOfWeek;
  availability: DayAvailability;
  onChange: (availability: DayAvailability) => void;
}

/**
 * DaySelector: Single day availability picker
 * Allows toggling availability and setting time range
 */
export function DaySelector({
  day,
  availability,
  onChange,
}: DaySelectorProps) {
  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg">
      {/* Day + Toggle */}
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-900">{day}</label>
        <button
          onClick={() =>
            onChange({
              ...availability,
              isAvailable: !availability.isAvailable,
            })
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            availability.isAvailable
              ? "bg-blue-600"
              : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              availability.isAvailable ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Time inputs (only show if available) */}
      {availability.isAvailable && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start
            </label>
            <Input
              type="time"
              value={availability.startTime}
              onChange={(e) =>
                onChange({
                  ...availability,
                  startTime: e.target.value,
                })
              }
              className="h-9"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              End
            </label>
            <Input
              type="time"
              value={availability.endTime}
              onChange={(e) =>
                onChange({
                  ...availability,
                  endTime: e.target.value,
                })
              }
              className="h-9"
            />
          </div>
        </div>
      )}

      {/* Display current times */}
      {availability.isAvailable && (
        <div className="text-sm text-gray-600">
          {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
        </div>
      )}
    </div>
  );
}

interface AvailabilityPickerProps {
  onSave: (schedule: Record<string, DayAvailability>) => Promise<void>;
  initialSchedule?: Record<string, DayAvailability>;
  isLoading?: boolean;
}

/**
 * AvailabilityPicker: Full weekly availability form
 * Allows user to set availability for each day of the week
 */
export function AvailabilityPicker({
  onSave,
  initialSchedule,
  isLoading = false,
}: AvailabilityPickerProps) {
  const [schedule, setSchedule] = useState<Record<string, DayAvailability>>(
    initialSchedule ||
      Object.fromEntries(
        DAYS_OF_WEEK.map((day) => [
          day,
          {
            day,
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: day !== "Saturday" && day !== "Sunday",
          },
        ])
      )
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(schedule);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickPresets = (preset: string) => {
    const newSchedule = { ...schedule };
    const defaultDayBiz = {
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    };
    const defaultDayEve = {
      startTime: "18:00",
      endTime: "22:00",
      isAvailable: true,
    };
    const unavailable = {
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: false,
    };

    switch (preset) {
      case "weekdays":
        DAYS_OF_WEEK.forEach((day) => {
          newSchedule[day] =
            day === "Saturday" || day === "Sunday"
              ? unavailable
              : { day, ...defaultDayBiz };
        });
        break;
      case "weekends":
        DAYS_OF_WEEK.forEach((day) => {
          newSchedule[day] =
            day === "Saturday" || day === "Sunday"
              ? { day, ...defaultDayBiz }
              : unavailable;
        });
        break;
      case "evenings":
        DAYS_OF_WEEK.forEach((day) => {
          newSchedule[day] = { day, ...defaultDayEve };
        });
        break;
      case "none":
        DAYS_OF_WEEK.forEach((day) => {
          newSchedule[day] = {
            day,
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: false,
          };
        });
        break;
    }
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-6">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPresets("weekdays")}
        >
          Weekdays
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPresets("weekends")}
        >
          Weekends
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPresets("evenings")}
        >
          Evenings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPresets("none")}
        >
          Clear All
        </Button>
      </div>

      {/* Day selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DAYS_OF_WEEK.map((day) => (
          <DaySelector
            key={day}
            day={day}
            availability={schedule[day]}
            onChange={(updated) =>
              setSchedule({ ...schedule, [day]: updated })
            }
          />
        ))}
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving || isLoading}
        className="w-full"
      >
        {saving ? "Saving..." : "Save Availability"}
      </Button>
    </div>
  );
}
