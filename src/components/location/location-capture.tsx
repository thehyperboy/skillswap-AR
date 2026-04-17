"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LocationCaptureProps = {
  onCoordinatesChange: (data: { latitude?: number; longitude?: number; city?: string; locality?: string }) => void;
  initialValue?: { latitude?: number; longitude?: number; city?: string; locality?: string };
};

export function LocationCapture({ onCoordinatesChange, initialValue }: LocationCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState(initialValue?.city ?? "");
  const [locality, setLocality] = useState(initialValue?.locality ?? "");
  const [latitude, setLatitude] = useState<number | "">(initialValue?.latitude ?? "");
  const [longitude, setLongitude] = useState<number | "">(initialValue?.longitude ?? "");

  async function requestGeo() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        onCoordinatesChange({ latitude: lat, longitude: lon, city, locality });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. You can enter location manually.");
        } else {
          setError("Unable to fetch location. Please try again or enter manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 600000 },
    );
  }

  function triggerUpdate() {
    const lat = typeof latitude === "number" ? latitude : undefined;
    const lon = typeof longitude === "number" ? longitude : undefined;
    onCoordinatesChange({ latitude: lat, longitude: lon, city, locality });
  }

  return (
    <div className="rounded-2xl border border-brand-soft bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-charcoal">Location</h3>
        <Button variant="secondary" onClick={requestGeo} disabled={loading}>
          {loading ? "Requesting..." : "Use current location"}
        </Button>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Location helps find nearby skill partners. Exact coordinates are protected and used internally for matching.
      </p>
      {error ? <p className="mt-2 text-sm font-medium text-rose-600">{error}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={triggerUpdate}
          placeholder="City"
          aria-label="City"
        />
        <Input
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          onBlur={triggerUpdate}
          placeholder="Locality"
          aria-label="Locality"
        />
        <Input
          value={latitude}
          type="number"
          onChange={(e) => setLatitude(Number(e.target.value))}
          onBlur={triggerUpdate}
          placeholder="Latitude"
          aria-label="Latitude"
        />
        <Input
          value={longitude}
          type="number"
          onChange={(e) => setLongitude(Number(e.target.value))}
          onBlur={triggerUpdate}
          placeholder="Longitude"
          aria-label="Longitude"
        />
      </div>
    </div>
  );
}
