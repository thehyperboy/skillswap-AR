"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ReportDetailsProps {
  report: any;
  onClose: () => void;
  onUpdate: (action: string, data: any) => Promise<void>;
  isLoading?: boolean;
}

export function ReportDetails({ report, onClose, onUpdate, isLoading }: ReportDetailsProps) {
  const [action, setAction] = useState<"resolve" | "dismiss" | "investigate" | null>(null);
  const [resolution, setResolution] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (action === "resolve") {
        await onUpdate("resolve", { resolution, adminNotes });
      } else if (action === "dismiss") {
        await onUpdate("dismiss", { reason });
      } else if (action === "investigate") {
        await onUpdate("investigate", { adminNotes });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!report) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "INVESTIGATING":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "DISMISSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Report Details</h2>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>

          {/* Report Info */}
          <div className="space-y-4 mb-6 pb-6 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Reported User</p>
                <p className="font-semibold">
                  {report.reportedUser?.name || report.reportedUser?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reporter</p>
                <p className="font-semibold">
                  {report.reporter?.name || report.reporter?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">
                  {format(new Date(report.createdAt), "PPpp")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Reason</p>
              <p className="font-semibold text-lg">{report.reason}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Content Type</p>
              <p className="font-semibold">{report.contentType}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-base whitespace-pre-wrap">{report.description}</p>
            </div>

            {report.adminNotes && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-500">Admin Notes</p>
                <p className="text-base">{report.adminNotes}</p>
              </div>
            )}

            {report.resolution && (
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-500">Resolution</p>
                <p className="text-base">{report.resolution}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {report.status === "PENDING" && !action && (
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-lg">Take Action</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAction("investigate")}
                >
                  🔍 Investigate
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50"
                  onClick={() => setAction("resolve")}
                >
                  ✓ Resolve
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-50"
                  onClick={() => setAction("dismiss")}
                >
                  ✕ Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Action Forms */}
          {action === "investigate" && (
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold">Mark as Investigating</h3>
              <Textarea
                placeholder="Add notes for investigation..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAction}
                  disabled={loading || isLoading}
                >
                  {loading || isLoading ? "Loading..." : "Mark Investigating"}
                </Button>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {action === "resolve" && (
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold">Resolve Report</h3>
              <Textarea
                placeholder="What action was taken?"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
              />
              <Textarea
                placeholder="Admin notes (optional)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAction}
                  disabled={loading || isLoading || !resolution}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading || isLoading ? "Loading..." : "Resolve"}
                </Button>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {action === "dismiss" && (
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold">Dismiss Report</h3>
              <Textarea
                placeholder="Why dismiss this report?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAction}
                  disabled={loading || isLoading || !reason}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  {loading || isLoading ? "Loading..." : "Dismiss"}
                </Button>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
