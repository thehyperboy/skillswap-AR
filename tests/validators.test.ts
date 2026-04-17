import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  profileSchema,
  skillSchema,
  collaborationRequestSchema,
  reviewSchema,
} from "@/lib/validators/auth";

describe("Auth Validators", () => {
  describe("signupSchema", () => {
    it("should validate correct signup data", () => {
      const data = {
        email: "test@example.com",
        password: "SecurePass123!",
        name: "John Doe",
      };
      expect(() => signupSchema.parse(data)).not.toThrow();
    });

    it("should reject password without uppercase letter", () => {
      const data = {
        email: "test@example.com",
        password: "securepass123!",
        name: "John Doe",
      };
      expect(() => signupSchema.parse(data)).toThrow();
    });

    it("should reject password without number", () => {
      const data = {
        email: "test@example.com",
        password: "SecurePass!",
        name: "John Doe",
      };
      expect(() => signupSchema.parse(data)).toThrow();
    });

    it("should reject password without special character", () => {
      const data = {
        email: "test@example.com",
        password: "SecurePass123",
        name: "John Doe",
      };
      expect(() => signupSchema.parse(data)).toThrow();
    });

    it("should reject password shorter than 8 characters", () => {
      const data = {
        email: "test@example.com",
        password: "Pas123!",
        name: "John Doe",
      };
      expect(() => signupSchema.parse(data)).toThrow();
    });

    it("should reject invalid email", () => {
      const data = {
        email: "invalid-email",
        password: "SecurePass123!",
        name: "John Doe",
      };
      expect(() => signupSchema.parse(data)).toThrow();
    });

    it("should reject name shorter than 2 characters", () => {
      const data = {
        email: "test@example.com",
        password: "SecurePass123!",
        name: "J",
      };
      expect(() => signupSchema.parse(data)).toThrow();
    });

    it("should lowercase email", () => {
      const data = {
        email: "TEST@EXAMPLE.COM",
        password: "SecurePass123!",
        name: "John Doe",
      };
      const result = signupSchema.parse(data);
      expect(result.email).toBe("test@example.com");
    });

    it("should trim whitespace from name", () => {
      const data = {
        email: "test@example.com",
        password: "SecurePass123!",
        name: "  John Doe  ",
      };
      const result = signupSchema.parse(data);
      expect(result.name).toBe("John Doe");
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const data = {
        email: "test@example.com",
        password: "SecurePass123!",
      };
      expect(() => loginSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid email", () => {
      const data = {
        email: "invalid-email",
        password: "SecurePass123!",
      };
      expect(() => loginSchema.parse(data)).toThrow();
    });

    it("should reject empty password", () => {
      const data = {
        email: "test@example.com",
        password: "",
      };
      expect(() => loginSchema.parse(data)).toThrow();
    });
  });

  describe("profileSchema", () => {
    it("should validate correct profile data", () => {
      const data = {
        displayName: "John Doe",
        bio: "I love teaching programming",
        city: "New York",
        locality: "Manhattan",
        locationPrivacy: "APPROXIMATE",
        collaborationMode: "HYBRID",
      };
      expect(() => profileSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid location privacy", () => {
      const data = {
        displayName: "John Doe",
        locationPrivacy: "INVALID",
        collaborationMode: "HYBRID",
      };
      expect(() => profileSchema.parse(data)).toThrow();
    });

    it("should accept optional fields", () => {
      const data = {
        displayName: "John Doe",
        locationPrivacy: "APPROXIMATE",
        collaborationMode: "HYBRID",
      };
      expect(() => profileSchema.parse(data)).not.toThrow();
    });
  });

  describe("skillSchema", () => {
    it("should validate correct skill data", () => {
      const data = {
        name: "Python Programming",
        category: "Programming",
        level: "INTERMEDIATE",
        description: "I can teach Python basics to advanced topics",
      };
      expect(() => skillSchema.parse(data)).not.toThrow();
    });

    it("should reject skill with name too short", () => {
      const data = {
        name: "P",
        category: "Programming",
        level: "INTERMEDIATE",
      };
      expect(() => skillSchema.parse(data)).toThrow();
    });

    it("should reject invalid level", () => {
      const data = {
        name: "Python Programming",
        category: "Programming",
        level: "MASTER",
      };
      expect(() => skillSchema.parse(data)).toThrow();
    });
  });

  describe("collaborationRequestSchema", () => {
    it("should validate correct request data", () => {
      const data = {
        recipientId: "user123",
        message: "I would love to learn Python from you!",
      };
      expect(() => collaborationRequestSchema.parse(data)).not.toThrow();
    });

    it("should reject message shorter than 10 characters", () => {
      const data = {
        recipientId: "user123",
        message: "Too short",
      };
      expect(() => collaborationRequestSchema.parse(data)).toThrow();
    });

    it("should accept optional skillId and scheduledFor", () => {
      const data = {
        recipientId: "user123",
        skillId: "skill123",
        message: "I would love to learn Python from you!",
        scheduledFor: new Date().toISOString(),
      };
      expect(() => collaborationRequestSchema.parse(data)).not.toThrow();
    });
  });

  describe("reviewSchema", () => {
    it("should validate correct review data", () => {
      const data = {
        rating: 4,
        comment: "Great experience learning from this instructor",
        wouldRecommend: true,
      };
      expect(() => reviewSchema.parse(data)).not.toThrow();
    });

    it("should reject rating below 1", () => {
      const data = {
        rating: 0,
        comment: "Great experience learning from this instructor",
        wouldRecommend: true,
      };
      expect(() => reviewSchema.parse(data)).toThrow();
    });

    it("should reject rating above 5", () => {
      const data = {
        rating: 6,
        comment: "Great experience learning from this instructor",
        wouldRecommend: true,
      };
      expect(() => reviewSchema.parse(data)).toThrow();
    });

    it("should reject comment shorter than 10 characters", () => {
      const data = {
        rating: 4,
        comment: "Good job",
        wouldRecommend: true,
      };
      expect(() => reviewSchema.parse(data)).toThrow();
    });
  });
});
