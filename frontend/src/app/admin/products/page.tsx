"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Package,
  Search,
  Filter,
  Image as ImageIcon,
  MoreVertical,
  ShieldAlert,
  Hash,
  Shuffle,
  FileText,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Copy,
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
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Field, FieldError } from "@/src/components/ui/field";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  discountPrice: number;
  mainImageUrl: string | null;
  categoryName: string;
  categoryId?: number;
  brandName: string;
  brandId?: number;
  goal?: number;
  averageRating?: number;
  inStock: boolean;
  stockQuantity?: number;
}

interface CategoryOption {
  id: number | string;
  name: string;
}

interface BrandOption {
  id: number | string;
  name: string;
}

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(100, "Name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().min(0, "Discount price cannot be negative").optional(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Please select a category"),
  brandId: z.string().min(1, "Please select a brand"),
  mainImageUrl: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
  goal: z.number().int().min(1).max(10),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 12;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "duplicate">("add");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Action Dialogs
  const [activeActionModal, setActiveActionModal] = useState<
    null | { type: "serial" | "alt" | "dosage"; product: Product }
  >(null);
  const [serialInput, setSerialInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [selectedAltIds, setSelectedAltIds] = useState<number[]>([]);
  const [dosageInput, setDosageInput] = useState("");
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // ─── Form Setup ───────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: 0,
      stockQuantity: 10,
      categoryId: "",
      brandId: "",
      mainImageUrl: "",
      goal: 1,
    },
  });

  // ─── Fetch Data ───────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Products?pageNumber=${page}&pageSize=${PAGE_SIZE}`);
      const data = Array.isArray(res.data) ? res.data : res.data.products || [];
      setProducts(data);
      setPageNumber(page);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(
        err.response?.data?.Message ||
          err.response?.data?.message ||
          "Could not load product catalog from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, [PAGE_SIZE]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const catsRes = await api.get("/Categories").catch(() => ({ data: [] }));
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : catsRes.data.categories || []);
      setBrands([]);
    } catch {
      console.warn("Could not load dropdown metadata");
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
    fetchDropdowns();
  }, [fetchProducts, fetchDropdowns]);

  // ─── Open Edit / Duplicate Modals ─────────────────────────────────────────
  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setActiveProduct(product);
    reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      discountPrice: product.discountPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      brandId: product.brandId ? String(product.brandId) : "",
      mainImageUrl: product.mainImageUrl || "",
      goal: product.goal || 1,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenDuplicate = (product: Product) => {
    setModalMode("duplicate");
    setActiveProduct(product);
    reset({
      name: `${product.name} (Copy)`,
      description: product.description || "",
      price: product.price,
      discountPrice: product.discountPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      brandId: product.brandId ? String(product.brandId) : "",
      mainImageUrl: product.mainImageUrl || "",
      goal: product.goal || 1,
    });
    setIsAddModalOpen(true);
  };

  // ─── Delete Handler ───────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleteLoading(true);
    try {
      await api.delete(`/Products/${deletingProduct.id}`);
      toast.success(`Product "${deletingProduct.name}" deleted successfully!`);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err: any) {
      console.error("Delete product failed:", err);
      const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to delete product.";
      toast.error(msg);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // ─── Create / Update Product Handler ──────────────────────────────────────
  const onSubmitProduct = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        price: values.price,
        discountPrice: values.discountPrice || 0,
        stockQuantity: values.stockQuantity,
        stock: values.stockQuantity,
        categoryId: Number(values.categoryId),
        brandId: Number(values.brandId),
        mainImageUrl: values.mainImageUrl?.trim() || null,
        goal: values.goal || 1,
      };

      if (modalMode === "edit" && activeProduct) {
        await api.put(`/Products/${activeProduct.id}`, payload);
        toast.success(`Product "${values.name}" updated successfully!`);
        const updatedCat = categories.find((c) => String(c.id) === values.categoryId)?.name || activeProduct.categoryName;
        const updatedBrand = brands.find((b) => String(b.id) === values.brandId)?.name || activeProduct.brandName;
        setProducts((prev) =>
          prev.map((p) =>
            p.id === activeProduct.id
              ? {
                  ...p,
                  ...payload,
                  categoryName: updatedCat,
                  brandName: updatedBrand,
                  inStock: values.stockQuantity > 0,
                }
              : p
          )
        );
      } else {
        await api.post("/Products", payload);
        toast.success(`Product "${values.name}" ${modalMode === "duplicate" ? "duplicated" : "created"} successfully!`);
        fetchProducts(1);
      }
      reset();
      setIsAddModalOpen(false);
      setActiveProduct(null);
    } catch (err: any) {
      console.error("Save product failed:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        `Failed to ${modalMode === "edit" ? "update" : "create"} product. Please verify fields.`;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Action Modals Submit ─────────────────────────────────────────────────
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionModal) return;
    setIsActionSubmitting(true);
    const { type, product } = activeActionModal;

    try {
      if (type === "serial") {
        const serials = serialInput
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        if (serials.length === 0) {
          toast.error("Please enter at least one serial number");
          setIsActionSubmitting(false);
          return;
        }
        await api.post(`/Products/${product.id}/serial-numbers`, { serialNumbers: serials });
        toast.success(`Added ${serials.length} serial numbers to ${product.name}`);
      } else if (type === "alt") {
        const altsFromText = altInput
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0);
        const combinedAlts = Array.from(new Set([...selectedAltIds, ...altsFromText]));
        if (combinedAlts.length === 0) {
          toast.error("Please select or enter at least one alternative product");
          setIsActionSubmitting(false);
          return;
        }
        await api.post(`/Products/${product.id}/alternatives`, { alternativeIds: combinedAlts });
        toast.success(`Linked alternatives to ${product.name}`);
      } else if (type === "dosage") {
        if (!dosageInput.trim()) {
          toast.error("Please provide dosage instructions");
          setIsActionSubmitting(false);
          return;
        }
        await api.post(`/Products/${product.id}/dosage-guide`, {
          instructions: dosageInput.trim(),
          recommendedDosage: "1 scoop daily",
        });
        toast.success(`Dosage guide added for ${product.name}`);
      }
      setActiveActionModal(null);
      setSerialInput("");
      setAltInput("");
      setSelectedAltIds([]);
      setDosageInput("");
    } catch (err: any) {
      console.error("Action submit error:", err);
      const msg =
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Failed to save product details to server.";
      toast.error(msg);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.categoryName === selectedCategory;
    const matchesBrand = selectedBrand === "All" || p.brandName === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const catNames = ["All", ...Array.from(new Set(products.map((p) => p.categoryName || "Uncategorized")))];
  const brandNames = ["All", ...Array.from(new Set(products.map((p) => p.brandName || "Generic")))];

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns: Column<Product>[] = [
    {
      header: "Image",
      cell: (p) => (
        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
          {p.mainImageUrl ? (
            <img
              src={normalizeImageUrl(p.mainImageUrl)}
              alt={p.name}
              className="w-full h-full object-contain p-1 mix-blend-multiply"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Package className="w-5 h-5 text-stone-300" />
          )}
        </div>
      ),
      className: "w-16",
    },
    {
      header: "Product Name",
      accessorKey: "name",
      cell: (p) => (
        <div className="max-w-xs">
          <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
          <p className="text-xs text-stone-400 font-mono mt-0.5">ID: #{p.id}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "categoryName",
      cell: (p) => (
        <Badge variant="stone" className="font-semibold text-xs px-2.5 py-0.5">
          {p.categoryName || "General"}
        </Badge>
      ),
    },
    {
      header: "Brand",
      accessorKey: "brandName",
      cell: (p) => <span className="font-bold text-stone-700 text-xs uppercase">{p.brandName || "—"}</span>,
    },
    {
      header: "Price",
      cell: (p) => {
        const hasDiscount = p.discountPrice > 0 && p.discountPrice < p.price;
        return (
          <div className="flex flex-col">
            <span className="font-black text-stone-900 text-sm">
              {formatPrice(hasDiscount ? p.discountPrice : p.price)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatPrice(p.price)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (p) => (
        <div className="flex items-center gap-1.5">
          {p.inStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> Out of Stock
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleOpenEdit(p)}
            title="Edit Product"
            className="rounded-lg text-stone-700 hover:text-amber-600 gap-1 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleOpenDuplicate(p)}
            title="Duplicate Product"
            className="rounded-lg text-stone-700 hover:text-blue-600 gap-1 font-semibold"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setSerialInput("");
              setActiveActionModal({ type: "serial", product: p });
            }}
            title="Add Serial Numbers"
            className="rounded-lg text-stone-700 hover:text-emerald-600 gap-1 font-semibold"
          >
            <Hash className="w-3.5 h-3.5" /> Serials
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setAltInput("");
              setSelectedAltIds([]);
              setActiveActionModal({ type: "alt", product: p });
            }}
            title="Link Alternatives"
            className="rounded-lg text-stone-700 hover:text-blue-600 gap-1 font-semibold"
          >
            <Shuffle className="w-3.5 h-3.5" /> Alts
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setDosageInput("");
              setActiveActionModal({ type: "dosage", product: p });
            }}
            title="Add Dosage Guide"
            className="rounded-lg text-stone-700 hover:text-purple-600 gap-1 font-semibold"
          >
            <FileText className="w-3.5 h-3.5" /> Dosage
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setDeletingProduct(p)}
            title="Delete Product"
            className="rounded-lg text-stone-700 hover:text-red-600 gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
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
        title="Products Catalog"
        subtitle="Manage inventory items, pricing, stock levels, and product serial numbers."
      >
        <Button
          onClick={() => {
            setModalMode("add");
            setActiveProduct(null);
            reset({
              name: "",
              description: "",
              price: 0,
              discountPrice: 0,
              stockQuantity: 10,
              categoryId: "",
              brandId: "",
              mainImageUrl: "",
              goal: 1,
            });
            setIsAddModalOpen(true);
          }}
          className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-900/10 h-11 px-6"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </PageHeader>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products by name or brand..."
            className="max-w-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {catNames.map((c) => (
                <option key={c} value={c}>
                  Cat: {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {brandNames.map((b) => (
                <option key={b} value={b}>
                  Brand: {b}
                </option>
              ))}
            </select>
          </div>

          <Badge variant="stone" className="h-10 px-3 rounded-xl font-bold text-xs flex items-center">
            {filteredProducts.length} items
          </Badge>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchProducts(pageNumber)} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            emptyMessage={
              searchQuery || selectedCategory !== "All" || selectedBrand !== "All"
                ? "No products match the selected filters."
                : "No products in inventory. Click 'Add Product' to begin."
            }
          />
          <Pagination
            currentPage={pageNumber}
            onPageChange={(page) => fetchProducts(page)}
            hasMore={hasMore}
          />
        </div>
      )}

      {/* ─── Add/Edit/Duplicate Product Modal ─────────────────────────────── */}
      <FormDialog
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setActiveProduct(null);
        }}
        title={
          modalMode === "edit"
            ? `Edit Product — ${activeProduct?.name || ""}`
            : modalMode === "duplicate"
            ? `Duplicate Product — ${activeProduct?.name || ""}`
            : "Add New Product"
        }
        description={
          modalMode === "edit"
            ? "Update product details, pricing, and associate with category & brand."
            : modalMode === "duplicate"
            ? "Create a copy of this product with adjusted attributes or pricing."
            : "Fill in product details, pricing, and associate with category & brand."
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2">
              <Label htmlFor="prod-name" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prod-name"
                {...register("name")}
                placeholder="e.g. Gold Standard 100% Whey Protein"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.name ? [{ message: errors.name.message }] : undefined} />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="prod-desc" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Description
              </Label>
              <textarea
                id="prod-desc"
                {...register("description")}
                rows={3}
                placeholder="Detailed nutritional highlights, ingredients, and usage notes..."
                className="mt-1.5 w-full p-3 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <FieldError errors={errors.description ? [{ message: errors.description.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-price" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Price (EGP) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.price ? [{ message: errors.price.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-discount" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Discount Price (EGP)
              </Label>
              <Input
                id="prod-discount"
                type="number"
                step="0.01"
                {...register("discountPrice", { valueAsNumber: true })}
                placeholder="0.00 (Optional)"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.discountPrice ? [{ message: errors.discountPrice.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-stock" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Initial Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prod-stock"
                type="number"
                {...register("stockQuantity", { valueAsNumber: true })}
                placeholder="10"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.stockQuantity ? [{ message: errors.stockQuantity.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-goal" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Target Fitness Goal ID
              </Label>
              <Input
                id="prod-goal"
                type="number"
                {...register("goal", { valueAsNumber: true })}
                placeholder="1"
                className="mt-1.5 h-11 rounded-xl"
              />
              <FieldError errors={errors.goal ? [{ message: errors.goal.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-cat" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="prod-cat"
                {...register("categoryId")}
                className="mt-1.5 w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.categoryId ? [{ message: errors.categoryId.message }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="prod-brand" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Brand <span className="text-red-500">*</span>
              </Label>
              <select
                id="prod-brand"
                {...register("brandId")}
                className="mt-1.5 w-full h-11 px-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select Brand...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.brandId ? [{ message: errors.brandId.message }] : undefined} />
            </Field>

            <Field className="md:col-span-2">
              <Label htmlFor="prod-img" className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Main Image URL
              </Label>
              <div className="relative mt-1.5">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  id="prod-img"
                  {...register("mainImageUrl")}
                  placeholder="https://example.com/product-image.jpg"
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <FieldError errors={errors.mainImageUrl ? [{ message: errors.mainImageUrl.message }] : undefined} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setActiveProduct(null);
              }}
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
              {modalMode === "edit"
                ? "Save Changes"
                : modalMode === "duplicate"
                ? "Duplicate Product"
                : "Create Product"}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* ─── Action Modal (Serials / Alts / Dosage) ─────────────────────── */}
      <FormDialog
        isOpen={!!activeActionModal}
        onClose={() => setActiveActionModal(null)}
        title={
          activeActionModal?.type === "serial"
            ? `Add Serial Numbers — ${activeActionModal.product.name}`
            : activeActionModal?.type === "alt"
            ? `Link Alternatives — ${activeActionModal.product.name}`
            : `Dosage Guide — ${activeActionModal?.product.name || ""}`
        }
        description={
          activeActionModal?.type === "serial"
            ? "Enter product verification serial numbers, one per line."
            : activeActionModal?.type === "alt"
            ? "Enter comma-separated product IDs to suggest as alternatives."
            : "Provide recommended usage and timing instructions for customers."
        }
        maxWidth="md"
      >
        <form onSubmit={handleActionSubmit} className="space-y-5">
          {activeActionModal?.type === "serial" && (
            <div>
              <Label className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Serial Numbers (One per line)
              </Label>
              <textarea
                rows={6}
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                placeholder="SN-9823410293\nSN-1029384102\nSN-4910239481"
                className="mt-2 w-full p-3 font-mono text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          )}

          {activeActionModal?.type === "alt" && (
            <div className="space-y-4">
              <div>
                <Label className="text-stone-700 font-bold text-xs uppercase tracking-wider block mb-2">
                  Select Alternative Products from Catalog
                </Label>
                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl p-2 bg-stone-50 space-y-1.5">
                  {products
                    .filter((prod) => String(prod.id) !== String(activeActionModal.product.id))
                    .map((prod) => {
                      const prodId = Number(prod.id);
                      const isChecked = selectedAltIds.includes(prodId);
                      return (
                        <label
                          key={prod.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-colors ${
                            isChecked
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold"
                              : "bg-white border border-stone-100 hover:bg-stone-100 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAltIds((prev) => [...prev, prodId]);
                                } else {
                                  setSelectedAltIds((prev) => prev.filter((id) => id !== prodId));
                                }
                              }}
                              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span className="truncate">{prod.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0">#{prod.id}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div>
                <Label className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                  Or enter External / Additional IDs (Comma-separated)
                </Label>
                <Input
                  value={altInput}
                  onChange={(e) => setAltInput(e.target.value)}
                  placeholder="e.g. 102, 105, 110"
                  className="mt-1 h-11 rounded-xl font-mono text-sm"
                />
              </div>
            </div>
          )}

          {activeActionModal?.type === "dosage" && (
            <div>
              <Label className="text-stone-700 font-bold text-xs uppercase tracking-wider">
                Dosage & Usage Instructions
              </Label>
              <textarea
                rows={5}
                value={dosageInput}
                onChange={(e) => setDosageInput(e.target.value)}
                placeholder="Mix 1 rounded scoop with 6-8 fl. oz. of cold water or milk after your workout..."
                className="mt-2 w-full p-3 text-sm bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveActionModal(null)}
              disabled={isActionSubmitting}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isActionSubmitting}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 px-6"
            >
              Save Details
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* ─── Confirm Delete Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone and will remove the item from inventory.`}
        variant="destructive"
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
