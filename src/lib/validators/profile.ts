import { z } from "zod";

export const profileSchema = z.object({
  displayName: z.string().min(2),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  city: z.string().max(100).optional().nullable(),
  locality: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  locationPrivacy: z.enum(["PUBLIC", "APPROXIMATE", "PRIVATE"]),
  collaborationMode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  onboardingStep: z.number().min(0).max(5).default(1),
});
