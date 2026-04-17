"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReportsTable } from "@/components/admin/reports-table";
import { ReportDetails } from "@/components/admin/report-details";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data.report);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    }
  };

  const handleUpdateReport = async (action: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });

      if (res.ok) {
        // Refresh reports list
        await fetchReports();
      }
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports Management</h1>
        <p className="text-gray-600 mt-2">
          Review and manage user reports
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <Button
            variant={statusFilter === "" ? "primary" : "outline"}
            onClick={() => {
              setStatusFilter("");
              setCurrentPage(1);
            }}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "PENDING" ? "primary" : "outline"}
            onClick={() => {
              setStatusFilter("PENDING");
              setCurrentPage(1);
            }}
          >
            Pending
          </Button>
          <Button
            variant={
              statusFilter === "INVESTIGATING" ? "primary" : "outline"
            }
            onClick={() => {
              setStatusFilter("INVESTIGATING");
              setCurrentPage(1);
            }}
          >
            Investigating
          </Button>
          <Button
            variant={statusFilter === "RESOLVED" ? "primary" : "outline"}
            onClick={() => {
              setStatusFilter("RESOLVED");
              setCurrentPage(1);
            }}
          >
            Resolved
          </Button>
          <Button
            variant={statusFilter === "DISMISSED" ? "primary" : "outline"}
            onClick={() => {
              setStatusFilter("DISMISSED");
              setCurrentPage(1);
            }}
          >
            Dismissed
          </Button>
        </div>
      </Card>

      {/* Reports Table */}
      <ReportsTable
        reports={reports}
        onViewReport={handleViewReport}
        loading={loading}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} (Total:{" "}
              {pagination.total})
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === pagination.pages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetails
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={handleUpdateReport}
        />
      )}
    </div>
  );
}
