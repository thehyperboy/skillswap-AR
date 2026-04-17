"use client";

import { Report } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";

interface ReportsTableProps {
  reports: any[];
  onViewReport: (reportId: string) => void;
  loading?: boolean;
}

export function ReportsTable({ reports, onViewReport, loading }: ReportsTableProps) {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Loading reports...</div>
      </Card>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">No reports found</div>
      </Card>
    );
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

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "HARASSMENT":
      case "SCAM_OR_FRAUD":
      case "SEXUAL_CONTENT":
        return "bg-red-100 text-red-800";
      case "INAPPROPRIATE_CONTENT":
      case "OFFENSIVE_LANGUAGE":
        return "bg-orange-100 text-orange-800";
      case "SPAM":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  Reported: {report.reportedUser?.name || report.reportedUser?.email}
                </span>
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
                <Badge className={getReasonColor(report.reason)}>
                  {report.reason}
                </Badge>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Reporter:</strong> {report.reporter?.name || report.reporter?.email}
                </p>
                <p>
                  <strong>Content Type:</strong> {report.contentType}
                </p>
                <p>
                  <strong>Description:</strong> {report.description}
                </p>
                {report.resolvedAt && (
                  <p className="text-xs text-gray-500">
                    Resolved at {format(new Date(report.resolvedAt), "PPpp")}
                  </p>
                )}
              </div>

              {report.adminNotes && (
                <div className="text-sm bg-gray-50 p-2 rounded">
                  <strong>Admin Notes:</strong> {report.adminNotes}
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewReport(report.id)}
              >
                View
              </Button>
              <Link href={`/admin/users/${report.reportedUserId}`}>
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
            Report ID: {report.id} • Submitted: {format(new Date(report.createdAt), "PPpp")}
          </div>
        </Card>
      ))}
    </div>
  );
}
