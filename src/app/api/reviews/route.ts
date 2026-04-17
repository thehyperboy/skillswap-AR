import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSubmissionSchema } from "@/lib/validators/reviews";
import { z } from "zod";
import {
  KARMA_RULES,
  calculateKarmaLevel,
} from "@/lib/karma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = reviewSubmissionSchema.parse(body);

    // Get collaboration request
    const collaboration = await prisma.collaborationRequest.findUnique({
      where: { id: validatedData.collaborationRequestId },
      include: {
        sender: true,
        recipient: true,
      },
    });

    if (!collaboration) {
      return NextResponse.json(
        { error: "Collaboration request not found" },
        { status: 404 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { collaborationRequestId: validatedData.collaborationRequestId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "A review has already been submitted for this collaboration" },
        { status: 400 }
      );
    }

    // Check if collaboration is completed
    if (collaboration.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed collaborations" },
        { status: 400 }
      );
    }

    // Check if user is sender or recipient
    const isReviewer = collaboration.senderId === user.id || collaboration.recipientId === user.id;
    if (!isReviewer) {
      return NextResponse.json(
        { error: "You cannot review this collaboration" },
        { status: 403 }
      );
    }

    // Determine who is being reviewed (the other party)
    const reviewedUserId = collaboration.senderId === user.id ? collaboration.recipientId : collaboration.senderId;

    // Create review
    // @ts-expect-error - Schema has these fields but Prisma client not yet regenerated
    const review = await prisma.review.create({
      data: {
        collaborationRequestId: validatedData.collaborationRequestId,
        reviewedId: reviewedUserId,
        reviewerId: user.id,
        communicationRating: validatedData.communicationRating,
        punctualityRating: validatedData.punctualityRating,
        teachingRating: validatedData.teachingRating,
        overallRating: validatedData.overallRating,
        comment: validatedData.comment,
        isAnonymous: validatedData.isAnonymous,
      },
      include: {
        reviewed: true,
        reviewer: true,
      },
    });

    // Calculate karma points to add based on review quality
    let karmaPoints = KARMA_RULES.COLLABORATION_COMPLETED;

    // Bonus for positive reviews
    // @ts-expect-error - overallRating may not be in old Prisma types yet
    if (review.overallRating >= 5) {
      karmaPoints += KARMA_RULES.POSITIVE_REVIEW_EXCELLENT;
    // @ts-expect-error - overallRating may not be in old Prisma types yet
    } else if (review.overallRating >= 4) {
      karmaPoints += KARMA_RULES.POSITIVE_REVIEW_GOOD;
    // @ts-expect-error - overallRating may not be in old Prisma types yet
    } else if (review.overallRating < 3) {
      karmaPoints += KARMA_RULES.NEGATIVE_REVIEW;
    }

    // Update karma for reviewed user
    const skillKarma = await prisma.skillKarma.findUnique({
      where: { userId: reviewedUserId },
    });

    const newPoints = (skillKarma?.points || 0) + karmaPoints;
    const karmaLevelInfo = calculateKarmaLevel(newPoints);

    // @ts-expect-error - badge and totalReviewsReceived may not be in old Prisma types yet
    const updatedKarma = await prisma.skillKarma.update({
      where: { userId: reviewedUserId },
      data: {
        points: newPoints,
        level: karmaLevelInfo.level,
        // @ts-expect-error: badge may not be in old Prisma types yet
        badge: karmaLevelInfo.badge,
        completedSessionCount: (skillKarma?.completedSessionCount || 0) + 1,
        // @ts-expect-error: totalReviewsReceived may not be in old Prisma types yet
        totalReviewsReceived: (skillKarma?.totalReviewsReceived || 0) + 1,
      },
    });

    // Calculate and update average rating
    // @ts-expect-error - overallRating may not be in old Prisma types yet
    const allReviews = await prisma.review.findMany({
      where: { reviewedId: reviewedUserId },
    });

    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce(
            // @ts-expect-error - overallRating may not be in old Prisma types yet
            (sum, r) => sum + r.overallRating,
            0
          ) / allReviews.length
        : 5.0;

    // @ts-expect-error - averageRating may not be in old Prisma types yet
    await prisma.skillKarma.update({
      where: { userId: reviewedUserId },
      data: { averageRating: avgRating },
    });

    // Create karma log entry
    // @ts-expect-error - skillKarmaLog may not be in old Prisma types yet
    await prisma.skillKarmaLog.create({
      data: {
        userId: reviewedUserId,
        pointsChanged: karmaPoints,
        // @ts-expect-error - overallRating may not be in old Prisma types yet
        reason: review.overallRating >= 4 ? "POSITIVE_REVIEW" : "NEGATIVE_REVIEW",
        reviewId: review.id,
        // @ts-expect-error - overallRating and reviewer may not be in old Prisma types yet
        description: `Received a ${review.overallRating}-star review from ${
          validatedData.isAnonymous ? "anonymous reviewer" : review.reviewer.name || review.reviewer.email
        }`,
      },
    });

    return NextResponse.json({ review, karma: updatedKarma }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // Get reviews for user
    const reviews = await prisma.review.findMany({
      where: { reviewedId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get karma stats
    const karma = await prisma.skillKarma.findUnique({
      where: { userId },
    });

    return NextResponse.json(
      {
        reviews,
        karma: {
          points: karma?.points || 0,
          level: karma?.level || 1,
          // @ts-expect-error: badge and averageRating may not be in old Prisma types yet
          badge: karma?.badge,
          // @ts-expect-error: averageRating may not be in old Prisma types yet
          averageRating: karma?.averageRating || 5.0,
          totalReviews: reviews.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
