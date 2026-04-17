'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

interface CollaborationCompleteActionProps {
  collaborationRequestId: string;
  status: string;
  canReview: boolean;
}

export function CollaborationCompleteAction({
  collaborationRequestId,
  status,
  canReview,
}: CollaborationCompleteActionProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/requests/${collaborationRequestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark collaboration as complete');
      }

      toast.success('Collaboration marked as complete! You can now review.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'COMPLETED' && canReview) {
    return (
      <Link href={`/reviews/submit/${collaborationRequestId}`}>
        <Button className="w-full bg-brand hover:bg-[#2a6f3b] text-white">
          ⭐ Leave Review
        </Button>
      </Link>
    );
  }

  if (status === 'ACCEPTED') {
    return (
      <Button
        onClick={handleMarkComplete}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {loading ? 'Updating...' : '✓ Mark Complete'}
      </Button>
    );
  }

  return null;
}
