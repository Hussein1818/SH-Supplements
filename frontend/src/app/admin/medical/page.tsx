"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  HeartPulse,
  ShieldCheck,
  Activity,
  FileText,
  Plus,
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Field, FieldError } from "@/src/components/ui/field";
import { normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";

interface ProductItem {
  id: string | number;
  name: string;
  brandName?: string;
  mainImageUrl?: string | null;
}

interface ActiveIngredient {
  id?: string | number;
  name: string;
  maximumSafeDailyDose?: number | string;
  unit?: string;
  maxDailyDose?: number | string;
}

interface GlossaryItem {
  id?: string | number;
  ingredientName?: string;
  name?: string;
  benefits?: string;
  warnings?: string;
  description?: string;
}

// Zod Schemas
const activeIngSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name too long"),
  maximumSafeDailyDose: z.number().min(0.01, "Must be greater than 0"),
  unit: z.string().min(1, "Please select or enter a unit"),
});

const prodIngSchema = z.object({
  productId: z.string().min(1, "Please select a target product"),
  activeIngredientId: z.string().min(1, "Please select or enter an active ingredient"),
  dosagePerServing: z.string().min(1, "Dosage per serving is required"),
});

const glossarySchema = z.object({
  ingredientName: z.string().min(2, "Ingredient name must be at least 2 characters"),
  benefits: z.string().min(5, "Please list health benefits"),
  warnings: z.string().min(3, "Please specify medical warnings or contraindications"),
  description: z.string().min(10, "Please provide a detailed medical description"),
});

const dosageGuideSchema = z.object({
  productId: z.string().min(1, "Please select a target product"),
  routineName: z.string().min(2, "Routine name required (e.g. Pre-Workout Boost)"),
  recommendedTime: z.string().min(2, "Time required (e.g. 30 mins before breakfast)"),
  dosage: z.string().min(1, "Dosage required (e.g. 1 scoop / 5 grams)"),
  instructions: z.string().min(5, "Detailed usage instructions required"),
});

type ActiveIngValues = z.infer<typeof activeIngSchema>;
type ProdIngValues = z.infer<typeof prodIngSchema>;
type GlossaryValues = z.infer<typeof glossarySchema>;
type DosageGuideValues = z.infer<typeof dosageGuideSchema>;

