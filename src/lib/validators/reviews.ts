import { z } from "zod";

export const reviewSubmissionSchema = z.object({
  collaborationRequestId: z.string().cuid("Invalid collaboration request ID"),
  communicationRating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  punctualityRating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  teachingRating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  overallRating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
  isAnonymous: z.boolean().default(false),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
