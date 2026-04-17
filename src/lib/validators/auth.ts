import { z } from "zod";

// Enhanced email validation
const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(254, "Email is too long")
  .transform((email) => email.toLowerCase().trim());

// Enhanced password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain a special character"
  );

// Enhanced name validation
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .transform((name) => name.trim());

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Profile validation schemas
export const profileSchema = z.object({
  displayName: nameSchema,
  bio: z.string().max(500, "Bio is too long").optional(),
  city: z.string().max(100, "City is too long").optional(),
  locality: z.string().max(100, "Locality is too long").optional(),
  locationPrivacy: z.enum(["EXACT", "APPROXIMATE", "HIDDEN"]),
  collaborationMode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
});

// Skills validation
export const skillSchema = z.object({
  name: z
    .string()
    .min(2, "Skill name must be at least 2 characters")
    .max(100, "Skill name is too long"),
  category: z.string().min(1, "Category is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional(),
});

// Collaboration request validation
export const collaborationRequestSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  skillId: z.string().optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message is too long"),
  scheduledFor: z.string().datetime().optional(),
});

// Review validation
export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment is too long"),
  wouldRecommend: z.boolean(),
});
