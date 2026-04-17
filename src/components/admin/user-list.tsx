"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";

interface UserListProps {
  users: any[];
  onUserAction: (userId: string, action: string, data: any) => Promise<void>;
  isLoading?: boolean;
}

export function UserList({ users, onUserAction, isLoading }: UserListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [action, setAction] = useState<"suspend" | "unsuspend" | "flag" | "unflag" | null>(null);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("7"); // days
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    try {
      if (action === "suspend") {
        await onUserAction(selectedUserId, action, {
          reason,
          durationDays: duration ? parseInt(duration) : undefined,
        });
      } else {
        await onUserAction(selectedUserId, action, { reason });
      }
      setSelectedUserId(null);
      setAction(null);
      setReason("");
      setDuration("7");
    } finally {
      setLoading(false);
    }
  };

  if (!users || users.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">No users found</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {user.profile?.displayName || user.name || user.email}
                </span>
                {user.isSuspended && (
                  <Badge className="bg-red-100 text-red-800">🚫 Suspended</Badge>
                )}
                {user.isFlagged && (
                  <Badge className="bg-orange-100 text-orange-800">⚠️ Flagged</Badge>
                )}
                {user.role === "ADMIN" && (
                  <Badge className="bg-purple-100 text-purple-800">👑 Admin</Badge>
                )}
              </div>

              <div className="text-sm text-gray-600 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p>{user.profile?.city || "N/A"}</p>
                </div>
                {user.skillKarma && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Karma Level</p>
                      <p>{user.skillKarma.level} ({user.skillKarma.badge})</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Rating</p>
                      <p>
                        ⭐ {user.skillKarma.averageRating.toFixed(2)}/5
                        ({user.skillKarma.totalReviewsReceived} reviews)
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs text-gray-500">Stats</p>
                  <p>
                    {user._count.reviewsReceived} reviews •
                    {user._count.reportsReceived} reports received •
                    {user._count.reportsSubmitted} reports submitted
                  </p>
                </div>
                {user.isSuspended && user.suspendedUntil && (
                  <div>
                    <p className="text-xs text-gray-500">Suspension Until</p>
                    <p className="text-red-600">
                      {format(new Date(user.suspendedUntil), "PPp")}
                    </p>
                  </div>
                )}
              </div>

              {user.suspensionReason && (
                <div className="text-sm bg-red-50 p-2 rounded">
                  <strong>Suspension Reason:</strong> {user.suspensionReason}
                </div>
              )}

              {user.flagReason && (
                <div className="text-sm bg-orange-50 p-2 rounded">
                  <strong>Flag Reason:</strong> {user.flagReason}
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <Link href={`/profile/${user.id}`}>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setAction(user.isSuspended ? "unsuspend" : "suspend");
                }}
              >
                {user.isSuspended ? "Unsuspend" : "Suspend"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setAction(user.isFlagged ? "unflag" : "flag");
                }}
              >
                {user.isFlagged ? "Unflag" : "Flag"}
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Action Modal */}
      {selectedUserId && action && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {action === "suspend" && "Suspend User"}
                {action === "unsuspend" && "Unsuspend User"}
                {action === "flag" && "Flag User"}
                {action === "unflag" && "Unflag User"}
              </h2>

              {action === "suspend" && (
                <>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Duration (days, leave empty for permanent)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mb-3"
                  />
                  <Textarea
                    placeholder="Reason for suspension..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="mb-3"
                  />
                </>
              )}

              {action === "unsuspend" && (
                <Textarea
                  placeholder="Reason for unsuspending..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="mb-3"
                />
              )}

              {(action === "flag" || action === "unflag") && (
                <Textarea
                  placeholder="Reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="mb-3"
                />
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleAction}
                  disabled={loading || isLoading || !reason}
                  className={
                    action === "suspend" || action === "flag"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  {loading || isLoading ? "Loading..." : "Confirm"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUserId(null);
                    setAction(null);
                    setReason("");
                    setDuration("7");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
