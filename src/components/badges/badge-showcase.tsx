'use client';

import { getBadgeDefinition, getRarityColor, getRarityBorder } from '@/lib/badges';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';

interface BadgeShowcaseProps {
  badges: string[];
  showTitle?: boolean;
  showRarity?: boolean;
  compact?: boolean;
}

export function BadgeShowcase({
  badges,
  showTitle = true,
  showRarity = false,
  compact = false,
}: BadgeShowcaseProps) {
  if (badges.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {compact ? 'No badges yet' : 'Earn badges by completing collaborations and maintaining high ratings'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && <h3 className="text-lg font-semibold text-charcoal">🏅 Achievements</h3>}
      <div className={`grid gap-3 ${compact ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {badges.map((badgeId) => {
          const badge = getBadgeDefinition(badgeId);
          if (!badge) return null;

          const rarityColor = getRarityColor(badge.rarity);
          const rarityBorder = getRarityBorder(badge.rarity);

          const badgeElement = (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`p-3 rounded-lg border-2 ${rarityBorder} ${
                      compact ? 'cursor-help' : 'cursor-help bg-white hover:shadow-md transition'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-3xl mb-1">{badge.icon}</p>
                      {!compact && (
                        <>
                          <p className="text-xs font-semibold text-charcoal">{badge.name}</p>
                          {showRarity && (
                            <p className={`text-xs font-medium mt-1 px-2 py-1 rounded ${rarityColor}`}>
                              {badge.rarity}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="z-50 bg-charcoal text-white px-3 py-2 rounded-lg text-sm shadow-lg max-w-xs"
                >
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-xs text-slate-200">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );

          return <div key={badgeId}>{badgeElement}</div>;
        })}
      </div>
    </div>
  );
}
