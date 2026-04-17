"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserList } from "@/components/admin/user-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (
    userId: string,
    action: string,
    data: any
  ) => {
    try {
      const res = await fetch(
        `/api/admin/users/${userId}?action=${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        // Refresh users list
        await fetchUsers();
      }
    } catch (error) {
      console.error("Failed to perform user action:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">
          View, suspend, and flag users
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Card>

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
            All Users
          </Button>
          <Button
            variant={statusFilter === "suspended" ? "primary" : "outline"}
            onClick={() => {
              setStatusFilter("suspended");
              setCurrentPage(1);
            }}
          >
            🚫 Suspended ({pagination?.total || 0})
          </Button>
          <Button
            variant={statusFilter === "flagged" ? "primary" : "outline"}
            onClick={() => {
              setStatusFilter("flagged");
              setCurrentPage(1);
            }}
          >
            ⚠️ Flagged ({pagination?.total || 0})
          </Button>
        </div>
      </Card>

      {/* Users List */}
      {loading ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">Loading users...</div>
        </Card>
      ) : (
        <>
          <UserList users={users} onUserAction={handleUserAction} />

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
        </>
      )}
    </div>
  );
}
