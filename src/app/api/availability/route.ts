import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { WeeklySchedule } from "@/lib/availability";

/**
 * Validation schema for availability update
 */
const AvailabilityUpdateSchema = z.object({
  schedule: z.record(
    z.object({
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      isAvailable: z.boolean(),
    })
  ),
});

/**
 * GET /api/availability
 * Get current user's availability slots
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: { userId: session.user.id },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("GET /api/availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/availability
 * Update user's availability slots
 * Expected body: { schedule: WeeklySchedule }
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = AvailabilityUpdateSchema.parse(body);

    const { schedule } = validated;

    // Delete existing slots for this user
    await prisma.availabilitySlot.deleteMany({
      where: { userId: session.user.id },
    });

    // Create new slots from schedule
    const slots = [];
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const dayName = days[dayIndex];
      const daySchedule = (schedule as any)[dayName];

      if (daySchedule?.isAvailable) {
        const [startHours, startMins] = daySchedule.startTime
          .split(":")
          .map(Number);
        const [endHours, endMins] = daySchedule.endTime
          .split(":")
          .map(Number);

        // Create dates for this day (use a reference week, arbitrary dates)
        // Let's use Monday 2024-01-01 as reference
        const baseDate = new Date("2024-01-01"); // Monday
        const dayDate = new Date(baseDate);
        dayDate.setDate(dayDate.getDate() + dayIndex);

        const startsAt = new Date(dayDate);
        startsAt.setHours(startHours, startMins, 0, 0);

        const endsAt = new Date(dayDate);
        endsAt.setHours(endHours, endMins, 0, 0);

        slots.push({
          userId: session.user.id,
          startsAt,
          endsAt,
          recurring: "WEEKLY" as const,
        });
      }
    }

    // Bulk create
    const created = await prisma.availabilitySlot.createMany({
      data: slots,
    });

    return NextResponse.json({
      success: true,
      count: created.count,
      slots: await prisma.availabilitySlot.findMany({
        where: { userId: session.user.id },
        orderBy: { startsAt: "asc" },
      }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("PUT /api/availability error:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability
 * Add a single availability slot
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { startsAt, endsAt, recurring } = body;

    if (!startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        userId: session.user.id,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        recurring: recurring || "WEEKLY",
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("POST /api/availability error:", error);
    return NextResponse.json(
      { error: "Failed to create availability slot" },
      { status: 500 }
    );
  }
}
