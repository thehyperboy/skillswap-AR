"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminStats {
  totalActions: number;
  pendingReports: number;
  suspendedUsers: number;
  flaggedUsers: number;
  resolvedReports: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/actions", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform moderation and oversight</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="text-center text-gray-500">Loading stats...</div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6">
            <div className="text-3xl font-bold text-red-600">
              {stats.pendingReports}
            </div>
            <p className="text-sm text-gray-600 mt-2">Pending Reports</p>
            <Link href="/admin/reports">
              <Button variant="outline" size="sm" className="mt-3">
                View →
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <div className="text-3xl font-bold text-red-700">
              {stats.suspendedUsers}
            </div>
            <p className="text-sm text-gray-600 mt-2">Suspended Users</p>
            <Link href="/admin/users?status=suspended">
              <Button variant="outline" size="sm" className="mt-3">
                View →
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <div className="text-3xl font-bold text-orange-600">
              {stats.flaggedUsers}
            </div>
            <p className="text-sm text-gray-600 mt-2">Flagged Users</p>
            <Link href="/admin/users?status=flagged">
              <Button variant="outline" size="sm" className="mt-3">
                View →
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {stats.resolvedReports}
            </div>
            <p className="text-sm text-gray-600 mt-2">Resolved Reports</p>
          </Card>

          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalActions}
            </div>
            <p className="text-sm text-gray-600 mt-2">Total Actions</p>
          </Card>
        </div>
      ) : null}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/reports?status=PENDING">
            <Button variant="outline" className="w-full h-12 text-base">
              📋 View Pending Reports
            </Button>
          </Link>
          <Link href="/admin/users?status=suspended">
            <Button variant="outline" className="w-full h-12 text-base">
              🚫 View Suspended Users
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-12 text-base">
              👥 All Users
            </Button>
          </Link>
        </div>
      </Card>

      {/* Documentation */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-bold mb-3">Admin Panel Guide</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ <strong>Reports:</strong> Review user reports and take action</li>
          <li>✅ <strong>Users:</strong> Suspend, flag, or unsuspend accounts</li>
          <li>✅ <strong>Actions:</strong> View complete moderation history</li>
          <li>✅ <strong>Auto-Unsuspend:</strong> Temporary suspensions expire automatically</li>
          <li>✅ <strong>Audit Trail:</strong> All actions are logged with admin stamps</li>
        </ul>
      </Card>

      {/* Platform Safety Info */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <h2 className="text-xl font-bold mb-3">🛡️ Platform Safety</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Report Types</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Harassment & Bullying</li>
              <li>Scams & Fraud</li>
              <li>Inappropriate Content</li>
              <li>Offensive Language</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Enforcement Actions</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Temporary/Permanent Suspension</li>
              <li>Account Flagging</li>
              <li>Content Removal</li>
              <li>Warning Issuance</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
