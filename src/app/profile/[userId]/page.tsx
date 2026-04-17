import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillKarmaCard } from "@/components/reviews/skill-karma-card";
import { ReviewDisplay } from "@/components/reviews/review-display";
import { AvailabilityDisplay } from "@/components/availability/availability-display";
import { DAYS_OF_WEEK, WeeklySchedule } from "@/lib/availability";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      profile: true,
      skillKarma: true,
      offeredSkills: { include: { skill: true } },
      wantedSkills: { include: { skill: true } },
      availabilitySlots: { orderBy: { startsAt: "asc" } },
      reviewsReceived: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/explore");
  }

  // Convert availability slots to schedule format
  const getAvailabilitySchedule = (): WeeklySchedule => {
    const schedule: WeeklySchedule = {} as WeeklySchedule;
    for (const day of DAYS_OF_WEEK) {
      schedule[day] = {
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: false,
      };
    }

    if (user.availabilitySlots.length === 0) {
      return schedule;
    }

    // Group slots by day of week
    const baseDate = new Date("2024-01-01"); // Monday reference
    user.availabilitySlots.forEach((slot) => {
      const dayIndex = (slot.startsAt.getUTCDay() - baseDate.getUTCDay() + 7) % 7;
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

    return schedule;
  };

  const availability = getAvailabilitySchedule();

  const karma = user.skillKarma || {
    points: 0,
    level: 1,
    badge: "NOVICE" as const,
    completedSessionCount: 0,
    averageRating: 5.0,
    totalReviewsReceived: 0,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand/10 via-white to-transparent rounded-2xl border border-brand-soft p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-brand to-brand/60 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {(user.profile?.displayName || user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-charcoal">
              {user.profile?.displayName || user.name || "Skill Exchanger"}
            </h1>
            {user.profile?.bio && (
              <p className="text-slate-600 mt-2">{user.profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {user.profile?.city && (
                <span className="text-sm text-slate-600">📍 {user.profile.city}</span>
              )}
              <Badge variant="success">
                ⭐ Level {karma.level}{" "}
                {
                  // @ts-expect-error - badge may not be in old Prisma types yet
                  karma.badge
                }
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Karma & Stats */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          <SkillKarmaCard
            // @ts-expect-error - badge and averageRating may not be in old Prisma types yet
            badge={karma.badge}
            points={karma.points}
            level={karma.level}
            completedSessions={karma.completedSessionCount}
            // @ts-expect-error: averageRating may not be in old Prisma types yet
            averageRating={karma.averageRating}
          />

          {/* Skills Section */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4">Availability</h3>
            <AvailabilityDisplay schedule={availability} />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4">Skills Offered</h3>
            {user.offeredSkills.length > 0 ? (
              <div className="space-y-2">
                {user.offeredSkills.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm"
                  >
                    <p className="font-medium text-charcoal">{item.skill.name}</p>
                    <p className="text-xs text-green-700 capitalize">{item.proficiency}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No skills offered yet</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4">Wants to Learn</h3>
            {user.wantedSkills.length > 0 ? (
              <div className="space-y-2">
                {user.wantedSkills.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm"
                  >
                    <p className="font-medium text-charcoal">{item.skill.name}</p>
                    <p className="text-xs text-blue-700">Learning</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No learning goals added yet</p>
            )}
          </Card>
        </div>

        {/* Right Column: Reviews */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <ReviewDisplay
            reviews={user.reviewsReceived}
            userName={user.profile?.displayName || user.name || "This user"}
            // @ts-expect-error - averageRating may not be in old Prisma types yet
            averageRating={karma.averageRating}
            totalReviews={user.reviewsReceived.length}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="p-6 bg-gradient-to-r from-brand-soft/30 to-transparent border-brand-soft/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/explore" className="flex-1">
            <Button className="bg-brand hover:bg-[#2a6f3b] text-white flex-1 w-full">
              ← Back to Explore
            </Button>
          </Link>
          <Link href="/requests/inbox" className="flex-1">
            <Button variant="outline" className="flex-1 w-full">
              View Requests
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
