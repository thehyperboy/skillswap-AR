import { type FC } from "react";
import { Button } from "./button";

type LoadingSkeletonProps = {
  variant?: "card" | "text" | "circle" | "line";
  count?: number;
  className?: string;
};

/**
 * LoadingSkeleton: Animated placeholder for loading states
 * Creates placeholder content while data loads
 */
export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({
  variant = "card",
  count = 1,
  className = "",
}) => {
  const getSkeletonClass = () => {
    const baseClasses =
      "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse";
    switch (variant) {
      case "circle":
        return `${baseClasses} rounded-full w-12 h-12`;
      case "text":
        return `${baseClasses} rounded-lg h-4 w-3/4`;
      case "line":
        return `${baseClasses} rounded-lg h-2 w-full`;
      case "card":
      default:
        return `${baseClasses} rounded-2xl h-48 w-full`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={getSkeletonClass()} />
      ))}
    </div>
  );
};

type EmptyStateVariant =
  | "no-results"
  | "no-connection"
  | "no-availability"
  | "no-requests"
  | "no-reviews"
  | "custom";

interface EnhancedEmptyStateProps {
  title: string;
  description: string;
  variant?: EmptyStateVariant;
  icon?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  illustration?: React.ReactNode;
}

const emptyStateIcons: Record<EmptyStateVariant, string> = {
  "no-results": "🔍",
  "no-connection": "🤝",
  "no-availability": "📅",
  "no-requests": "📬",
  "no-reviews": "⭐",
  custom: "💭",
};

/**
 * EnhancedEmptyState: Premium empty state with variants
 * Shows contextual messaging and actions for empty states
 */
export const EnhancedEmptyState: FC<EnhancedEmptyStateProps> = ({
  title,
  description,
  variant = "custom",
  icon,
  action,
  illustration,
}) => {
  const displayIcon = icon || emptyStateIcons[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon/Illustration */}
      <div className="mb-6 flex items-center justify-center">
        {illustration ? (
          <div className="text-6xl">{illustration}</div>
        ) : (
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 animate-pulse rounded-full bg-brand-soft/40" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-brand-soft/20 text-4xl">
              {displayIcon}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-bold text-charcoal">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      {/* Action */}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href}>
              <Button variant="primary">{action.label}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

import Link from "next/link";

interface SuccessStateProps {
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * SuccessState: Celebration state for successful actions
 * Shows confirmation with positive messaging
 */
export const SuccessState: FC<SuccessStateProps> = ({
  title,
  message,
  icon = "✓",
  action,
  secondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Success icon with animation */}
      <div className="mb-6 relative">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
          <span className="text-3xl text-green-600">{icon}</span>
        </div>
        <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-green-200 animate-ping opacity-75" />
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-bold text-charcoal">{title}</h3>
        <p className="text-sm text-slate-600">{message}</p>
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex gap-3 flex-wrap justify-center">
          {action && (
            <>
              {action.href ? (
                <Link href={action.href}>
                  <Button variant="primary">{action.label}</Button>
                </Link>
              ) : (
                <Button variant="primary" onClick={action.onClick}>
                  {action.label}
                </Button>
              )}
            </>
          )}
          {secondaryAction && (
            <>
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button variant="outline">{secondaryAction.label}</Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

/**
 * LoadingState: Full loading indicator with messaging
 * Centered loading state for full-page or modal loading
 */
export const LoadingState: FC<LoadingStateProps> = ({
  message = "Loading...",
  subMessage,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Spinner */}
      <div className="mb-6 relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand animate-spin" />
      </div>

      {/* Messaging */}
      <div className="space-y-1 max-w-md">
        <p className="text-sm font-medium text-charcoal">{message}</p>
        {subMessage && <p className="text-xs text-slate-500">{subMessage}</p>}
      </div>
    </div>
  );
};

interface ErrorStateProps {
  title: string;
  message: string;
  retry?: {
    label?: string;
    onClick: () => void;
  };
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * ErrorState: Error state with recovery actions
 * Shows error message with retry and navigation options
 */
export const ErrorState: FC<ErrorStateProps> = ({
  title,
  message,
  retry,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Error icon */}
      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full bg-red-100" />
          <div className="relative flex h-full w-full items-center justify-center text-3xl text-red-600">
            ⚠️
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-bold text-charcoal">{title}</h3>
        <p className="text-sm text-slate-600">{message}</p>
      </div>

      {/* Actions */}
      {(retry || action) && (
        <div className="mt-6 flex gap-3 flex-wrap justify-center">
          {retry && (
            <Button variant="primary" onClick={retry.onClick}>
              {retry.label || "Try again"}
            </Button>
          )}
          {action && (
            <>
              {action.href ? (
                <Link href={action.href}>
                  <Button variant="outline">{action.label}</Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={action.onClick}>
                  {action.label}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
