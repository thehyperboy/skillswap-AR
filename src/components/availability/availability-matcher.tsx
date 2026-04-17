"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  getOverlappingAvailability,
  WeeklySchedule,
  DAYS_OF_WEEK,
  formatTime,
  getAvailabilitySummary,
} from "@/lib/availability";
import { Badge } from "@/components/ui/badge";

interface AvailabilityMatcherProps {
  requesterName: string;
  targetUserName: string;
  requesterAvailability: WeeklySchedule;
  targetUserAvailability: WeeklySchedule;
}

/**
 * AvailabilityMatcher: Shows overlap between two users' availability
 * Helps collaborators find common times to meet
 */
export function AvailabilityMatcher({
  requesterName,
  targetUserName,
  requesterAvailability,
  targetUserAvailability,
}: AvailabilityMatcherProps) {
  const [overlap, setOverlap] = useState<WeeklySchedule | null>(null);

  useEffect(() => {
    const matchedSlots = getOverlappingAvailability(
      requesterAvailability,
      targetUserAvailability
    );
    setOverlap(matchedSlots);
  }, [requesterAvailability, targetUserAvailability]);

  if (!overlap) {
    return null;
  }

  const overlappingDays = DAYS_OF_WEEK.filter((day) => overlap[day].isAvailable);

  if (overlappingDays.length === 0) {
    return (
      <Card className="p-4 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          ⚠️ No overlapping availability found. Consider reaching out anyway —
          schedules can be flexible!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ✓ Overlapping Availability
        </h3>
        <p className="text-sm text-gray-600">
          Times when both {requesterName} and {targetUserName} are available for a collaboration session:
        </p>
      </div>

      {/* Overlapping slots */}
      <div className="bg-green-50 rounded-lg p-4 space-y-2">
        {overlappingDays.map((day) => {
          const slot = overlap[day];
          return (
            <div key={day} className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{day}</span>
              <span className="text-green-700 font-medium">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary badge */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">Best times to connect:</span>
        <Badge variant="secondary">
          {getAvailabilitySummary(overlap)}
        </Badge>
      </div>
    </Card>
  );
}

/**
 * AvailabilityCheckmark: Simple indicator if user is currently available
 */
interface AvailabilityCheckmarkProps {
  availability: WeeklySchedule;
  userName: string;
}

export function AvailabilityCheckmark({
  availability,
  userName,
}: AvailabilityCheckmarkProps) {
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
  const day = DAYS_OF_WEEK[dayIndex];
  
  const todaySlot = availability[day];
  if (!todaySlot.isAvailable) {
    return (
      <Badge variant="outline" className="text-gray-600">
        Not available today
      </Badge>
    );
  }

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;
  const isNowAvailable =
    currentTime >= todaySlot.startTime && currentTime <= todaySlot.endTime;

  if (isNowAvailable) {
    return (
      <Badge variant="success" className="bg-green-600">
        Available now
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      Available {formatTime(todaySlot.startTime)}-{formatTime(todaySlot.endTime)}
    </Badge>
  );
}
