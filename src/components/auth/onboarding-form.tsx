"use client";

import { useState } from "react";
import { LocationCapture } from "@/components/location/location-capture";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const [collaborationMode, setCollaborationMode] = useState(initialData.collaborationMode || "HYBRID");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleCoordinatesChange(data: { latitude?: number; longitude?: number; city?: string; locality?: string }) {
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
      setMessage(data.error || "Failed to save profile.");
      setSaving(false);
      return;
    }

    setMessage("Profile saved. Your local discovery is now stronger.");
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Display name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Avatar URL</label>
          <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Bio</label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Country</label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Collaboration mode</label>
          <Select value={collaborationMode} onChange={(e) => setCollaborationMode(e.target.value as "ONLINE" | "OFFLINE" | "HYBRID")}>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Location sharing</label>
          <Select value={locationPrivacy} onChange={(e) => setLocationPrivacy(e.target.value as "PUBLIC" | "APPROXIMATE" | "PRIVATE")}>
            <option value="PUBLIC">Public</option>
            <option value="APPROXIMATE">Approximate</option>
            <option value="PRIVATE">Private</option>
          </Select>
        </div>
      </div>

      <LocationCapture
        onCoordinatesChange={handleCoordinatesChange}
        initialValue={{ city, locality, latitude, longitude }}
      />

      <Button type="submit" disabled={saving} className="mt-3">
        {saving ? "Saving..." : "Save and finalize onboarding"}
      </Button>
      {message && <p className="text-sm mt-2 text-brand">{message}</p>}
    </form>
  );
}
