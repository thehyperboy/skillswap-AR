'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CollaborationRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
  senderId: string;
  recipientId: string;
}

interface RequestActionsProps {
  request: CollaborationRequest;
  userId: string;
}

export function RequestActions({ request, userId }: RequestActionsProps) {
  const [loading, setLoading] = useState(false);

  const updateRequestStatus = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Request ${status.toLowerCase()} successfully`);
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update request');
      }
    } catch {
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isSender = request.senderId === userId;
  const isRecipient = request.recipientId === userId;

  return (
    <div className="flex space-x-2">
      {request.status === "PENDING" && isRecipient && (
        <>
          <Button
            size="sm"
            onClick={() => updateRequestStatus("ACCEPTED")}
            disabled={loading}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateRequestStatus("DECLINED")}
            disabled={loading}
          >
            Decline
          </Button>
        </>
      )}

      {request.status === "PENDING" && isSender && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateRequestStatus("CANCELLED")}
          disabled={loading}
        >
          Cancel
        </Button>
      )}

      {request.status === "ACCEPTED" && (isSender || isRecipient) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateRequestStatus("COMPLETED")}
          disabled={loading}
        >
          Mark Complete
        </Button>
      )}
    </div>
  );
}