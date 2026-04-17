import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { collaborationRequestSchema } from "@/lib/validators/auth";
import { z } from "zod";
import { apiLimiter } from "@/lib/rate-limit";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!apiLimiter.check(request, ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: getSecurityHeaders() }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: getSecurityHeaders() }
    );
  }

  try {
    const body = await request.json();
    const { recipientId, skillId, message, scheduledFor } = collaborationRequestSchema.parse(body);

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    if (sender.id === recipientId) {
      return NextResponse.json(
        { error: "Cannot send request to yourself" },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Check if recipient exists and is not suspended
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, isSuspended: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    if (recipient.isSuspended) {
      return NextResponse.json(
        { error: "This user is not available" },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Check if skill exists if provided
    if (skillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: skillId },
      });
      if (!skill) {
        return NextResponse.json(
          { error: "Skill not found" },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
    }

    // Check for existing pending request (anti-spam)
    const existingRequest = await prisma.collaborationRequest.findFirst({
      where: {
        senderId: sender.id,
        recipientId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request to this user" },
        { status: 409, headers: getSecurityHeaders() }
      );
    }

    // Check sender hasn't sent too many requests recently (anti-spam)
    const recentRequests = await prisma.collaborationRequest.count({
      where: {
        senderId: sender.id,
        createdAt: {
          gte: new Date(Date.now() - 3600000), // Last hour
        },
      },
    });

    if (recentRequests > 20) {
      return NextResponse.json(
        { error: "Too many requests sent. Please wait before sending more." },
        { status: 429, headers: getSecurityHeaders() }
      );
    }

    const collaborationRequest = await prisma.collaborationRequest.create({
      data: {
        senderId: sender.id,
        recipientId,
        skillId,
        message,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        recipient: {
          select: { id: true, name: true, email: true },
        },
        skill: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      { request: collaborationRequest },
      { status: 201, headers: getSecurityHeaders() }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.format() },
        { status: 400, headers: getSecurityHeaders() }
      );
    }
    console.error("Error sending collaboration request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}