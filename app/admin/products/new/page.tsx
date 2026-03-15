import { prisma } from "@/lib/prisma";
import { ProductFormWrapper } from "@/components/admin/ProductFormWrapper";

export const metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { type: "PRODUCT" },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Products
        </a>
        <h1 className="font-heading text-2xl font-bold mt-2">New Product</h1>
      </div>
      <ProductFormWrapper categories={categories} />
    </div>
  );
}
