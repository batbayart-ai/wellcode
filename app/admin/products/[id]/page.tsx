import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductFormWrapper } from "@/components/admin/ProductFormWrapper";

export const metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        categories: true,
      },
    }),
    prisma.category.findMany({ where: { type: "PRODUCT" }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const productData = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Products
        </a>
        <h1 className="font-heading text-2xl font-bold mt-2">Edit Product</h1>
      </div>
      <ProductFormWrapper product={productData} categories={categories} />
    </div>
  );
}
