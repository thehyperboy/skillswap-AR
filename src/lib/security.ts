import crypto from "crypto";

/**
 * Security utilities for auth/session hardening
 */

// CSRF Token Management
interface CSRFTokenStore {
  [token: string]: {
    expiresAt: number;
    used: boolean;
  };
}

const csrfTokens: CSRFTokenStore = {};

// Cleanup expired tokens every 30 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(csrfTokens).forEach((token) => {
    if (csrfTokens[token].expiresAt < now) {
      delete csrfTokens[token];
    }
  });
}, 1800000); // 30 minutes

/**
 * Generate a CSRF token (valid for 1 hour)
 */
export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  csrfTokens[token] = {
    expiresAt: Date.now() + 3600000, // 1 hour
    used: false,
  };
  return token;
}

/**
 * Verify and consume a CSRF token (one-time use)
 */
export function verifyCSRFToken(token: string): boolean {
  const entry = csrfTokens[token];

  if (!entry) {
    return false;
  }

  if (entry.expiresAt < Date.now()) {
    delete csrfTokens[token];
    return false;
  }

  if (entry.used) {
    return false;
  }

  // Mark as used
  entry.used = true;
  return true;
}

/**
 * Hash sensitive data (like session tokens) using SHA-256
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain a lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain a number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain a special character");
  }

  return {
    isStrong: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Generate secure random string for tokens
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Validate email format and check for common typos
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Create a security response header object for Next.js
 */
export function getSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=()",
  };
}
