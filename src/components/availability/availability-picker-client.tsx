"use client";

import { useState } from "react";
import { DaySelector } from "./availability-picker";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK, DayOfWeek, WeeklySchedule } from "@/lib/availability";

interface AvailabilityPickerClientProps {
  initialSchedule: Record<string, any>;
}

/**
 * Client component for availability picker
 * Handles form submission and state management
 */
export function AvailabilityPickerClient({
  initialSchedule,
}: AvailabilityPickerClientProps) {
  const [schedule, setSchedule] = useState<Record<string, any>>(initialSchedule);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert schedule to API format
      const scheduleData: Record<string, any> = {};
      for (const day of DAYS_OF_WEEK) {
        scheduleData[day] = {
          startTime: schedule[day].startTime,
          endTime: schedule[day].endTime,
          isAvailable: schedule[day].isAvailable,
        };
      }

      const response = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: scheduleData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save availability");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      console.error("Error saving availability:", err);
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
              ? { day, ...unavailable }
              : { day, ...defaultDayBiz };
        });
        break;
      case "weekends":
        DAYS_OF_WEEK.forEach((day) => {
          newSchedule[day] =
            day === "Saturday" || day === "Sunday"
              ? { day, ...defaultDayBiz }
              : { day, ...unavailable };
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
          Weekdays (9am-5pm)
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
          Evenings (6pm-10pm)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPresets("none")}
        >
          Clear All
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          ✓ Availability saved successfully!
        </div>
      )}

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
        disabled={saving}
        size="lg"
        className="w-full"
      >
        {saving ? "Saving..." : "Save Availability"}
      </Button>
    </div>
  );
}
