import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/storefront/ProductDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || undefined,
    keywords: product.seoKeywords,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: true,
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      categories: {
        some: { id: { in: product.categories.map((c) => c.id) } },
      },
    },
    take: 4,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div className="pt-20 lg:pt-24">
      <ProductDetail product={product} related={related} />
    </div>
  );
}
