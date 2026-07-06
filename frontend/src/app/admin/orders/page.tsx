"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  AlertCircle,
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
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";

interface OrderItem {
  productId?: string | number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

interface Order {
  id: string;
  orderDate: string;
  status: number;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount: number;
  shippingAddress?: string;
  trackingNumber?: string | null;
  paymentMethod?: number;
  paymentStatus?: number;
  items?: OrderItem[];
  customerEmail?: string;
  customerName?: string;
}

const STATUS_MAP: Record<number, { text: string; color: string; icon: any }> = {
  1: { text: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  2: { text: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
  3: { text: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
  4: { text: "Delivered", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  5: { text: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  6: { text: "Refunded", color: "bg-gray-50 text-gray-700 border-gray-200", icon: AlertCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Status Update state
  const [statusToUpdate, setStatusToUpdate] = useState<{ order: Order; newStatus: number } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      // First try standard admin Orders endpoint
      let res;
      try {
        res = await api.get(`/Orders?pageNumber=${page}&pageSize=${PAGE_SIZE}`);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Fallback to checking /Orders/all if /Orders is not present
          res = await api.get(`/Orders/all?pageNumber=${page}&pageSize=${PAGE_SIZE}`);
        } else {
          throw err;
        }
      }
      const data = Array.isArray(res.data) ? res.data : res.data.orders || res.data.data || [];
      setOrders(data);
      setPageNumber(page);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err: any) {
      console.error("Failed to load admin orders:", err);
      if (err.response?.status === 404) {
        setError("GET /Orders endpoint was not found on the backend server.");
      } else {
        setError(
          err.response?.data?.Message ||
            err.response?.data?.message ||
            "Could not retrieve orders list from backend."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [PAGE_SIZE]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleStatusChangeClick = (order: Order, newStatus: number) => {
    if (order.status === newStatus) return;
    setStatusToUpdate({ order, newStatus });
    setIsConfirmOpen(true);
  };

  const executeStatusUpdate = async () => {
    if (!statusToUpdate) return;
    setIsUpdating(true);
    const { order, newStatus } = statusToUpdate;

    try {
      await api.put("/Orders/update-status", {
        orderId: order.id,
        id: order.id,
        newStatus: newStatus,
        status: newStatus,
      });
      toast.success(`Order #${order.id.slice(0, 8).toUpperCase()} status updated to ${STATUS_MAP[newStatus]?.text}`);
      setIsConfirmOpen(false);
      setStatusToUpdate(null);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      fetchOrders(pageNumber);
    } catch (err: any) {
      console.error("Update status failed:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to update order status.";
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || String(o.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      accessorKey: "id",
      cell: (o) => (
        <div>
          <span className="font-bold text-stone-900 font-mono text-xs">
            #{o.id.slice(0, 8).toUpperCase()}
          </span>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {new Date(o.orderDate).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: "Customer / Address",
      cell: (o) => (
        <div className="max-w-xs">
          <p className="font-semibold text-stone-800 text-xs truncate">
            {o.customerName || o.customerEmail || "Guest Customer"}
          </p>
          <p className="text-[11px] text-stone-500 truncate mt-0.5">
            {o.shippingAddress || "No address specified"}
          </p>
        </div>
      ),
    },
    {
      header: "Items",
      cell: (o) => (
        <span className="font-bold text-stone-700 text-xs">
          {o.items ? `${o.items.length} items` : "—"}
        </span>
      ),
    },
    {
      header: "Total Amount",
      cell: (o) => (
        <span className="font-black text-emerald-600 text-sm">
          {formatPrice(o.finalAmount || o.totalAmount || 0)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (o) => {
        const info = STATUS_MAP[o.status] || { text: "Unknown", color: "bg-stone-100 text-stone-700 border-stone-200", icon: Clock };
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
      header: "Quick Action",
      cell: (o) => (
        <div className="flex items-center gap-2">
          <select
            value={o.status}
            onChange={(e) => handleStatusChangeClick(o, Number(e.target.value))}
            className="h-8 px-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            {Object.entries(STATUS_MAP).map(([val, { text }]) => (
              <option key={val} value={val}>
                Set: {text}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => {
              setSelectedOrder(o);
              setIsDetailsOpen(true);
            }}
            title="View Details"
            className="rounded-lg text-stone-600 hover:text-stone-900"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Orders Management"
        subtitle="Monitor customer transactions, process shipments, and update fulfillment statuses."
      >
        <Button
          onClick={() => fetchOrders(pageNumber)}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="rounded-xl font-bold gap-2 bg-white shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh List</span>
        </Button>
      </PageHeader>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search order ID, email or address..."
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="All">All Statuses</option>
              {Object.entries(STATUS_MAP).map(([val, { text }]) => (
                <option key={val} value={val}>
                  {text}
                </option>
              ))}
            </select>
          </div>

          <Badge variant="stone" className="h-10 px-3 rounded-xl font-bold text-xs flex items-center">
            {filteredOrders.length} orders
          </Badge>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchOrders(pageNumber)} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            emptyMessage={
              searchQuery || statusFilter !== "All"
                ? "No orders match the selected search or filter."
                : "No customer orders found."
            }
          />
          <Pagination
            currentPage={pageNumber}
            onPageChange={(page) => fetchOrders(page)}
            hasMore={hasMore}
          />
        </div>
      )}

      {/* ─── Order Details Modal ────────────────────────────────────────── */}
      <FormDialog
        isOpen={isDetailsOpen && !!selectedOrder}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
        title={selectedOrder ? `Order Details — #${selectedOrder.id.slice(0, 8).toUpperCase()}` : "Order Details"}
        description="Full summary of customer items, shipping destination, and payment metrics."
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase">Current Status</p>
                <div className="mt-1">
                  {(() => {
                    const info = STATUS_MAP[selectedOrder.status] || { text: "Unknown", color: "bg-stone-100 text-stone-700 border-stone-200", icon: Clock };
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
                <p className="text-xs font-bold text-stone-400 uppercase">Order Date</p>
                <p className="font-semibold text-stone-900 text-sm mt-0.5">
                  {new Date(selectedOrder.orderDate).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-stone-200 space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Customer Info</p>
                <p className="font-bold text-stone-900 text-sm">
                  {selectedOrder.customerName || "Customer Account"}
                </p>
                {selectedOrder.customerEmail && (
                  <p className="text-xs text-stone-500">{selectedOrder.customerEmail}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 space-y-1">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Shipping Destination</p>
                <p className="text-xs font-medium text-stone-700 leading-relaxed">
                  {selectedOrder.shippingAddress || "No physical shipping address recorded."}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100 pb-2">
                Purchased Supplements ({selectedOrder.items?.length || 0})
              </p>
              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.productImageUrl && (
                        <img
                          src={normalizeImageUrl(item.productImageUrl)}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-contain bg-stone-50 border p-1 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-stone-900 text-sm leading-snug">{item.productName}</p>
                        <p className="text-xs text-stone-400">
                          Qty: <strong className="text-stone-700">{item.quantity}</strong> × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-stone-900 text-sm">
                      {formatPrice(item.totalPrice || item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400 font-medium">Final Order Amount</p>
                <p className="text-[10px] text-stone-500">Includes applicable taxes & shipping</p>
              </div>
              <span className="text-2xl font-black text-emerald-400">
                {formatPrice(selectedOrder.finalAmount || selectedOrder.totalAmount || 0)}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
                className="rounded-xl font-semibold"
              >
                Close Summary
              </Button>
            </div>
          </div>
        )}
      </FormDialog>

      {/* ─── Status Update Confirmation Dialog ──────────────────────────── */}
      <ConfirmDialog
        isOpen={isConfirmOpen && !!statusToUpdate}
        onClose={() => {
          setIsConfirmOpen(false);
          setStatusToUpdate(null);
        }}
        onConfirm={executeStatusUpdate}
        title="Confirm Status Change"
        description={
          statusToUpdate
            ? `Are you sure you want to change order #${statusToUpdate.order.id.slice(0, 8).toUpperCase()} status from "${STATUS_MAP[statusToUpdate.order.status]?.text}" to "${STATUS_MAP[statusToUpdate.newStatus]?.text}"?`
            : "Confirm status change?"
        }
        confirmText="Update Status"
        variant="warning"
        isLoading={isUpdating}
      />
    </div>
  );
}
