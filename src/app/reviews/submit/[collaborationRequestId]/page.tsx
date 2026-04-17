import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/review-form";

interface ReviewPageProps {
  params: {
    collaborationRequestId: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const collaboration = await prisma.collaborationRequest.findUnique({
    where: { id: params.collaborationRequestId },
    include: {
      sender: {
        select: { id: true, name: true, email: true, profile: { select: { displayName: true } } },
      },
      recipient: {
        select: { id: true, name: true, email: true, profile: { select: { displayName: true } } },
      },
      skill: { select: { name: true } },
    },
  });

  if (!collaboration) {
    redirect("/requests/inbox");
  }

  // Check if review already submitted
  const existingReview = await prisma.review.findUnique({
    where: { collaborationRequestId: params.collaborationRequestId },
  });

  // Check if user is participant
  const isParticipant =
    collaboration.senderId === user.id || collaboration.recipientId === user.id;

  if (!isParticipant) {
    redirect("/requests/inbox");
  }

  // Check if collaboration is completed
  if (collaboration.status !== "COMPLETED") {
    return (
      <div className="space-y-6 py-12">
        <Card className="p-8 text-center">
          <p className="text-2xl mb-3">⏳</p>
          <h1 className="text-2xl font-bold text-charcoal mb-2">Cannot Review Yet</h1>
          <p className="text-slate-600">
            You can only review completed collaborations.
          </p>
          <p className="text-sm text-slate-500 mt-3">
            Current status: <span className="font-semibold">{collaboration.status}</span>
          </p>
          <Link href="/requests/inbox" className="inline-block mt-6">
            <Button variant="outline">
              Back to Inbox
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Check if review already submitted
  if (existingReview) {
    const reviewedUserId = existingReview.reviewedId;
    return (
      <div className="space-y-6 py-12">
        <Card className="p-8 text-center">
          <p className="text-2xl mb-3">✅</p>
          <h1 className="text-2xl font-bold text-charcoal mb-2">Review Already Submitted</h1>
          <p className="text-slate-600">
            A review has already been submitted for this collaboration.
          </p>
          <Link href={`/profile/${reviewedUserId}`} className="inline-block mt-6">
            <Button className="bg-brand hover:bg-[#2a6f3b] text-white">
              View Profile
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const otherParty =
    collaboration.senderId === user.id ? collaboration.recipient : collaboration.sender;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-charcoal">Share Your Feedback</h1>
        <p className="text-lg text-slate-600">
          Review your experience with{" "}
          <span className="font-semibold text-brand">
            {otherParty.profile?.displayName || otherParty.name || otherParty.email}
          </span>
        </p>
      </div>

      {/* Collaboration Context */}
      <Card className="p-6 bg-slate-50 border-slate-200">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Skill Exchanged:</span>{" "}
            {collaboration.skill?.name || "General skill exchange"}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Date Completed:</span>{" "}
            {new Date(collaboration.updatedAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Collaboration Type:</span>{" "}
            {collaboration.senderId === user.id ? "You requested" : "You were requested"}
          </p>
        </div>
      </Card>

      {/* Review Form */}
      <ReviewForm
        collaborationRequestId={params.collaborationRequestId}
        recipientName={
          otherParty.profile?.displayName || otherParty.name || otherParty.email
        }
        onReviewSubmitted={() => {
          redirect("/requests/inbox");
        }}
      />

      {/* Info Box */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">Why Reviews Matter</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Helps other community members make informed decisions</li>
          <li>✓ Builds trust and accountability in SkillSwap AR</li>
          <li>✓ Contributes to SkillKarma reputation scores</li>
          <li>✓ Positive reviews award bonus SkillKarma points</li>
          <li>✓ Reviews are permanent and cannot be deleted</li>
        </ul>
      </Card>
    </div>
  );
}
