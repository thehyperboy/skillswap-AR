import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validators/auth";
import { ZodError } from "zod";
import { signupLimiter } from "@/lib/rate-limit";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  // Rate limiting check
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "unknown";
  if (!signupLimiter.check(request, ip)) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { 
        status: 429,
        headers: getSecurityHeaders(),
      }
    );
  }

  try {
    const body = await request.json();
    
    // Validate input with enhanced validators
    let validatedData;
    try {
      validatedData = signupSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ");
        return NextResponse.json({ error: message }, { status: 400, headers: getSecurityHeaders() });
      }
      return NextResponse.json({ error: "Invalid input" }, { status: 400, headers: getSecurityHeaders() });
    }

    const { email, password, name } = validatedData;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409, headers: getSecurityHeaders() }
      );
    }

    // Hash password with stronger salt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile and karma
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        profile: {
          create: {
            displayName: name,
            city: "",
            locality: "",
            locationPrivacy: "APPROXIMATE",
            collaborationMode: "HYBRID",
          },
        },
        skillKarma: {
          create: {
            points: 0,
            level: 1,
            badge: "NOVICE",
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Account created successfully. Please sign in.",
        user 
      },
      { 
        status: 201,
        headers: getSecurityHeaders(),
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    
    if (error instanceof Error) {
      // Handle Prisma unique constraint errors
      if (error.message.includes("Unique constraint failed")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409, headers: getSecurityHeaders() }
        );
      }
      return NextResponse.json(
        { error: "Signup failed. Please try again." },
        { status: 400, headers: getSecurityHeaders() }
      );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
