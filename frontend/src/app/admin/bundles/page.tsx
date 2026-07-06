"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Package,
  Search,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Eye,
  Percent,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Field, FieldError } from "@/src/components/ui/field";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";

interface ProductItem {
  id: string | number;
  name: string;
  price: number;
  discountPrice?: number;
  mainImageUrl?: string;
  brandName?: string;
}

interface BundleProduct {
  id?: string | number;
  productId: string | number;
  quantity?: number;
  product?: ProductItem;
  name?: string;
  price?: number;
}

interface Bundle {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isActive?: boolean;
  productIds?: (string | number)[];
  products?: BundleProduct[] | any[];
  bundleProducts?: BundleProduct[] | any[];
  items?: any[];
}

const bundleSchema = z.object({
  name: z.string().min(3, "Bundle name must be at least 3 characters").max(70, "Name is too long"),
  description: z.string().max(400, "Description cannot exceed 400 characters").optional(),
  price: z.number().min(0.01, "Regular price must be greater than zero"),
  discountPrice: z.number().min(0, "Discount price cannot be negative").optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type BundleFormValues = z.infer<typeof bundleSchema>;

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Array<string | number>>([]);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BundleFormValues>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: 0,
      imageUrl: "",
    },
  });

  const watchPrice = Number(watch("price") || 0);
  const watchDiscountPrice = Number(watch("discountPrice") || 0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Bundles
      const bundlesRes = await api.get("/ProductBundles");
      const bundlesData = Array.isArray(bundlesRes.data)
        ? bundlesRes.data
        : bundlesRes.data.bundles || bundlesRes.data.data || [];
      setBundles(bundlesData);

      // 2. Fetch Products Catalog for bundle selection (reusing customer /Products listing API)
      try {
        const prodRes = await api.get("/Products", {
          params: { pageNumber: 1, pageSize: 100 },
        });
        const prodsData = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data.items || prodRes.data.products || [];
        setProductsCatalog(prodsData);
      } catch (prodErr) {
        console.warn("Could not load products catalog for bundle selection:", prodErr);
      }
    } catch (err: any) {
      console.error("Failed to load product bundles:", err);
      if (err.response?.status === 404) {
        setError("GET /ProductBundles endpoint was not found on the backend server.");
      } else {
        setError(
          err.response?.data?.Message ||
            err.response?.data?.message ||
            "Could not retrieve promotional bundles from server."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleProductSelection = (id: string | number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onSubmit = async (values: BundleFormValues) => {
    if (selectedProductIds.length === 0) {
      toast.error("Please select at least one product to include in the bundle.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        price: Number(values.price),
        discountPrice: values.discountPrice && values.discountPrice > 0 ? Number(values.discountPrice) : Number(values.price),
        imageUrl: values.imageUrl?.trim() || null,
        isActive: true,
        productIds: selectedProductIds,
        products: selectedProductIds.map((id) => ({ productId: id, quantity: 1 })),
        bundleProducts: selectedProductIds.map((id) => ({ productId: id, quantity: 1 })),
      };

      await api.post("/ProductBundles", payload);
      toast.success(`Bundle "${values.name}" created successfully!`);
      reset();
      setSelectedProductIds([]);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Failed to create bundle:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to create product bundle. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBundleProductsCount = (b: Bundle) => {
    if (Array.isArray(b.products) && b.products.length > 0) return b.products.length;
    if (Array.isArray(b.bundleProducts) && b.bundleProducts.length > 0) return b.bundleProducts.length;
    if (Array.isArray(b.productIds) && b.productIds.length > 0) return b.productIds.length;
    if (Array.isArray(b.items) && b.items.length > 0) return b.items.length;
    return 0;
  };

  const resolveBundleProducts = (b: Bundle): ProductItem[] => {
    const rawList = b.products || b.bundleProducts || b.items || [];
    const resolved: ProductItem[] = [];

    if (rawList.length > 0) {
      rawList.forEach((item: any) => {
        const prodId = item.productId || item.id || item;
        const found = productsCatalog.find((p) => String(p.id) === String(prodId));
        if (found) {
          resolved.push(found);
        } else if (item.name || item.product?.name) {
          resolved.push({
            id: prodId,
            name: item.name || item.product?.name || `Product #${prodId}`,
            price: item.price || item.product?.price || 0,
            mainImageUrl: item.mainImageUrl || item.product?.mainImageUrl || undefined,
          });
        } else {
          resolved.push({
            id: prodId,
            name: `Supplement Item #${prodId}`,
            price: 0,
          });
        }
      });
      return resolved;
    }

    if (Array.isArray(b.productIds) && b.productIds.length > 0) {
      b.productIds.forEach((id) => {
        const found = productsCatalog.find((p) => String(p.id) === String(id));
        if (found) {
          resolved.push(found);
        } else {
          resolved.push({
            id,
            name: `Supplement Item #${id}`,
            price: 0,
          });
        }
      });
    }

    return resolved;
  };

  const filteredBundles = bundles.filter((b) =>
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProductsSum = selectedProductIds.reduce<number>((sum, id) => {
    const p = productsCatalog.find((item) => String(item.id) === String(id));
    return sum + Number(p ? p.price : 0);
  }, 0);

  const columns: Column<Bundle>[] = [
    {
      header: "Bundle Image",
      cell: (b) => (
        <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          {b.imageUrl ? (
            <img
              src={normalizeImageUrl(b.imageUrl)}
              alt={b.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Package className="w-6 h-6 text-stone-400" />
          )}
        </div>
      ),
      className: "w-20",
    },
    {
      header: "Bundle Name & Info",
      accessorKey: "name",
      cell: (b) => (
        <div className="flex flex-col max-w-md">
          <span className="font-extrabold text-stone-900 text-sm">{b.name}</span>
          {b.description ? (
            <span className="text-xs text-stone-500 line-clamp-1 mt-0.5">{b.description}</span>
          ) : (
            <span className="text-xs text-stone-400 italic">No description</span>
          )}
        </div>
      ),
    },
    {
      header: "Included Items",
      cell: (b) => {
        const count = getBundleProductsCount(b);
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs border border-stone-200">
            <Package className="w-3.5 h-3.5 text-stone-500" /> {count} {count === 1 ? "Item" : "Items"}
          </span>
        );
      },
    },
    {
      header: "Pricing",
      cell: (b) => {
        const hasDiscount = b.discountPrice && b.discountPrice < b.price && b.discountPrice > 0;
        return (
          <div className="flex flex-col">
            <span className="font-black text-stone-900 text-sm">
              {formatPrice(hasDiscount ? b.discountPrice! : b.price)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatPrice(b.price)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (b) =>
        b.isActive !== false ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200">
            <XCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Inactive
          </span>
        ),
    },
    {
      header: "Actions",
      cell: (b) => (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setSelectedBundle(b)}
            title="View Bundle Details"
            className="rounded-lg text-stone-700 hover:text-emerald-600 gap-1 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Button>
        </div>
      ),
      className: "text-right w-28",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Product Bundles & Boxes"
        subtitle="Curate multi-product supplement bundles, value packs, and promotional discount boxes."
      >
        <Button
          onClick={() => {
            reset();
            setSelectedProductIds([]);
            setIsCreateModalOpen(true);
          }}
          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-900/10 h-11 px-6"
        >
          <Plus className="w-4 h-4" /> Create Bundle
        </Button>
      </PageHeader>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search bundles by name or description..."
          className="max-w-md"
        />
        <span className="text-xs font-semibold text-stone-500">
          Total: <strong className="text-stone-900">{filteredBundles.length}</strong>
        </span>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredBundles}
          keyExtractor={(item) => String(item.id)}
          emptyMessage={
            searchQuery
              ? `No bundles match "${searchQuery}"`
              : "No product bundles curated yet. Click 'Create Bundle' to build your first pack."
          }
        />
      )}

      {/* Create Bundle Modal */}
      <FormDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Product Bundle"
        description="Select multiple products from your inventory and set package pricing."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2">
              <Label htmlFor="bundle-name" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Bundle Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bundle-name"
                {...register("name")}
                placeholder="e.g. Ultimate Mass Gainer Stack, Complete Recovery Box"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.name ? [{ message: errors.name.message }] : undefined} />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="bundle-desc" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Description
              </Label>
              <textarea
                id="bundle-desc"
                {...register("description")}
                rows={2}
                placeholder="Explain the benefits of combining these supplements..."
                className="mt-1.5 w-full p-3 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <FieldError errors={errors.description ? [{ message: errors.description.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="bundle-price" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Regular Bundle Price (EGP) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  id="bundle-price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="pl-10 h-11 rounded-xl font-bold"
                />
              </div>
              <FieldError errors={errors.price ? [{ message: errors.price.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="bundle-discount" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Special Discount Price (EGP)
              </Label>
              <div className="relative mt-1.5">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <Input
                  id="bundle-discount"
                  type="number"
                  step="0.01"
                  {...register("discountPrice", { valueAsNumber: true })}
                  className="pl-10 h-11 rounded-xl font-bold text-emerald-700"
                />
              </div>
              <FieldError errors={errors.discountPrice ? [{ message: errors.discountPrice.message }] : undefined} />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="bundle-img" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Bundle Package Image URL
              </Label>
              <div className="relative mt-1.5">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  id="bundle-img"
                  {...register("imageUrl")}
                  placeholder="https://example.com/bundle-image.jpg"
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <FieldError errors={errors.imageUrl ? [{ message: errors.imageUrl.message }] : undefined} />
            </Field>
          </div>

          {/* Product Checklist Section */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <Label className="text-stone-800 font-extrabold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" /> Select Included Products (
                {selectedProductIds.length} selected)
              </Label>
              {selectedProductsSum > 0 && (
                <span className="text-xs font-bold text-stone-500">
                  Individual Sum: <strong className="text-stone-900">{formatPrice(selectedProductsSum)}</strong>
                </span>
              )}
            </div>

            {productsCatalog.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1.5 bg-stone-50 rounded-2xl border border-stone-200">
                {productsCatalog.map((prod) => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProductSelection(prod.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 shadow-sm"
                          : "bg-white border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-300 shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs font-bold truncate ${isSelected ? "text-emerald-950" : "text-stone-800"}`}>
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase">
                            {prod.brandName || `ID: #${prod.id}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-stone-900 shrink-0 pl-2">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-stone-400 text-xs font-medium">
                No products found in catalog. Ensure inventory items are loaded.
              </div>
            )}
          </div>

          {/* Pricing Calculation Summary Badge */}
          {selectedProductIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Bundle Package Deal Summary
                </span>
                <span className="text-sm font-extrabold text-white mt-0.5">
                  {selectedProductIds.length} Products Stacked
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-300">
                  Value: <span className="line-through">{formatPrice(selectedProductsSum || watchPrice)}</span>
                </span>
                <div className="text-lg font-black text-emerald-400">
                  {formatPrice(watchDiscountPrice > 0 ? watchDiscountPrice : watchPrice)}
                </div>
              </div>
            </div>
          )}

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
              Save Bundle Stack
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Bundle Details Dialog */}
      <FormDialog
        isOpen={!!selectedBundle}
        onClose={() => setSelectedBundle(null)}
        title={selectedBundle ? `Bundle Details — ${selectedBundle.name}` : "Bundle Details"}
        description="Review included supplement products and discount price savings."
        maxWidth="lg"
      >
        {selectedBundle && (
          <div className="space-y-6 pt-2">
            {/* Header info card */}
            <div className="flex items-center gap-5 p-5 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                {selectedBundle.imageUrl ? (
                  <img
                    src={normalizeImageUrl(selectedBundle.imageUrl)}
                    alt={selectedBundle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-10 h-10 text-stone-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-stone-900 text-xl truncate">
                    {selectedBundle.name}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                    Active Bundle
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {selectedBundle.description || "No promotional description provided."}
                </p>
              </div>
              <div className="text-right shrink-0 bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Package Price
                </span>
                {selectedBundle.discountPrice && selectedBundle.discountPrice < selectedBundle.price && selectedBundle.discountPrice > 0 ? (
                  <>
                    <span className="text-xs text-stone-400 line-through block">
                      {formatPrice(selectedBundle.price)}
                    </span>
                    <span className="text-xl font-black text-emerald-600">
                      {formatPrice(selectedBundle.discountPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-black text-stone-900">
                    {formatPrice(selectedBundle.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Included Products List */}
            <div className="space-y-3">
              <h5 className="font-extrabold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" /> Included Supplements Breakdown (
                {getBundleProductsCount(selectedBundle)})
              </h5>

              {resolveBundleProducts(selectedBundle).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {resolveBundleProducts(selectedBundle).map((prod, idx) => (
                    <div
                      key={prod.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.mainImageUrl ? (
                            <img
                              src={normalizeImageUrl(prod.mainImageUrl)}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-stone-900 text-xs truncate">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">
                            ID: #{prod.id}
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-stone-800 text-xs shrink-0 pl-2">
                        {prod.price > 0 ? formatPrice(prod.price) : "Included"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-stone-50 border border-dashed border-stone-200 text-stone-400 text-xs font-medium">
                  No detailed product items recorded for this bundle.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedBundle(null)}
                className="rounded-xl font-bold px-6"
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
}
