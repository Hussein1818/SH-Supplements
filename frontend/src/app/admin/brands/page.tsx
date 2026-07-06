"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Tag, Image as ImageIcon } from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Field, FieldError } from "@/src/components/ui/field";
import { toast } from "sonner";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters").max(50, "Name is too long"),
  description: z.string().max(300, "Description cannot exceed 300 characters").optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export default function AdminBrandsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
    },
  });

  const onSubmit = async (values: BrandFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        logoUrl: values.logoUrl?.trim() || null,
        imageUrl: values.logoUrl?.trim() || null,
      };
      await api.post("/Brands", payload);
      toast.success(`Brand "${values.name}" created successfully via POST /api/Brands!`);
      reset();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save brand:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to create brand. Please verify your input and try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Brands Management"
        subtitle="Manage supplement brands and manufacturer affiliations."
      >
        <Button
          onClick={() => {
            reset({
              name: "",
              description: "",
              logoUrl: "",
            });
            setIsCreateModalOpen(true);
          }}
          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-900/10 h-11 px-5"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </Button>
      </PageHeader>

      {/* Informational Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12 shadow-sm text-center max-w-2xl mx-auto my-12 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60 shadow-sm">
          <Tag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-stone-900 tracking-tight">Brand Listing & Management Unavailable</h3>
          <p className="text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">
            The backend API currently exposes only the Brand Creation endpoint (<code className="text-xs bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded font-mono font-semibold">POST /api/Brands</code>). Listing, updating, and deleting brands will become available once read endpoints are published by the server.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => {
              reset({ name: "", description: "", logoUrl: "" });
              setIsCreateModalOpen(true);
            }}
            variant="primary"
            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 shadow-sm px-6 h-11"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Brand
          </Button>
        </div>
      </div>

      {/* Create Brand Modal */}
      <FormDialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        title="Create New Brand"
        description="Register a new manufacturer or supplement brand via POST /api/Brands."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field>
            <Label htmlFor="brand-name" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Brand Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brand-name"
              {...register("name")}
              placeholder="e.g. Optimum Nutrition, MuscleTech"
              className="mt-1.5 h-11 rounded-xl bg-stone-50 focus:bg-white transition-all"
            />
            <FieldError errors={errors.name ? [{ message: errors.name.message }] : undefined} />
          </Field>

          <Field>
            <Label htmlFor="brand-desc" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Description
            </Label>
            <textarea
              id="brand-desc"
              {...register("description")}
              rows={3}
              placeholder="Brief summary of brand products and specialization..."
              className="mt-1.5 w-full p-3 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <FieldError errors={errors.description ? [{ message: errors.description.message }] : undefined} />
          </Field>

          <Field>
            <Label htmlFor="brand-logo" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
              Logo URL
            </Label>
            <div className="relative mt-1.5">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                id="brand-logo"
                {...register("logoUrl")}
                placeholder="https://example.com/logo.png"
                className="pl-10 h-11 rounded-xl bg-stone-50 focus:bg-white transition-all"
              />
            </div>
            <FieldError errors={errors.logoUrl ? [{ message: errors.logoUrl.message }] : undefined} />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
              }}
              disabled={isSubmitting}
              className="rounded-xl font-semibold h-11 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 px-6 h-11 shadow-sm"
            >
              Create Brand
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
