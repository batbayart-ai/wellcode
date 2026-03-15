"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "./ProductForm";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormWrapperProps {
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
}

export function ProductFormWrapper({ product, categories }: ProductFormWrapperProps) {
  const router = useRouter();

  return (
    <ProductForm
      product={product}
      categories={categories}
      onSaved={() => router.push("/admin/products")}
      onCancel={() => router.push("/admin/products")}
    />
  );
}
