"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./ImageUploader";
import { SeoOptimizer } from "./SeoOptimizer";
import { Plus, X } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().optional(),
  stockQty: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice: number | null;
    stockQty: number;
    sku: string | null;
    isActive: boolean;
    isFeatured: boolean;
    images: { id: string; url: string; altText: string }[];
    categories: { id: string }[];
    tags: string[];
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string[];
  };
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, categories, onSaved, onCancel }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.categories.map((c) => c.id) ?? []
  );
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [seo, setSeo] = useState({
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
    seoKeywords: product?.seoKeywords ?? [],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price,
      comparePrice: product?.comparePrice ?? undefined,
      stockQty: product?.stockQty ?? 0,
      sku: product?.sku ?? "",
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
    },
  });

  const nameValue = watch("name");
  useEffect(() => {
    if (!product) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, product, setValue]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const onSubmit = async (data: FormData) => {
    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        images: images.map((url, i) => ({ url, altText: "", sortOrder: i })),
        categoryIds: selectedCategories,
        tags,
        ...seo,
      }),
    });

    if (res.ok) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Basic info */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-sm">Product Details</h3>
        <div className="space-y-1.5">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" {...register("name")} error={errors.name?.message} placeholder="Rose Glow Serum" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} placeholder="rose-glow-serum" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register("description")}
            error={errors.description?.message}
            rows={5}
            placeholder="Product description (HTML supported)..."
          />
        </div>
      </div>

      {/* Pricing & inventory */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-sm">Pricing & Inventory</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (CZK) *</Label>
            <Input id="price" type="number" step="0.01" {...register("price")} error={errors.price?.message} placeholder="599" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comparePrice">Compare Price (CZK)</Label>
            <Input id="comparePrice" type="number" step="0.01" {...register("comparePrice")} placeholder="799" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stockQty">Stock Quantity</Label>
            <Input id="stockQty" type="number" {...register("stockQty")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} placeholder="RGS-001" />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 accent-brand" />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isFeatured" {...register("isFeatured")} className="w-4 h-4 accent-brand" />
            <Label htmlFor="isFeatured">Featured on homepage</Label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-sm">Product Images</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <div className="aspect-square">
            <ImageUploader
              value=""
              onChange={(url) => setImages((prev) => [...prev, url])}
              folder="products"
              aspectRatio="1/1"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={(e) =>
                  setSelectedCategories((prev) =>
                    e.target.checked ? [...prev, cat.id] : prev.filter((id) => id !== cat.id)
                  )
                }
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">Tags</h3>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add a tag..."
          />
          <Button type="button" variant="outline" onClick={addTag}>
            <Plus className="size-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <SeoOptimizer
        type="product"
        context={{
          name: watch("name"),
          description: watch("description"),
          categories: categories
            .filter((c) => selectedCategories.includes(c.id))
            .map((c) => c.name),
          tags,
          price: watch("price"),
        }}
        values={seo}
        onChange={setSeo}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
