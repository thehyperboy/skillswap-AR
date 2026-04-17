'use client';

import { Card } from "@/components/ui/card";

// Extended Review interface to handle both old and new Prisma schema
interface ReviewWithAuthor {
  id: string;
  reviewedId: string;
  reviewerId: string;
  rating?: number; // old schema
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // new schema fields
  collaborationRequestId?: string;
  isAnonymous?: boolean;
  communicationRating?: number;
  punctualityRating?: number;
  teachingRating?: number;
  overallRating?: number;
  reviewer: {
    id: string;
    name: string | null;
    email: string;
    profile?: {
      avatarUrl: string | null;
    } | null;
  };
}

interface ReviewDisplayProps {
  reviews: ReviewWithAuthor[];
  userName: string;
  averageRating: number;
  totalReviews: number;
}

export function ReviewDisplay({
  reviews,
  userName,
  averageRating,
  totalReviews,
}: ReviewDisplayProps) {
  if (totalReviews === 0) {
    return (
      <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-300">
        <p className="text-xl text-slate-600">📝 No reviews yet</p>
        <p className="text-sm text-slate-500 mt-2">
          {userName} will have reviews here after completing skill exchanges
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal">Review Summary</h3>
            <p className="text-sm text-slate-600 mt-1">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-slate-600">out of 5</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl ${
                star <= Math.round(averageRating) ? "text-yellow-400" : "text-slate-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-charcoal">Reviews from collaborators</h3>
        {reviews.map((review) => (
          <Card key={review.id} className="p-6 hover:shadow-md transition">
            <div className="space-y-4">
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {(review.reviewer.name || review.reviewer.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">
                      {review.isAnonymous ? "Anonymous reviewer" : review.reviewer.name || review.reviewer.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-yellow-500">{review.overallRating}</p>
                  <p className="text-xs text-slate-600">overall</p>
                </div>
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-slate-600">Communication</p>
                  <p className="text-lg font-bold text-brand">{review.communicationRating}★</p>
                </div>
                <div className="text-center border-l border-r border-slate-200">
                  <p className="text-xs text-slate-600">Punctuality</p>
                  <p className="text-lg font-bold text-brand">{review.punctualityRating}★</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Teaching</p>
                  <p className="text-lg font-bold text-brand">{review.teachingRating}★</p>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-200">
                  <p className="text-sm text-slate-700 italic">&quot;{review.comment}&quot;</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