export default function AdminMedicalPage() {
  const [activeTab, setActiveTab] = useState<"ingredients" | "product-ingredients" | "glossary" | "dosage">("ingredients");
  const [productsCatalog, setProductsCatalog] = useState<ProductItem[]>([]);
  const [activeIngredientsList, setActiveIngredientsList] = useState<ActiveIngredient[]>([]);
  const [glossaryList, setGlossaryList] = useState<GlossaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const ingForm = useForm<ActiveIngValues>({
    resolver: zodResolver(activeIngSchema),
    defaultValues: { name: "", maximumSafeDailyDose: 0, unit: "mg" },
  });

  const prodIngForm = useForm<ProdIngValues>({
    resolver: zodResolver(prodIngSchema),
    defaultValues: { productId: "", activeIngredientId: "", dosagePerServing: "" },
  });

  const glossaryForm = useForm<GlossaryValues>({
    resolver: zodResolver(glossarySchema),
    defaultValues: { ingredientName: "", benefits: "", warnings: "", description: "" },
  });

  const dosageForm = useForm<DosageGuideValues>({
    resolver: zodResolver(dosageGuideSchema),
    defaultValues: { productId: "", routineName: "", recommendedTime: "", dosage: "", instructions: "" },
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Products catalog for selection (reusing verified customer product listing API)
      try {
        const prodRes = await api.get("/Products", { params: { pageNumber: 1, pageSize: 100 } });
        const prodsData = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data.items || prodRes.data.products || [];
        setProductsCatalog(prodsData);
      } catch (err) {
        console.warn("Could not load products catalog for medical assignment:", err);
      }

      // 2. Fetch Active Ingredients list if available
      try {
        let ingRes;
        try {
          ingRes = await api.get("/ActiveIngredients");
        } catch (e: any) {
          if (e.response?.status === 404) {
            ingRes = await api.get("/ActiveIngredients/all");
          } else {
            throw e;
          }
        }
        const ingData = Array.isArray(ingRes.data) ? ingRes.data : ingRes.data.data || [];
        setActiveIngredientsList(ingData);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.warn("Could not retrieve active ingredients list:", err);
        }
      }

      // 3. Fetch Medical Glossary if available
      try {
        const glosRes = await api.get("/Products/ingredients");
        const glosData = Array.isArray(glosRes.data) ? glosRes.data : glosRes.data.data || [];
        setGlossaryList(glosData);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.warn("Could not retrieve medical glossary list:", err);
        }
      }
    } catch (err: any) {
      console.error("Failed to initialize medical management page:", err);
      setError("Could not load catalog dependencies from backend.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Section A: Submit Active Ingredient
  const onSubmitActiveIng = async (values: ActiveIngValues) => {
    try {
      await api.post("/ActiveIngredients", {
        name: values.name.trim(),
        maximumSafeDailyDose: Number(values.maximumSafeDailyDose),
        unit: values.unit.trim(),
        maxDailyDose: Number(values.maximumSafeDailyDose),
      });
      toast.success(`Active Ingredient "${values.name}" registered successfully!`);
      ingForm.reset();
      fetchData();
    } catch (err: any) {
      console.error("Failed to register active ingredient:", err);
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to add active ingredient.";
      toast.error(msg);
    }
  };

  // Section B: Submit Product Active Ingredient
  const onSubmitProdIng = async (values: ProdIngValues) => {
    try {
      await api.post(`/Products/${values.productId}/active-ingredients`, {
        productId: values.productId,
        activeIngredientId: values.activeIngredientId,
        ingredientId: values.activeIngredientId,
        dosagePerServing: values.dosagePerServing.trim(),
        dosage: values.dosagePerServing.trim(),
      });
      toast.success("Active ingredient assigned to product successfully!");
      prodIngForm.reset();
    } catch (err: any) {
      console.error("Failed to assign active ingredient to product:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to link active ingredient to product.";
      toast.error(msg);
    }
  };

  // Section C: Submit Medical Glossary
  const onSubmitGlossary = async (values: GlossaryValues) => {
    try {
      await api.post("/Products/ingredients", {
        ingredientName: values.ingredientName.trim(),
        name: values.ingredientName.trim(),
        benefits: values.benefits.trim(),
        warnings: values.warnings.trim(),
        description: values.description.trim(),
      });
      toast.success(`Glossary entry for "${values.ingredientName}" created!`);
      glossaryForm.reset();
      fetchData();
    } catch (err: any) {
      console.error("Failed to create glossary entry:", err);
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to add glossary entry.";
      toast.error(msg);
    }
  };

  // Section D: Submit Dosage Guide
  const onSubmitDosageGuide = async (values: DosageGuideValues) => {
    try {
      await api.post(`/Products/${values.productId}/dosage-guide`, {
        productId: values.productId,
        routineName: values.routineName.trim(),
        recommendedTime: values.recommendedTime.trim(),
        dosage: values.dosage.trim(),
        recommendedDosage: values.dosage.trim(),
        instructions: values.instructions.trim(),
      });
      toast.success("Dosage guide published to product successfully!");
      dosageForm.reset();
    } catch (err: any) {
      console.error("Failed to save dosage guide:", err);
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to publish dosage guide.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Health & Medical Management"
        subtitle="Manage active chemical ingredients, medical glossary entries, daily safety limits, and product dosage routines."
      >
        <Button
          onClick={() => fetchData()}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="rounded-xl font-bold gap-2 bg-white shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh Data</span>
        </Button>
      </PageHeader>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab("ingredients")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ingredients"
              ? "bg-white text-emerald-700 shadow-sm border border-stone-200/60"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <Activity className="w-4 h-4" /> A. Active Ingredients
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("product-ingredients")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "product-ingredients"
              ? "bg-white text-emerald-700 shadow-sm border border-stone-200/60"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <Package className="w-4 h-4" /> B. Product Active Ingredients
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("glossary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "glossary"
              ? "bg-white text-emerald-700 shadow-sm border border-stone-200/60"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> C. Medical Glossary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dosage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "dosage"
              ? "bg-white text-emerald-700 shadow-sm border border-stone-200/60"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <HeartPulse className="w-4 h-4" /> D. Dosage Guide
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="cards" count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
          {/* ─── SECTION A: ACTIVE INGREDIENTS ──────────────────────────────── */}
          {activeTab === "ingredients" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" /> Register Active Ingredient
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Add new chemical compounds or botanical extracts to the global health registry via <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[10px]">POST /api/ActiveIngredients</code>.
                  </p>
                </div>

                <form onSubmit={ingForm.handleSubmit(onSubmitActiveIng)} className="space-y-4">
                  <Field>
                    <Label htmlFor="ing-name" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Ingredient Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ing-name"
                      {...ingForm.register("name")}
                      placeholder="e.g. Creatine Monohydrate, L-Citrulline"
                      className="mt-1 h-11 rounded-xl"
                    />
                    <FieldError errors={ingForm.formState.errors.name ? [{ message: ingForm.formState.errors.name.message }] : undefined} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <Label htmlFor="ing-dose" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Max Daily Dose <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ing-dose"
                        type="number"
                        step="0.1"
                        {...ingForm.register("maximumSafeDailyDose", { valueAsNumber: true })}
                        placeholder="5.0"
                        className="mt-1 h-11 rounded-xl font-bold"
                      />
                      <FieldError errors={ingForm.formState.errors.maximumSafeDailyDose ? [{ message: ingForm.formState.errors.maximumSafeDailyDose.message }] : undefined} />
                    </Field>

                    <Field>
                      <Label htmlFor="ing-unit" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Measurement Unit <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="ing-unit"
                        {...ingForm.register("unit")}
                        className="mt-1 h-11 w-full px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="mg">mg (Milligrams)</option>
                        <option value="g">g (Grams)</option>
                        <option value="mcg">mcg (Micrograms)</option>
                        <option value="IU">IU (International Units)</option>
                        <option value="ml">ml (Milliliters)</option>
                      </select>
                      <FieldError errors={ingForm.formState.errors.unit ? [{ message: ingForm.formState.errors.unit.message }] : undefined} />
                    </Field>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={ingForm.formState.isSubmitting}
                    className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/10"
                  >
                    Save Active Ingredient
                  </Button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4 lg:border-l lg:pl-8 border-stone-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h4 className="font-extrabold text-stone-900 text-sm">Registered Ingredients Registry</h4>
                  <span className="text-xs font-bold text-stone-400">{activeIngredientsList.length} total compounds</span>
                </div>

                {activeIngredientsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {activeIngredientsList.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{item.name}</p>
                          <p className="text-[11px] text-stone-400 font-mono mt-0.5">ID: #{item.id || idx + 1}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                          Max: {item.maximumSafeDailyDose || item.maxDailyDose || "—"} {item.unit || "mg"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-stone-400 text-xs font-medium space-y-1">
                    <p>No existing active ingredients exposed by GET endpoint.</p>
                    <p className="text-[11px] text-stone-400">Use the form on the left to register new chemical compounds.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SECTION B: PRODUCT ACTIVE INGREDIENTS ──────────────────────── */}
          {activeTab === "product-ingredients" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-extrabold text-stone-900">Link Ingredient to Product</h3>
                <p className="text-xs text-stone-500">
                  Assign active chemical compounds to supplement formulas via <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[10px]">POST /api/Products/{"{id}"}/active-ingredients</code>.
                </p>
              </div>

              <form onSubmit={prodIngForm.handleSubmit(onSubmitProdIng)} className="space-y-5 bg-stone-50 p-6 rounded-3xl border border-stone-200">
                <Field>
                  <Label htmlFor="prod-select" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Target Product <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="prod-select"
                    {...prodIngForm.register("productId")}
                    className="mt-1 h-11 w-full px-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select a supplement product...</option>
                    {productsCatalog.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brandName || `ID: #${p.id}`})
                      </option>
                    ))}
                  </select>
                  <FieldError errors={prodIngForm.formState.errors.productId ? [{ message: prodIngForm.formState.errors.productId.message }] : undefined} />
                </Field>

                <Field>
                  <Label htmlFor="ing-select" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Active Ingredient Compound <span className="text-red-500">*</span>
                  </Label>
                  {activeIngredientsList.length > 0 ? (
                    <select
                      id="ing-select"
                      {...prodIngForm.register("activeIngredientId")}
                      className="mt-1 h-11 w-full px-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Select an active ingredient...</option>
                      {activeIngredientsList.map((i) => (
                        <option key={i.id || i.name} value={i.id || i.name}>
                          {i.name} (Max Safe: {i.maximumSafeDailyDose || i.maxDailyDose || "—"} {i.unit})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="ing-select"
                      {...prodIngForm.register("activeIngredientId")}
                      placeholder="Enter active ingredient ID or compound name..."
                      className="mt-1 h-11 rounded-xl bg-white"
                    />
                  )}
                  <FieldError errors={prodIngForm.formState.errors.activeIngredientId ? [{ message: prodIngForm.formState.errors.activeIngredientId.message }] : undefined} />
                </Field>

                <Field>
                  <Label htmlFor="serving-dose" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Dosage Per Serving <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serving-dose"
                    {...prodIngForm.register("dosagePerServing")}
                    placeholder="e.g. 5000 mg, 3.5 g, 200 IU"
                    className="mt-1 h-11 rounded-xl bg-white font-semibold"
                  />
                  <FieldError errors={prodIngForm.formState.errors.dosagePerServing ? [{ message: prodIngForm.formState.errors.dosagePerServing.message }] : undefined} />
                </Field>

                <Button
                  type="submit"
                  variant="primary"
                  loading={prodIngForm.formState.isSubmitting}
                  className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  Link Ingredient to Product Formula
                </Button>
              </form>
            </div>
          )}

          {/* ─── SECTION C: MEDICAL GLOSSARY ────────────────────────────────── */}
          {activeTab === "glossary" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Add Glossary Entry
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Create detailed medical explanations and safety warnings via <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[10px]">POST /api/Products/ingredients</code>.
                  </p>
                </div>

                <form onSubmit={glossaryForm.handleSubmit(onSubmitGlossary)} className="space-y-4">
                  <Field>
                    <Label htmlFor="glos-name" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Ingredient Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="glos-name"
                      {...glossaryForm.register("ingredientName")}
                      placeholder="e.g. Ashwagandha Extract, Beta-Alanine"
                      className="mt-1 h-11 rounded-xl"
                    />
                    <FieldError errors={glossaryForm.formState.errors.ingredientName ? [{ message: glossaryForm.formState.errors.ingredientName.message }] : undefined} />
                  </Field>

                  <Field>
                    <Label htmlFor="glos-benefits" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Health Benefits <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="glos-benefits"
                      {...glossaryForm.register("benefits")}
                      rows={2}
                      placeholder="Enhances ATP recovery, boosts muscular endurance..."
                      className="mt-1 w-full p-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <FieldError errors={glossaryForm.formState.errors.benefits ? [{ message: glossaryForm.formState.errors.benefits.message }] : undefined} />
                  </Field>

                  <Field>
                    <Label htmlFor="glos-warnings" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Medical Warnings / Contraindications <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="glos-warnings"
                      {...glossaryForm.register("warnings")}
                      rows={2}
                      placeholder="May cause harmless skin tingling (paresthesia). Avoid if pregnant..."
                      className="mt-1 w-full p-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <FieldError errors={glossaryForm.formState.errors.warnings ? [{ message: glossaryForm.formState.errors.warnings.message }] : undefined} />
                  </Field>

                  <Field>
                    <Label htmlFor="glos-desc" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Detailed Medical Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="glos-desc"
                      {...glossaryForm.register("description")}
                      rows={3}
                      placeholder="Scientific overview of mechanism of action and clinical research findings..."
                      className="mt-1 w-full p-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <FieldError errors={glossaryForm.formState.errors.description ? [{ message: glossaryForm.formState.errors.description.message }] : undefined} />
                  </Field>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={glossaryForm.formState.isSubmitting}
                    className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                  >
                    Publish Glossary Entry
                  </Button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4 lg:border-l lg:pl-8 border-stone-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h4 className="font-extrabold text-stone-900 text-sm">Medical Glossary Database</h4>
                  <span className="text-xs font-bold text-stone-400">{glossaryList.length} active entries</span>
                </div>

                {glossaryList.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {glossaryList.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-stone-900 text-sm">{item.ingredientName || item.name}</h5>
                          <span className="text-[10px] font-mono text-stone-400">ID: #{item.id || idx + 1}</span>
                        </div>
                        {item.benefits && (
                          <p className="text-xs text-emerald-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 font-medium">
                            <strong>Benefits:</strong> {item.benefits}
                          </p>
                        )}
                        {item.warnings && (
                          <p className="text-xs text-amber-800 bg-amber-50/50 p-2 rounded-lg border border-amber-100 font-medium">
                            <strong>Warnings:</strong> {item.warnings}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-stone-400 text-xs font-medium space-y-1">
                    <p>No medical glossary entries returned by server.</p>
                    <p className="text-[11px] text-stone-400">Use the form on the left to publish comprehensive ingredient documentation.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SECTION D: DOSAGE GUIDE ────────────────────────────────────── */}
          {activeTab === "dosage" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-extrabold text-stone-900">Configure Product Dosage Guide</h3>
                <p className="text-xs text-stone-500">
                  Define recommended intake schedules and preparation routines via <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[10px]">POST /api/Products/{"{id}"}/dosage-guide</code>.
                </p>
              </div>

              <form onSubmit={dosageForm.handleSubmit(onSubmitDosageGuide)} className="space-y-5 bg-stone-50 p-6 rounded-3xl border border-stone-200">
                <Field>
                  <Label htmlFor="dose-prod" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Target Supplement Product <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="dose-prod"
                    {...dosageForm.register("productId")}
                    className="mt-1 h-11 w-full px-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select a supplement product...</option>
                    {productsCatalog.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brandName || `ID: #${p.id}`})
                      </option>
                    ))}
                  </select>
                  <FieldError errors={dosageForm.formState.errors.productId ? [{ message: dosageForm.formState.errors.productId.message }] : undefined} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <Label htmlFor="routine-name" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Routine Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="routine-name"
                      {...dosageForm.register("routineName")}
                      placeholder="e.g. Daily Maintenance, Pre-Workout Stack"
                      className="mt-1 h-11 rounded-xl bg-white font-semibold"
                    />
                    <FieldError errors={dosageForm.formState.errors.routineName ? [{ message: dosageForm.formState.errors.routineName.message }] : undefined} />
                  </Field>

                  <Field>
                    <Label htmlFor="rec-time" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Recommended Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rec-time"
                      {...dosageForm.register("recommendedTime")}
                      placeholder="e.g. 30 mins before training, Morning with food"
                      className="mt-1 h-11 rounded-xl bg-white font-semibold"
                    />
                    <FieldError errors={dosageForm.formState.errors.recommendedTime ? [{ message: dosageForm.formState.errors.recommendedTime.message }] : undefined} />
                  </Field>
                </div>

                <Field>
                  <Label htmlFor="dose-amount" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Dosage Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dose-amount"
                    {...dosageForm.register("dosage")}
                    placeholder="e.g. 1 level scoop (5 grams) in 250ml water"
                    className="mt-1 h-11 rounded-xl bg-white font-bold text-emerald-800"
                  />
                  <FieldError errors={dosageForm.formState.errors.dosage ? [{ message: dosageForm.formState.errors.dosage.message }] : undefined} />
                </Field>

                <Field>
                  <Label htmlFor="dose-instructions" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Preparation & Usage Instructions <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="dose-instructions"
                    {...dosageForm.register("instructions")}
                    rows={3}
                    placeholder="Mix thoroughly in shaker cup for 15 seconds. Consume immediately after preparation. Do not exceed 2 servings per 24-hour period..."
                    className="mt-1 w-full p-3 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <FieldError errors={dosageForm.formState.errors.instructions ? [{ message: dosageForm.formState.errors.instructions.message }] : undefined} />
                </Field>

                <Button
                  type="submit"
                  variant="primary"
                  loading={dosageForm.formState.isSubmitting}
                  className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  Publish Dosage Guide to Product
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
