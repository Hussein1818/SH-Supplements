"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Ticket,
  Search,
  Calendar,
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Field, FieldError } from "@/src/components/ui/field";
import { formatPrice } from "@/src/lib/utils";
import { toast } from "sonner";

interface Coupon {
  id: number | string;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  expirationDate?: string;
  expiryDate?: string;
  validUntil?: string;
  isActive?: boolean;
  minOrderAmount?: number;
  usageCount?: number;
}

const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(30, "Code is too long")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, or underscores"),
  discountPercentage: z
    .number()
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  expirationDate: z.string().min(1, "Please specify an expiration date"),
  minOrderAmount: z.number().min(0, "Minimum order cannot be negative"),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deactivatingCoupon, setDeactivatingCoupon] = useState<Coupon | null>(null);
  const [isDeactivateLoading, setIsDeactivateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      minOrderAmount: 0,
    },
  });

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/Coupons/all");
      const data = Array.isArray(res.data) ? res.data : res.data.coupons || res.data.data || [];
      setCoupons(data);
    } catch (err: any) {
      console.error("Failed to load coupons:", err);
      if (err.response?.status === 404) {
        setError("GET /Coupons/all endpoint was not found on the backend server.");
      } else {
        setError(
          err.response?.data?.Message ||
            err.response?.data?.message ||
            "Could not retrieve promotional coupons from server."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const onSubmit = async (values: CouponFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        code: values.code.toUpperCase().trim(),
        discountPercentage: values.discountPercentage,
        discountAmount: values.discountPercentage,
        expirationDate: new Date(values.expirationDate).toISOString(),
        expiryDate: new Date(values.expirationDate).toISOString(),
        validUntil: new Date(values.expirationDate).toISOString(),
        minOrderAmount: values.minOrderAmount || 0,
        isActive: true,
      };
      await api.post("/Coupons", payload);
      toast.success(`Coupon code "${values.code}" registered successfully!`);
      reset();
      setIsCreateModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error("Failed to create coupon:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to register promotional coupon.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingCoupon) return;
    setIsDeactivateLoading(true);
    try {
      await api.put(`/Coupons/${deactivatingCoupon.id}/deactivate`);
      toast.success(`Coupon "${deactivatingCoupon.code}" deactivated successfully!`);
      setCoupons((prev) =>
        prev.map((c) => (c.id === deactivatingCoupon.id ? { ...c, isActive: false } : c))
      );
      setDeactivatingCoupon(null);
    } catch (err: any) {
      console.error("Deactivate coupon failed:", err);
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to deactivate coupon.";
      toast.error(msg);
    } finally {
      setIsDeactivateLoading(false);
    }
  };

  const getCouponStatus = (c: Coupon): "Active" | "Inactive" | "Expired" => {
    const dateStr = c.expirationDate || c.expiryDate || c.validUntil;
    const isExpired = dateStr ? new Date(dateStr).getTime() <= Date.now() : false;
    if (isExpired) return "Expired";
    if (c.isActive === false) return "Inactive";
    return "Active";
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch = c.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getCouponStatus(c);
    const matchesStatus =
      statusFilter === "All" || statusFilter === status;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Coupon>[] = [
    {
      header: "Promo Code",
      accessorKey: "code",
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-stone-900 font-mono text-sm tracking-wider">
              {c.code}
            </span>
            <p className="text-[10px] text-stone-400 font-medium">ID: #{c.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Discount Value",
      cell: (c) => (
        <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 text-sm bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
          <Percent className="w-3.5 h-3.5 shrink-0" />
          {c.discountPercentage || c.discountAmount || 0}% OFF
        </span>
      ),
    },
    {
      header: "Min. Order",
      cell: (c) => (
        <span className="font-bold text-stone-700 text-xs">
          {c.minOrderAmount && c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : "None"}
        </span>
      ),
    },
    {
      header: "Expiration Date",
      cell: (c) => {
        const dateStr = c.expirationDate || c.expiryDate || c.validUntil;
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
            <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            {dateStr ? new Date(dateStr).toLocaleDateString() : "Never Expires"}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (c) => {
        const status = getCouponStatus(c);
        if (status === "Active") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Active
            </span>
          );
        } else if (status === "Inactive") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Inactive
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Expired
            </span>
          );
        }
      },
    },
    {
      header: "Actions",
      cell: (c) => {
        const status = getCouponStatus(c);
        return (
          <div className="flex items-center justify-end">
            {status === "Active" ? (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setDeactivatingCoupon(c)}
                title="Deactivate Coupon"
                className="rounded-lg text-stone-700 hover:text-red-600 gap-1 font-semibold"
              >
                <Ban className="w-3.5 h-3.5" /> Deactivate
              </Button>
            ) : (
              <span className="text-xs text-stone-400 font-medium italic">Deactivated</span>
            )}
          </div>
        );
      },
      className: "text-right w-32",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Coupons & Promotions"
        subtitle="Create discount vouchers and promotional codes for marketing campaigns."
      >
        <Button
          onClick={() => {
            reset();
            setIsCreateModalOpen(true);
          }}
          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-900/10 h-11 px-6"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </PageHeader>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search coupon promo codes..."
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
            <option value="Expired">Expired Only</option>
          </select>

          <span className="text-xs font-semibold text-stone-500">
            Total: <strong className="text-stone-900">{filteredCoupons.length}</strong>
          </span>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCoupons} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCoupons}
          keyExtractor={(item) => item.id}
          emptyMessage={
            searchQuery || statusFilter !== "All"
              ? "No promotional codes match your search criteria."
              : "No coupons created yet. Click 'Create Coupon' to generate a promotional discount."
          }
        />
      )}

      {/* ─── Create Coupon Modal ────────────────────────────────────────── */}
      <FormDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Promotional Coupon"
        description="Configure discount percentages and validity dates for customer checkout."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field>
            <Label htmlFor="coupon-code" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Promo Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="coupon-code"
              {...register("code")}
              onChange={(e) => setValue("code", e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER2026, RAMADAN50"
              className="mt-1.5 h-11 rounded-xl font-mono uppercase font-bold text-stone-900 tracking-wider"
            />
            <FieldError errors={errors.code ? [{ message: errors.code.message }] : undefined} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="coupon-discount" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Discount Percentage (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="coupon-discount"
                type="number"
                {...register("discountPercentage", { valueAsNumber: true })}
                placeholder="10"
                className="mt-1.5 h-11 rounded-xl font-bold"
              />
              <FieldError errors={errors.discountPercentage ? [{ message: errors.discountPercentage.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="coupon-min" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Min. Order Amount (EGP)
              </Label>
              <Input
                id="coupon-min"
                type="number"
                step="0.01"
                {...register("minOrderAmount", { valueAsNumber: true })}
                placeholder="0.00"
                className="mt-1.5 h-11 rounded-xl font-semibold"
              />
              <FieldError errors={errors.minOrderAmount ? [{ message: errors.minOrderAmount.message }] : undefined} />
            </Field>
          </div>

          <Field>
            <Label htmlFor="coupon-expiry" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Expiration Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="coupon-expiry"
              type="date"
              {...register("expirationDate")}
              className="mt-1.5 h-11 rounded-xl font-semibold"
            />
            <FieldError errors={errors.expirationDate ? [{ message: errors.expirationDate.message }] : undefined} />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 px-6"
            >
              Create Coupon
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingCoupon}
        onClose={() => setDeactivatingCoupon(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Coupon"
        description={`Are you sure you want to deactivate coupon "${deactivatingCoupon?.code}"? Once deactivated, customers will no longer be able to use this promotional code during checkout.`}
        variant="destructive"
        isLoading={isDeactivateLoading}
      />
    </div>
  );
}
