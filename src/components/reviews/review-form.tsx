'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ReviewFormProps {
  collaborationRequestId: string;
  recipientName: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ collaborationRequestId, recipientName, onReviewSubmitted }: ReviewFormProps) {
  const [communicationRating, setCommunicationRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [teachingRating, setTeachingRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collaborationRequestId,
          communicationRating,
          punctualityRating,
          teachingRating,
          overallRating,
          comment,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      toast.success('Review submitted! Karma updated.');
      onReviewSubmitted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const RatingSlider = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-charcoal">{label}</label>
        <span className="text-lg font-bold text-brand">{value}★</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`text-2xl transition ${
              star <= value ? 'text-yellow-400 scale-110' : 'text-slate-300 hover:text-slate-400'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-8 bg-gradient-to-br from-brand-soft/20 to-white border border-brand-soft/30">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-charcoal">Rate your experience with {recipientName}</h3>
          <p className="text-sm text-slate-600 mt-1">Your feedback helps build trust in our community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Categories */}
          <div className="space-y-5 p-5 rounded-lg bg-white border border-slate-200">
            <RatingSlider 
              label="📞 Communication" 
              value={communicationRating}
              onChange={setCommunicationRating}
            />
            <div className="border-t border-slate-100"></div>
            <RatingSlider 
              label="⏰ Punctuality" 
              value={punctualityRating}
              onChange={setPunctualityRating}
            />
            <div className="border-t border-slate-100"></div>
            <RatingSlider 
              label="📚 Teaching/Helpfulness" 
              value={teachingRating}
              onChange={setTeachingRating}
            />
            <div className="border-t border-slate-100"></div>
            <RatingSlider 
              label="⭐ Overall Experience" 
              value={overallRating}
              onChange={setOverallRating}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal">
              Comments (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share specific feedback about your experience..."
              className="w-full h-24"
            />
            <p className="text-xs text-slate-500">{comment.length}/1000 characters</p>
          </div>

          {/* Anonymous Option */}
          <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-charcoal">
              🔒 Submit review anonymously
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand hover:bg-[#2a6f3b] text-white font-semibold py-3"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700">
            ✓ Your honest feedback helps others make informed decisions<br/>
            ✓ Reviews cannot be deleted, so please be thoughtful<br/>
            ✓ Both parties must submit reviews independently
          </p>
        </div>
      </div>
    </Card>
  );
}
