import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/validators/profile";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: parsed.displayName,
        bio: parsed.bio,
        avatarUrl: parsed.avatarUrl,
        city: parsed.city,
        locality: parsed.locality,
        country: parsed.country,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        locationPrivacy: parsed.locationPrivacy,
        collaborationMode: parsed.collaborationMode,
        onboardingStep: parsed.onboardingStep,
      },
      update: {
        displayName: parsed.displayName,
        bio: parsed.bio,
        avatarUrl: parsed.avatarUrl,
        city: parsed.city,
        locality: parsed.locality,
        country: parsed.country,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        locationPrivacy: parsed.locationPrivacy,
        collaborationMode: parsed.collaborationMode,
        onboardingStep: parsed.onboardingStep,
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}

