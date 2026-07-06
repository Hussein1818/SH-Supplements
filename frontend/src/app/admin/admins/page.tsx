"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldAlert, KeyRound, UserPlus, Mail, Lock, CheckCircle2, ShieldCheck, RefreshCw, User } from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Field, FieldError } from "@/src/components/ui/field";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  id: string | number;
  fullName?: string;
  name?: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  profileImageUrl?: string | null;
  createdAt?: string;
}

const createAdminSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CreateAdminValues = z.infer<typeof createAdminSchema>;

export default function AdminAdminsPage() {
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/User/all");
      const users: UserProfile[] = Array.isArray(res.data)
        ? res.data
        : res.data.users || res.data.data || res.data.items || [];
      
      // Filter strictly for admins
      const adminsOnly = users.filter((u) => {
        const r = (u.role || "").toLowerCase();
        return r === "admin" || r === "administrator" || u.isAdmin === true;
      });
      setAdminUsers(adminsOnly);
    } catch (err: any) {
      console.error("Failed to fetch admin users:", err);
      setError("Could not retrieve administrator directory from server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const onSubmit = async (values: CreateAdminValues) => {
    try {
      const res = await api.post("/Dashboard/create-admin", {
        email: values.email.trim(),
        password: values.password,
      });

      toast.success(res.data?.message || `Administrator account created for ${values.email}!`);
      reset();
      fetchAdmins();
    } catch (err: any) {
      console.error("Create admin failed:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to provision administrator credentials on backend.";
      toast.error(msg);
    }
  };

  const columns: Column<UserProfile>[] = [
    {
      header: "Administrator",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-xs shrink-0">
            {(u.fullName || u.name || u.email || "A").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-stone-900 text-xs">
              {u.fullName || u.name || "Administrator Account"}
            </p>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Account ID",
      cell: (u) => <span className="font-mono text-xs text-stone-500 font-bold">#{u.id}</span>,
    },
    {
      header: "Access Privilege",
      cell: () => (
        <Badge variant="stone" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold text-[11px] gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Super Admin
        </Badge>
      ),
    },
    {
      header: "Registration Date",
      cell: (u) => (
        <span className="text-xs text-stone-600 font-medium">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active Access"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Administrative Accounts Management"
        subtitle="Provision super-administrator privileges and inspect active staff accounts with system access."
      >
        <Button
          onClick={fetchAdmins}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="rounded-xl font-bold gap-2 bg-white shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh Directory</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Onboarding Form */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" /> Provision Admin Account
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Create a new administrative user via <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[10px]">POST /api/Dashboard/create-admin</code>.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
              <Label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Staff Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <Input
                  id="admin-email"
                  type="email"
                  {...register("email")}
                  placeholder="admin@sh-supplements.com"
                  className="pl-10 h-11 rounded-xl bg-stone-50 focus:bg-white"
                />
              </div>
              <FieldError errors={errors.email ? [{ message: errors.email.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="admin-pass" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Secure Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <Input
                  id="admin-pass"
                  type="password"
                  {...register("password")}
                  placeholder="Min 8 chars, letters & numbers"
                  className="pl-10 h-11 rounded-xl bg-stone-50 focus:bg-white"
                />
              </div>
              <FieldError errors={errors.password ? [{ message: errors.password.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="admin-conf" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <Input
                  id="admin-conf"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Re-enter exact password"
                  className="pl-10 h-11 rounded-xl bg-stone-50 focus:bg-white"
                />
              </div>
              <FieldError errors={errors.confirmPassword ? [{ message: errors.confirmPassword.message }] : undefined} />
            </Field>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900 space-y-1 font-medium">
              <p className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Access Grant
              </p>
              <p className="text-stone-600 leading-normal">
                New administrators will be able to sign in immediately and manage all inventory, coupons, and orders.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/10"
            >
              Create Administrator Account
            </Button>
          </form>
        </div>

        {/* Existing Admins Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" /> Active Administrator Directory
            </h3>
            <span className="text-xs font-bold text-stone-400">
              {adminUsers.length} active admins
            </span>
          </div>

          {isLoading ? (
            <LoadingSkeleton type="table" count={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchAdmins} />
          ) : (
            <DataTable
              columns={columns}
              data={adminUsers}
              keyExtractor={(item) => String(item.id)}
              emptyMessage="No administrators returned by directory query."
            />
          )}
        </div>
      </div>
    </div>
  );
}
