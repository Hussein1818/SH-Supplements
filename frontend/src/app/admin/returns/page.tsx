"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  RotateCcw,
  Search,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  User,
  ShoppingBag,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { Pagination } from "@/src/components/admin/Pagination";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { formatPrice } from "@/src/lib/utils";
import { toast } from "sonner";

interface ReturnRequest {
  id: string | number;
  orderId: string | number;
  customerName?: string | null;
  customerEmail?: string | null;
  userId?: string | null;
  reason?: string | null;
  requestDate?: string | null;
  createdAt?: string | null;
  status: number | string;
  adminNotes?: string | null;
  notes?: string | null;
  refundAmount?: number | null;
  amount?: number | null;
}

const RETURN_STATUS_MAP: Record<string, { text: string; color: string; icon: any }> = {
  "1": { text: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  "pending": { text: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  "2": { text: "Approved", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  "approved": { text: "Approved", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  "3": { text: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  "rejected": { text: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  "4": { text: "Refunded", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: DollarSign },
  "refunded": { text: "Refunded", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: DollarSign },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Approve / Reject modal with notes
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject";
    item: ReturnRequest;
  } | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [isSubmittingNotes, setIsSubmittingNotes] = useState(false);

  // Refund Confirm modal
  const [refundConfirmItem, setRefundConfirmItem] = useState<ReturnRequest | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchReturns = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/Returns/all", {
        params: { pageNumber: page, pageSize: PAGE_SIZE },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.returns || res.data.data || res.data.items || [];
      setReturns(data);
      setPageNumber(page);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err: any) {
      console.error("Failed to fetch return requests:", err);
      if (err.response?.status === 404) {
        setError("GET /Returns/all endpoint was not found on the backend server.");
      } else {
        setError(
          err.response?.data?.Message ||
            err.response?.data?.message ||
            "Could not retrieve customer return requests from backend."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [PAGE_SIZE]);

  useEffect(() => {
    fetchReturns(1);
  }, [fetchReturns]);

  const handleOpenActionModal = (type: "approve" | "reject", item: ReturnRequest) => {
    setActionModal({ type, item });
    setAdminNotesInput(item.adminNotes || item.notes || "");
  };

  const executeStatusUpdate = async () => {
    if (!actionModal) return;
    setIsSubmittingNotes(true);
    const { type, item } = actionModal;
    const targetStatus = type === "approve" ? 2 : 3; // 2=Approved, 3=Rejected
    const statusStr = type === "approve" ? "Approved" : "Rejected";

    try {
      await api.put("/Returns/update-status", {
        returnId: item.id,
        id: item.id,
        status: targetStatus,
        newStatus: targetStatus,
        adminNotes: adminNotesInput.trim() || null,
        notes: adminNotesInput.trim() || null,
      });

      toast.success(`Return #${item.id} status updated to ${statusStr}`);
      setActionModal(null);
      setAdminNotesInput("");
      fetchReturns(pageNumber);
    } catch (err: any) {
      console.error("Update return status failed:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        `Failed to mark return as ${statusStr}.`;
      toast.error(msg);
    } finally {
      setIsSubmittingNotes(false);
    }
  };

  const executeRefund = async () => {
    if (!refundConfirmItem) return;
    setIsRefunding(true);
    const item = refundConfirmItem;

    try {
      // Rule: When refunding, confirm before calling POST /api/Orders/returns/{id}/process
      const res = await api.post(`/Orders/returns/${item.orderId || item.id}/process`, {
        returnId: item.id,
        orderId: item.orderId,
      });

      toast.success(res.data?.message || `Refund processed successfully for Return #${item.id}!`);
      setRefundConfirmItem(null);
      fetchReturns(pageNumber);
    } catch (err: any) {
      console.error("Refund processing failed:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to process refund via order return endpoint.";
      toast.error(msg);
    } finally {
      setIsRefunding(false);
    }
  };

  // Client-side filtering
  const filteredReturns = returns.filter((r) => {
    const custName = r.customerName || r.customerEmail || "";
    const matchesSearch =
      String(r.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.orderId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reason && r.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const statusVal = String(r.status).toLowerCase();
    const matchesStatus =
      statusFilter === "All" ||
      statusVal === statusFilter.toLowerCase() ||
      (statusFilter === "Pending" && (statusVal === "1" || statusVal === "pending")) ||
      (statusFilter === "Approved" && (statusVal === "2" || statusVal === "approved")) ||
      (statusFilter === "Rejected" && (statusVal === "3" || statusVal === "rejected")) ||
      (statusFilter === "Refunded" && (statusVal === "4" || statusVal === "refunded"));

    return matchesSearch && matchesStatus;
  });

  const columns: Column<ReturnRequest>[] = [
    {
      header: "Return / Order ID",
      accessorKey: "id",
      cell: (r) => (
        <div>
          <span className="font-bold text-stone-900 font-mono text-xs">
            REQ #{String(r.id).slice(0, 8).toUpperCase()}
          </span>
          <p className="text-[11px] font-mono text-stone-400 mt-0.5">
            Order: #{String(r.orderId).slice(0, 8).toUpperCase()}
          </p>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (r) => (
        <div className="max-w-xs">
          <p className="font-semibold text-stone-800 text-xs truncate">
            {r.customerName || r.customerEmail || "Customer Account"}
          </p>
          {r.customerEmail && r.customerName && (
            <p className="text-[11px] text-stone-400 truncate mt-0.5">{r.customerEmail}</p>
          )}
        </div>
      ),
    },
    {
      header: "Return Reason",
      cell: (r) => (
        <p className="text-xs text-stone-700 max-w-xs line-clamp-2 leading-relaxed">
          {r.reason || "No specific reason stated."}
        </p>
      ),
    },
    {
      header: "Request Date",
      cell: (r) => {
        const d = r.requestDate || r.createdAt;
        return (
          <span className="text-xs text-stone-600 font-medium">
            {d ? new Date(d).toLocaleDateString() : "—"}
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (r) => {
        const key = String(r.status).toLowerCase();
        const info = RETURN_STATUS_MAP[key] || {
          text: String(r.status) || "Unknown",
          color: "bg-stone-100 text-stone-700 border-stone-200",
          icon: Clock,
        };
        const Icon = info.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${info.color}`}>
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {info.text}
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: (r) => {
        const key = String(r.status).toLowerCase();
        const isPending = key === "1" || key === "pending";
        const isApproved = key === "2" || key === "approved";

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isPending && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleOpenActionModal("approve", r)}
                  className="rounded-lg text-blue-700 border-blue-200 hover:bg-blue-50 font-bold gap-1"
                  title="Approve Return Request"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleOpenActionModal("reject", r)}
                  className="rounded-lg text-red-700 border-red-200 hover:bg-red-50 font-bold gap-1"
                  title="Reject Return Request"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
              </>
            )}

            {isApproved && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setRefundConfirmItem(r)}
                className="rounded-lg text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold gap-1"
                title="Process Financial Refund"
              >
                <DollarSign className="w-3.5 h-3.5" /> Refund
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => {
                setSelectedReturn(r);
                setIsDetailsOpen(true);
              }}
              title="View Complete Request Details"
              className="rounded-lg text-stone-600 hover:text-stone-900"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        );
      },
      className: "text-right w-48",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Returns & Refunds Management"
        subtitle="Review customer merchandise return requests, inspect reasons, add admin notes, and authorize refunds."
      >
        <Button
          onClick={() => fetchReturns(pageNumber)}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="rounded-xl font-bold gap-2 bg-white shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh List</span>
        </Button>
      </PageHeader>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search return ID, order ID, customer name or reason..."
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <Badge variant="stone" className="h-10 px-3 rounded-xl font-bold text-xs flex items-center">
            {filteredReturns.length} requests
          </Badge>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchReturns(pageNumber)} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={filteredReturns}
            keyExtractor={(item) => String(item.id)}
            emptyMessage={
              searchQuery || statusFilter !== "All"
                ? "No return requests match the selected search or filter."
                : "No customer return requests found."
            }
          />
          <Pagination
            currentPage={pageNumber}
            onPageChange={(page) => fetchReturns(page)}
            hasMore={hasMore}
          />
        </div>
      )}

      {/* ─── Approve / Reject Modal with Admin Notes ───────────────────── */}
      <FormDialog
        isOpen={!!actionModal}
        onClose={() => {
          setActionModal(null);
          setAdminNotesInput("");
        }}
        title={
          actionModal?.type === "approve"
            ? `Approve Return Request #${String(actionModal.item.id).slice(0, 8).toUpperCase()}`
            : `Reject Return Request #${String(actionModal?.item.id || "").slice(0, 8).toUpperCase()}`
        }
        description={
          actionModal?.type === "approve"
            ? "Authorizing this return will allow the customer to ship merchandise back for inspection."
            : "Rejecting this request will notify the customer that their return reason did not meet policy criteria."
        }
        maxWidth="md"
      >
        {actionModal && (
          <div className="space-y-5 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Customer & Reason
              </span>
              <p className="font-bold text-stone-800 text-sm">
                {actionModal.item.customerName || actionModal.item.customerEmail || "Customer"}
              </p>
              <p className="text-xs text-stone-600 italic">
                &ldquo;{actionModal.item.reason || "No explanation provided"}&rdquo;
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-notes" className="text-stone-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Admin Notes (Optional)
              </Label>
              <textarea
                id="admin-notes"
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                rows={3}
                placeholder="Enter internal inspection remarks, return authorization code, or customer explanation..."
                className="w-full p-3 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <p className="text-[11px] text-stone-400">
                These notes will be attached to the return request record for customer service audit.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActionModal(null);
                  setAdminNotesInput("");
                }}
                disabled={isSubmittingNotes}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={executeStatusUpdate}
                loading={isSubmittingNotes}
                className={`rounded-xl font-bold px-6 text-white ${
                  actionModal.type === "approve"
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {actionModal.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        )}
      </FormDialog>

      {/* ─── Refund Confirmation Dialog ─────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!refundConfirmItem}
        onClose={() => setRefundConfirmItem(null)}
        onConfirm={executeRefund}
        title="Confirm Financial Refund"
        description={
          refundConfirmItem
            ? `Are you sure you want to process a refund for Return Request #${String(refundConfirmItem.id).slice(0, 8).toUpperCase()} (Order #${String(refundConfirmItem.orderId).slice(0, 8).toUpperCase()})? This will invoke POST /api/Orders/returns/${refundConfirmItem.orderId || refundConfirmItem.id}/process.`
            : "Confirm refund processing?"
        }
        confirmText="Process Refund"
        variant="warning"
        isLoading={isRefunding}
      />

      {/* ─── Return Request Details Dialog ──────────────────────────────── */}
      <FormDialog
        isOpen={isDetailsOpen && !!selectedReturn}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedReturn(null);
        }}
        title={selectedReturn ? `Return Request — #${String(selectedReturn.id).slice(0, 8).toUpperCase()}` : "Return Details"}
        description="Full inspection audit of customer return claim and administrative notes."
        maxWidth="lg"
      >
        {selectedReturn && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase">Current Status</span>
                <div className="mt-1">
                  {(() => {
                    const key = String(selectedReturn.status).toLowerCase();
                    const info = RETURN_STATUS_MAP[key] || {
                      text: String(selectedReturn.status) || "Unknown",
                      color: "bg-stone-100 text-stone-700 border-stone-200",
                      icon: Clock,
                    };
                    const Icon = info.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${info.color}`}>
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {info.text}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-stone-400 uppercase">Request Date</span>
                <p className="font-semibold text-stone-900 text-sm mt-0.5">
                  {selectedReturn.requestDate || selectedReturn.createdAt
                    ? new Date(selectedReturn.requestDate || selectedReturn.createdAt!).toLocaleString()
                    : "Not recorded"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-600" /> Customer Account
                </span>
                <p className="font-bold text-stone-900 text-sm">
                  {selectedReturn.customerName || "Customer Account"}
                </p>
                {selectedReturn.customerEmail && (
                  <p className="text-xs text-stone-500">{selectedReturn.customerEmail}</p>
                )}
                {selectedReturn.userId && (
                  <p className="text-[10px] font-mono text-stone-400 mt-1">User ID: #{selectedReturn.userId}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-blue-600" /> Reference Order
                </span>
                <p className="font-bold text-stone-900 text-sm font-mono">
                  Order #{String(selectedReturn.orderId).slice(0, 8).toUpperCase()}
                </p>
                {selectedReturn.amount || selectedReturn.refundAmount ? (
                  <p className="text-xs font-black text-emerald-600 mt-1">
                    Refund Claim: {formatPrice(selectedReturn.refundAmount || selectedReturn.amount || 0)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider block">
                Stated Return Reason
              </span>
              <p className="text-sm text-stone-700 leading-relaxed italic bg-white p-3 rounded-xl border border-stone-200">
                &ldquo;{selectedReturn.reason || "No explanation recorded."}&rdquo;
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Admin Audit Notes
              </span>
              {selectedReturn.adminNotes || selectedReturn.notes ? (
                <p className="text-sm text-stone-800 bg-white p-3 rounded-xl border border-stone-200 leading-relaxed font-mono">
                  {selectedReturn.adminNotes || selectedReturn.notes}
                </p>
              ) : (
                <p className="text-xs text-stone-400 italic bg-white p-3 rounded-xl border border-dashed border-stone-200 text-center">
                  No administrative notes attached to this claim.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
                className="rounded-xl font-bold px-6"
              >
                Close Audit View
              </Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
}
