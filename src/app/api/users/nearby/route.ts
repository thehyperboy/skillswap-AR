import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/location/geo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusKm = Math.min(Number(searchParams.get("radius")) || 15, 100);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const users = await prisma.profile.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      locationPrivacy: { not: "PRIVATE" },
    },
    include: {
      user: true,
    },
  });

  const nearby = users
    .map((profile) => {
      if (profile.latitude == null || profile.longitude == null) return null;
      const dist = haversineDistance({ latitude: lat, longitude: lng }, { latitude: profile.latitude, longitude: profile.longitude });
      return { profile, distanceKm: dist };
    })
    .filter((entry): entry is { profile: typeof users[number]; distanceKm: number } => entry !== null && entry.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20)
    .map((entry) => ({
      id: entry.profile.id,
      displayName: entry.profile.displayName,
      city: entry.profile.city,
      locality: entry.profile.locality,
      distanceKm: Number(entry.distanceKm.toFixed(2)),
      collaborationMode: entry.profile.collaborationMode,
      locationPrivacy: entry.profile.locationPrivacy,
    }));

  return NextResponse.json({ nearby });
}
