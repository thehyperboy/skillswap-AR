import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  formatTime,
  getDefaultWeeklySchedule,
} from "@/lib/availability";
import { AvailabilityPickerClient } from "@/components/availability/availability-picker-client";

export const metadata = {
  title: "Availability Settings | SkillSwap AR",
  description: "Manage your weekly availability for collaborations",
};

interface Slot {
  id: string;
  startsAt: Date;
  endsAt: Date;
  recurring: string;
}

interface DayAvailability {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

/**
 * Convert AvailabilitySlot records to weekly schedule format
 */
function slotsToSchedule(slots: Slot[]): Record<string, DayAvailability> {
  const schedule: Record<string, DayAvailability> = {};

  // Initialize with default (all unavailable)
  for (const day of DAYS_OF_WEEK) {
    schedule[day] = {
      day,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: false,
    };
  }

  // Fill in available slots
  slots.forEach((slot) => {
    // Infer day from startsAt date (using reference week Jan 1, 2024 = Monday)
    const baseDate = new Date("2024-01-01"); // Monday reference
    const dayIndex = (slot.startsAt.getUTCDay() - baseDate.getUTCDay() + 7) % 7;
    const day = DAYS_OF_WEEK[dayIndex];

    const hours = String(slot.startsAt.getHours()).padStart(2, "0");
    const minutes = String(slot.startsAt.getMinutes()).padStart(2, "0");
    const startTime = `${hours}:${minutes}`;

    const endH = String(slot.endsAt.getHours()).padStart(2, "0");
    const endM = String(slot.endsAt.getMinutes()).padStart(2, "0");
    const endTime = `${endH}:${endM}`;

    schedule[day] = {
      day,
      startTime,
      endTime,
      isAvailable: true,
    };
  });

  return schedule;
}

/**
 * Page: Settings > Availability
 * Allows users to manage their weekly availability
 */
export default async function AvailabilitySettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch current availability
  const slots = await prisma.availabilitySlot.findMany({
    where: { userId: session.user.id },
    orderBy: { startsAt: "asc" },
  });

  const schedule = slots.length > 0 ? slotsToSchedule(slots) : getDefaultWeeklySchedule();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Availability Settings
          </h1>
          <p className="text-gray-600">
            Set your weekly availability so collaborators know when you're free
            to connect.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-gray-900 mb-2">How this works</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Set your available hours for each day of the week</li>
            <li>Your availability appears on your profile</li>
            <li>Use it to find collaborators with overlapping schedules</li>
            <li>Update it anytime as your schedule changes</li>
          </ul>
        </div>

        {/* Availability picker */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <AvailabilityPickerClient initialSchedule={schedule} />
        </div>

        {/* Current schedule preview */}
        {Object.values(schedule).some((s) => s.isAvailable) && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Current Schedule</h3>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const slot = schedule[day];
                if (!slot.isAvailable) return null;
                return (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">{day}</span>
                    <span className="text-gray-600">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
