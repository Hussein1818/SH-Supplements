"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Award, Dumbbell, UserCheck, UserX, Search, Filter, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { Pagination } from "@/src/components/admin/Pagination";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";

interface UserItem {
  id: string | number;
  fullName?: string;
  name?: string;
  email: string;
  role?: string;
  isTrainer?: boolean;
  status?: string | number;
  createdAt?: string;
}

export default function AdminTrainersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Local state override for trainer assignments if backend doesn't reflect immediately
  const [localTrainerIds, setLocalTrainerIds] = useState<Set<string>>(new Set());
  const [localRevokedIds, setLocalRevokedIds] = useState<Set<string>>(new Set());

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    type: "assign" | "revoke";
    user: UserItem;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/User/all", {
        params: { pageNumber: page, pageSize: PAGE_SIZE },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.users || res.data.data || res.data.items || [];
      setUsers(data);
      setPageNumber(page);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err: any) {
      console.error("Failed to fetch users for trainer management:", err);
      setError("Could not retrieve user directory from backend server.");
    } finally {
      setIsLoading(false);
    }
  }, [PAGE_SIZE]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const executeTrainerAction = async () => {
    if (!confirmModal) return;
    setIsSubmitting(true);
    const { type, user } = confirmModal;
    const userIdStr = String(user.id);

    try {
      if (type === "assign") {
        await api.post(`/Users/${user.id}/assign-trainer`);
        toast.success(`Assigned trainer role to ${user.fullName || user.email}!`);
        setLocalTrainerIds((prev) => new Set(prev).add(userIdStr));
        setLocalRevokedIds((prev) => {
          const next = new Set(prev);
          next.delete(userIdStr);
          return next;
        });
      } else {
        await api.post(`/Users/${user.id}/revoke-trainer`);
        toast.success(`Revoked trainer role from ${user.fullName || user.email}.`);
        setLocalRevokedIds((prev) => new Set(prev).add(userIdStr));
        setLocalTrainerIds((prev) => {
          const next = new Set(prev);
          next.delete(userIdStr);
          return next;
        });
      }

      setConfirmModal(null);
      fetchUsers(pageNumber);
    } catch (err: any) {
      console.error(`Trainer action (${type}) failed:`, err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        `Failed to ${type} trainer role on backend.`;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUserTrainer = (u: UserItem) => {
    const idStr = String(u.id);
    if (localRevokedIds.has(idStr)) return false;
    if (localTrainerIds.has(idStr)) return true;
    const r = (u.role || "").toLowerCase();
    return r === "trainer" || u.isTrainer === true;
  };

  const filteredUsers = users.filter((u) => {
    const nameStr = u.fullName || u.name || "";
    const matchesSearch =
      String(u.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const isTrainer = isUserTrainer(u);
    const matchesRole =
      roleFilter === "All" ||
      (roleFilter === "Trainers" && isTrainer) ||
      (roleFilter === "Customers" && !isTrainer && (u.role || "").toLowerCase() !== "admin");

    return matchesSearch && matchesRole;
  });

  const columns: Column<UserItem>[] = [
    {
      header: "User Account",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-extrabold text-xs shrink-0">
            {(u.fullName || u.name || u.email || "U").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-stone-900 text-xs">
              {u.fullName || u.name || "Registered User"}
            </p>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "User ID",
      cell: (u) => <span className="font-mono text-xs text-stone-500 font-bold">#{u.id}</span>,
    },
    {
      header: "Current Role",
      cell: (u) => {
        const isTrainer = isUserTrainer(u);
        const isAdmin = (u.role || "").toLowerCase() === "admin" || (u.role || "").toLowerCase() === "administrator";

        if (isAdmin) {
          return (
            <Badge variant="stone" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[11px]">
              Administrator
            </Badge>
          );
        }
        if (isTrainer) {
          return (
            <Badge variant="stone" className="bg-blue-100 text-blue-900 border-blue-300 font-extrabold text-[11px] gap-1">
              <Award className="w-3.5 h-3.5 text-blue-700" /> Verified Trainer
            </Badge>
          );
        }
        return (
          <Badge variant="stone" className="bg-stone-100 text-stone-700 border-stone-200 font-medium text-[11px]">
            Customer
          </Badge>
        );
      },
    },
    {
      header: "Registration Date",
      cell: (u) => (
        <span className="text-xs text-stone-600 font-medium">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Trainer Privileges",
      cell: (u) => {
        const isTrainer = isUserTrainer(u);
        const isAdmin = (u.role || "").toLowerCase() === "admin" || (u.role || "").toLowerCase() === "administrator";

        if (isAdmin) {
          return <span className="text-[11px] text-stone-400 font-mono italic">Super Admin</span>;
        }

        return (
          <div className="flex items-center justify-end gap-2">
            {isTrainer ? (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setConfirmModal({ type: "revoke", user: u })}
                className="rounded-lg text-red-700 border-red-200 hover:bg-red-50 font-bold gap-1"
                title="Revoke Trainer Role"
              >
                <UserX className="w-3.5 h-3.5" /> Revoke Trainer
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setConfirmModal({ type: "assign", user: u })}
                className="rounded-lg text-blue-700 border-blue-200 hover:bg-blue-50 font-bold gap-1"
                title="Assign Trainer Role"
              >
                <UserCheck className="w-3.5 h-3.5" /> Assign Trainer
              </Button>
            )}
          </div>
        );
      },
      className: "text-right w-44",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Fitness Trainers Management"
        subtitle="Assign fitness coaching and trainer status to registered accounts, granting them professional guidance badges."
      >
        <Button
          onClick={() => fetchUsers(pageNumber)}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="rounded-xl font-bold gap-2 bg-white shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh Directory</span>
        </Button>
      </PageHeader>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search user ID, full name or email address..."
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All">All User Accounts</option>
              <option value="Trainers">Trainers Only</option>
              <option value="Customers">Customers Only</option>
            </select>
          </div>

          <Badge variant="stone" className="h-10 px-3 rounded-xl font-bold text-xs flex items-center">
            {filteredUsers.length} users
          </Badge>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchUsers(pageNumber)} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={filteredUsers}
            keyExtractor={(item) => String(item.id)}
            emptyMessage={
              searchQuery || roleFilter !== "All"
                ? "No user accounts match the specified search or role filter."
                : "No registered users found."
            }
          />
          <Pagination
            currentPage={pageNumber}
            onPageChange={(page) => fetchUsers(page)}
            hasMore={hasMore}
          />
        </div>
      )}

      {/* ─── Confirmation Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={executeTrainerAction}
        title={
          confirmModal?.type === "assign"
            ? `Assign Trainer Role — #${confirmModal.user.id}`
            : `Revoke Trainer Role — #${confirmModal?.user.id || ""}`
        }
        description={
          confirmModal?.type === "assign"
            ? `Are you sure you want to grant certified trainer privileges to ${confirmModal.user.fullName || confirmModal.user.email}? This will invoke POST /api/Users/${confirmModal.user.id}/assign-trainer.`
            : `Are you sure you want to remove trainer privileges from ${confirmModal?.user.fullName || confirmModal?.user.email}? This will invoke POST /api/Users/${confirmModal?.user.id || ""}/revoke-trainer.`
        }
        confirmText={confirmModal?.type === "assign" ? "Confirm Assignment" : "Confirm Revocation"}
        variant={confirmModal?.type === "assign" ? "default" : "destructive"}
        isLoading={isSubmitting}
      />
    </div>
  );
}
