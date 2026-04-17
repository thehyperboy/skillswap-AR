import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DAYS_OF_WEEK, WeeklySchedule } from "@/lib/availability";

/**
 * GET /api/users/[userId]/availability
 * Get a user's weekly availability (public endpoint)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const slots = await prisma.availabilitySlot.findMany({
      where: { userId },
      orderBy: { startsAt: "asc" },
    });

    // Convert to weekly schedule
    const schedule: WeeklySchedule = {} as WeeklySchedule;
    for (const day of DAYS_OF_WEEK) {
      schedule[day] = {
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: false,
      };
    }

    if (slots.length > 0) {
      const baseDate = new Date("2024-01-01"); // Monday reference
      slots.forEach((slot) => {
        const dayIndex =
          (slot.startsAt.getUTCDay() - baseDate.getUTCDay() + 7) % 7;
        const day = DAYS_OF_WEEK[dayIndex];

        const hours = String(slot.startsAt.getHours()).padStart(2, "0");
        const minutes = String(slot.startsAt.getMinutes()).padStart(2, "0");
        const startTime = `${hours}:${minutes}`;

        const endH = String(slot.endsAt.getHours()).padStart(2, "0");
        const endM = String(slot.endsAt.getMinutes()).padStart(2, "0");
        const endTime = `${endH}:${endM}`;

        schedule[day] = {
          startTime,
          endTime,
          isAvailable: true,
        };
      });
    }

    return NextResponse.json({ userId, schedule, slotCount: slots.length });
  } catch (error) {
    console.error("GET /api/users/[userId]/availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user availability" },
      { status: 500 }
    );
  }
}
