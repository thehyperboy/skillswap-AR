import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/location/geo";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const radius = Number(url.searchParams.get("radius")) || 10;

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const users = await prisma.profile.findMany({
    where: { latitude: { not: null }, longitude: { not: null }, locationPrivacy: { not: "PRIVATE" } },
    include: { user: { include: { skillKarma: true } } },
  });

  const nearby = users
    .map((profile) => {
      if (profile.latitude == null || profile.longitude == null) return null;
      const distance = haversineDistance({ latitude: lat, longitude: lon }, { latitude: profile.latitude, longitude: profile.longitude });
      return { profile, distance };
    })
    .filter((p): p is { profile: typeof users[number]; distance: number } => p !== null && p.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 30)
    .map((p) => ({
      userId: p.profile.userId,
      displayName: p.profile.displayName,
      city: p.profile.city,
      locality: p.profile.locality,
      latitude: p.profile.latitude,
      longitude: p.profile.longitude,
      distanceKm: Number(p.distance.toFixed(1)),
      collaborationMode: p.profile.collaborationMode,
      skillKarma: p.profile.user.skillKarma?.points ?? 0,
      locationPrivacy: p.profile.locationPrivacy,
    }));

  return NextResponse.json({ nearby });
}
