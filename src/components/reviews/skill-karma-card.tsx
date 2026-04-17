import { KarmaBadge } from "@/lib/karma";
import { Card } from "@/components/ui/card";
import { getBadgeEmoji, KARMA_LEVELS } from "@/lib/karma";

interface SkillKarmaCardProps {
  badge: KarmaBadge;
  points: number;
  level: number;
  completedSessions: number;
  averageRating: number;
}

export function SkillKarmaCard({
  badge,
  points,
  level,
  completedSessions,
  averageRating,
}: SkillKarmaCardProps) {
  const badgeEmoji = getBadgeEmoji(badge);

  return (
    <Card className="p-6 bg-gradient-to-br from-brand-soft/30 via-white to-blue-50 border-brand-soft/50">
      <div className="space-y-4">
        {/* Badge Display */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal">SkillKarma Score</h3>
            <p className="text-sm text-slate-600">Community reputation</p>
          </div>
          <div className="text-center">
            <p className="text-5xl">{badgeEmoji}</p>
            <p className="text-sm font-semibold text-brand mt-1">Level {level}</p>
          </div>
        </div>

        {/* Points Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Points</span>
            <span className="font-bold text-charcoal">{points}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-brand to-green-500 h-3 rounded-full transition-all duration-500"
              style={{
                width:
                  level === 5
                    ? "100%"
                    : `${
                        ((points -
                          (KARMA_LEVELS[
                            Object.keys(KARMA_LEVELS)[level - 1] as keyof typeof KARMA_LEVELS
                          ]?.minPoints || 0)) /
                          (KARMA_LEVELS[
                            Object.keys(KARMA_LEVELS)[level] as keyof typeof KARMA_LEVELS
                          ]?.minPoints || 1000)) *
                        100
                      }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <p className="text-xs text-slate-600">Sessions Completed</p>
            <p className="text-2xl font-bold text-blue-700">{completedSessions}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
            <p className="text-xs text-slate-600">Avg. Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}★</p>
          </div>
        </div>

        {/* Badge Info */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <p className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            {badge}
          </p>
          <p className="text-xs text-slate-600 mt-1">Trusted community member</p>
        </div>
      </div>
    </Card>
  );
}
