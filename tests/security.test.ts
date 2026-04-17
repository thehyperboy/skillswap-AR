import { describe, it, expect } from "vitest";
import {
  generateCSRFToken,
  verifyCSRFToken,
  hashToken,
  validatePasswordStrength,
  sanitizeInput,
  isValidEmailFormat,
} from "@/lib/security";

describe("Security Utilities", () => {
  describe("CSRF Token Management", () => {
    it("should generate a valid CSRF token", () => {
      const token = generateCSRFToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBe(64); // 32 bytes as hex = 64 chars
    });

    it("should verify a valid CSRF token", () => {
      const token = generateCSRFToken();
      expect(verifyCSRFToken(token)).toBe(true);
    });

    it("should not verify invalid CSRF token", () => {
      expect(verifyCSRFToken("invalid-token")).toBe(false);
    });

    it("should not allow reuse of CSRF token", () => {
      const token = generateCSRFToken();
      expect(verifyCSRFToken(token)).toBe(true);
      expect(verifyCSRFToken(token)).toBe(false); // Second use should fail
    });
  });

  describe("Token Hashing", () => {
    it("should hash tokens consistently", () => {
      const token = "test-token";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different tokens", () => {
      const hash1 = hashToken("token1");
      const hash2 = hashToken("token2");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce SHA-256 hash", () => {
      const token = "test";
      const hash = hashToken(token);
      expect(hash.length).toBe(64); // SHA-256 hex = 64 chars
    });
  });

  describe("Password Strength Validation", () => {
    it("should accept strong password", () => {
      const result = validatePasswordStrength("SecurePass123!");
      expect(result.isStrong).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject password without uppercase", () => {
      const result = validatePasswordStrength("securepass123!");
      expect(result.isStrong).toBe(false);
      expect(result.errors).toContain("Password must contain an uppercase letter");
    });

    it("should reject password without lowercase", () => {
      const result = validatePasswordStrength("SECUREPASS123!");
      expect(result.isStrong).toBe(false);
      expect(result.errors).toContain("Password must contain a lowercase letter");
    });

    it("should reject password without number", () => {
      const result = validatePasswordStrength("SecurePass!");
      expect(result.isStrong).toBe(false);
      expect(result.errors).toContain("Password must contain a number");
    });

    it("should reject password without special character", () => {
      const result = validatePasswordStrength("SecurePass123");
      expect(result.isStrong).toBe(false);
      expect(result.errors).toContain("Password must contain a special character");
    });

    it("should reject short password", () => {
      const result = validatePasswordStrength("Pas123!");
      expect(result.isStrong).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });

    it("should accept all special characters", () => {
      const specialChars = "!@#$%^&*()_+-=[]{};\\':\"|,.<>\\/?";
      for (const char of specialChars) {
        const result = validatePasswordStrength(`Secure123${char}`);
        expect(result.isStrong).toBe(
          true,
          `Failed for special character: ${char}`
        );
      }
    });
  });

  describe("Input Sanitization", () => {
    it("should sanitize HTML tags", () => {
      const input = "<script>alert('XSS')</script>";
      const result = sanitizeInput(input);
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
    });

    it("should sanitize quotes", () => {
      const input = 'He said "hello" and \'goodbye\'';
      const result = sanitizeInput(input);
      expect(result).toContain("&quot;");
      expect(result).toContain("&#x27;");
    });

    it("should sanitize ampersand", () => {
      const input = "A & B";
      const result = sanitizeInput(input);
      expect(result).toContain("&amp;");
    });

    it("should trim whitespace", () => {
      const input = "  hello world  ";
      const result = sanitizeInput(input);
      expect(result).toBe("hello world");
    });

    it("should handle empty string", () => {
      const result = sanitizeInput("");
      expect(result).toBe("");
    });

    it("should handle non-string input gracefully", () => {
      const result = sanitizeInput(null as any);
      expect(result).toBe("");
    });
  });

  describe("Email Validation", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.co.uk",
        "first+last@example.com",
        "123@example.com",
      ];
      validEmails.forEach((email) => {
        expect(isValidEmailFormat(email)).toBe(true, `Failed for: ${email}`);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "invalid",
        "@example.com",
        "user@",
        "user @example.com",
        "user@example",
      ];
      invalidEmails.forEach((email) => {
        expect(isValidEmailFormat(email)).toBe(false, `Failed for: ${email}`);
      });
    });

    it("should be case-insensitive", () => {
      expect(isValidEmailFormat("TEST@EXAMPLE.COM")).toBe(true);
      expect(isValidEmailFormat("Test@Example.Com")).toBe(true);
    });
  });
});
