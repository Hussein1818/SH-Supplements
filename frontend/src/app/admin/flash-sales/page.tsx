"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Zap, AlertTriangle, RefreshCw, Flame, Tag, CheckCircle2, Info, ArrowUpRight } from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface FlashSaleProduct {
  id: string | number;
  name: string;
  brandName?: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity?: number;
  mainImageUrl?: string | null;
}

export default function AdminFlashSalesPage() {
  const [activeFlashProducts, setActiveFlashProducts] = useState<FlashSaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clearance confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchFlashSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Reusing verified customer flash sales endpoint
      const res = await api.get("/Products/flash-sales");
      const data = Array.isArray(res.data) ? res.data : res.data.items || res.data.products || [];
      setActiveFlashProducts(data);
    } catch (err: any) {
      console.error("Failed to fetch active flash sales:", err);
      setError(
        err.response?.data?.Message ||
          err.response?.data?.message ||
          "Could not retrieve active flash sale inventory from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashSales();
  }, [fetchFlashSales]);

  const executeTriggerClearance = async () => {
    setIsTriggering(true);
    try {
      const res = await api.post("/Products/trigger-clearance");
      toast.success(res.data?.message || "Storewide clearance flash sale triggered successfully!");
      setIsConfirmOpen(false);
      fetchFlashSales();
    } catch (err: any) {
      console.error("Trigger clearance failed:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to trigger clearance discount algorithm on backend.";
      toast.error(msg);
    } finally {
      setIsTriggering(false);
    }
  };

  const columns: Column<FlashSaleProduct>[] = [
    {
      header: "Supplement Product",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center">
            {p.mainImageUrl ? (
              <Image
                src={normalizeImageUrl(p.mainImageUrl)}
                alt={p.name}
                fill
                className="object-cover"
              />
            ) : (
              <Flame className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div className="max-w-xs">
            <p className="font-bold text-stone-900 text-xs truncate">{p.name}</p>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">
              {p.brandName || "Generic"} • ID #{p.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Original Price",
      cell: (p) => (
        <span className="text-xs font-semibold text-stone-400 line-through">
          {formatPrice(p.price)}
        </span>
      ),
    },
    {
      header: "Clearance Price",
      cell: (p) => {
        const discount = p.discountPrice || p.price * 0.8;
        return (
          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            {formatPrice(discount)}
          </span>
        );
      },
    },
    {
      header: "Available Stock",
      cell: (p) => {
        const qty = p.stockQuantity !== undefined ? p.stockQuantity : 10;
        return (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              qty <= 5 ? "bg-red-50 text-red-700 border border-red-200" : "bg-stone-100 text-stone-700"
            }`}
          >
            {qty} units remaining
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: () => (
        <Badge variant="stone" className="bg-amber-100 text-amber-900 border-amber-300 font-extrabold text-[11px] gap-1">
          <Flame className="w-3 h-3 fill-amber-500 text-amber-600 animate-pulse" /> Active Deal
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Flash Sales & Clearance Management"
        subtitle="Monitor currently active flash sale products and trigger storewide algorithmic clearance promotions."
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchFlashSales}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="rounded-xl font-bold gap-2 bg-white shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh Deals</span>
          </Button>

          <Button
            onClick={() => setIsConfirmOpen(true)}
            variant="primary"
            size="sm"
            className="rounded-xl font-extrabold gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-900/20 px-5"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Trigger Clearance Sale</span>
          </Button>
        </div>
      </PageHeader>

      {/* Explanation Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-stone-50 border-2 border-amber-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>How Storewide Clearance Works</span>
            </div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              Algorithmic Inventory Clearance Promotion
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
              Triggering this action invokes <code className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">POST /api/Products/trigger-clearance</code>. The backend system will scan total catalog inventory, identify slow-moving supplements or overstocked items, and automatically apply promotional clearance discount rates.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-stone-600 font-semibold">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Never triggers automatically without explicit confirmation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instantly reflects across customer storefront flash deals</span>
              </li>
            </ul>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Button
              onClick={() => setIsConfirmOpen(true)}
              variant="primary"
              className="w-full md:w-auto h-12 px-8 rounded-2xl font-black text-sm bg-stone-900 hover:bg-stone-800 text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Launch Clearance Event</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Deals Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" /> Currently Active Flash Deals
          </h3>
          <span className="text-xs font-bold text-stone-400">
            {activeFlashProducts.length} items on clearance
          </span>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchFlashSales} />
        ) : (
          <DataTable
            columns={columns}
            data={activeFlashProducts}
            keyExtractor={(item) => String(item.id)}
            emptyMessage="No active flash sale or clearance items currently listed on the storefront."
          />
        )}
      </div>

      {/* ─── Confirmation Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeTriggerClearance}
        title="Confirm Storewide Clearance Trigger"
        description="Are you sure you want to invoke POST /api/Products/trigger-clearance? This will algorithmically recalculate discount prices across inventory and immediately publish flash deals to the customer storefront."
        confirmText="Yes, Trigger Clearance Now"
        variant="warning"
        isLoading={isTriggering}
      />
    </div>
  );
}
