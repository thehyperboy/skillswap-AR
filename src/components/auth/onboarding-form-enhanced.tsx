"use client";

import { useState } from "react";
import { LocationCapture } from "@/components/location/location-capture";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { transitions } from "@/lib/animations";

type OnboardingFormProps = {
  initialData: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    city?: string;
    locality?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    locationPrivacy?: "PUBLIC" | "APPROXIMATE" | "PRIVATE";
    collaborationMode?: "ONLINE" | "OFFLINE" | "HYBRID";
  };
};

/**
 * Step indicator for onboarding progress
 */
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-600">
          Step {currentStep} of {totalSteps}
        </p>
        <div className="mt-2 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 transition-all duration-300 ${
                i < currentStep
                  ? "w-8 bg-brand"
                  : i === currentStep
                    ? "w-12 bg-brand/60"
                    : "w-4 bg-slate-200"
              }`}
              style={{ borderRadius: "2px" }}
            />
          ))}
        </div>
      </div>
      <div className="text-3xl font-bold text-brand/20">{Math.round((currentStep / totalSteps) * 100)}%</div>
    </div>
  );
}

/**
 * Trust message badge
 */
function TrustBadge() {
  return (
    <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-3">
      <span className="text-lg mt-0.5">🔒</span>
      <div className="text-sm">
        <p className="font-semibold text-green-900">Your data is private and secure</p>
        <p className="text-green-700 text-xs mt-1">We store location data securely and only share what you approve.</p>
      </div>
    </div>
  );
}

/**
 * Form section with title and description
 */
function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 pb-6 border-b border-slate-200 last:border-b-0">
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl mt-0.5">{icon}</span>}
        <div>
          <h3 className="font-semibold text-charcoal">{title}</h3>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
      </div>
      <div className="ml-0">{children}</div>
    </div>
  );
}

/**
 * Enhanced onboarding form with better UX and trust messaging
 */
export function OnboardingForm({ initialData }: OnboardingFormProps) {
  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [city, setCity] = useState(initialData.city || "");
  const [locality, setLocality] = useState(initialData.locality || "");
  const [country, setCountry] = useState(initialData.country || "");
  const [latitude, setLatitude] = useState<number | undefined>(initialData.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialData.longitude);
  const [locationPrivacy, setLocationPrivacy] = useState(initialData.locationPrivacy || "APPROXIMATE");
  const [collaborationMode, setCollaborationMode] = useState(
    initialData.collaborationMode || "HYBRID"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isComplete =
    displayName.trim().length > 0 &&
    city.trim().length > 0 &&
    (latitude !== undefined && longitude !== undefined);

  function handleCoordinatesChange(data: {
    latitude?: number;
    longitude?: number;
    city?: string;
    locality?: string;
  }) {
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    if (data.city !== undefined) setCity(data.city ?? "");
    if (data.locality !== undefined) setLocality(data.locality ?? "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        bio,
        avatarUrl,
        city,
        locality,
        country,
        latitude,
        longitude,
        locationPrivacy,
        collaborationMode,
        onboardingStep: 1,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage({
        type: "error",
        text: data.error || "Failed to save profile.",
      });
      setSaving(false);
      return;
    }

    setMessage({
      type: "success",
      text: "✓ Profile complete! You're ready to start connecting with local educators.",
    });
    setSaving(false);

    // Redirect after success
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Step indicator */}
      <StepIndicator currentStep={1} totalSteps={3} />

      {/* Trust badge */}
      <TrustBadge />

      {/* Profile Information Section */}
      <FormSection
        title="Profile Information"
        description="Let others know who you are"
        icon="👤"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Display Name *
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should others see you?"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              This is how you'll appear on your profile and in searches.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Avatar URL
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
            />
            <p className="text-xs text-slate-500 mt-1">
              Add a profile photo to build trust. Optional for now.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              About You
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your skills, interests, and what you enjoy teaching..."
              rows={3}
            />
            <p className="text-xs text-slate-500 mt-1">
              A good bio helps collaborators understand your expertise.
            </p>
          </div>
        </div>
      </FormSection>

      {/* Location Section */}
      <FormSection
        title="Your Location"
        description="Help others find you in their neighborhood"
        icon="📍"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Country
              </label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., United States"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location Privacy *
              </label>
              <Select
                value={locationPrivacy}
                onChange={(e) =>
                  setLocationPrivacy(e.target.value as "PUBLIC" | "APPROXIMATE" | "PRIVATE")
                }
              >
                <option value="PRIVATE">Private (only me)</option>
                <option value="APPROXIMATE">Approximate (neighborhood only)</option>
                <option value="PUBLIC">Public (exact location)</option>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                We recommend "Approximate" for safety.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Find Your City *
            </label>
            <LocationCapture
              onCoordinatesChange={handleCoordinatesChange}
              initialValue={{ city, locality, latitude, longitude }}
            />
            {city && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                ✓ Location detected: {city}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      {/* Collaboration Preferences */}
      <FormSection
        title="How You Collaborate"
        description="Choose your preferred way to connect"
        icon="🤝"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Collaboration Mode
            </label>
            <Select
              value={collaborationMode}
              onChange={(e) =>
                setCollaborationMode(e.target.value as "ONLINE" | "OFFLINE" | "HYBRID")
              }
            >
              <option value="OFFLINE">In-person / Offline</option>
              <option value="ONLINE">Online / Remote</option>
              <option value="HYBRID">Both (Flexible)</option>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              You can change this anytime in your settings.
            </p>
          </div>
        </div>
      </FormSection>

      {/* Completion status and CTA */}
      <div className="space-y-4 pt-6">
        {!isComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            <p className="font-semibold">Almost there!</p>
            <p className="text-xs mt-1">
              Fill in your name, city, and location to complete your profile.
            </p>
          </div>
        )}

        {message && (
          <div
            className={`rounded-lg border p-3 text-sm transition-all duration-300 ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={saving || !isComplete}
          size="lg"
          className={`w-full ${transitions.normal}`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin-slow">⚙️</span>
              Saving your profile...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Complete onboarding
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          You can edit your profile details anytime from your settings.
        </p>
      </div>
    </form>
  );
}
