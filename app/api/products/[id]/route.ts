import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, categories: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Update images: delete existing, recreate
  await prisma.productImage.deleteMany({ where: { productId: id } });

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      comparePrice: body.comparePrice || null,
      stockQty: body.stockQty ?? 0,
      sku: body.sku || null,
      isActive: body.isActive ?? true,
      isFeatured: body.isFeatured ?? false,
      tags: body.tags ?? [],
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      seoKeywords: body.seoKeywords ?? [],
      categories: {
        set: (body.categoryIds ?? []).map((cid: string) => ({ id: cid })),
      },
      images: {
        create: (body.images ?? []).map(
          (img: { url: string; altText: string; sortOrder: number }) => ({
            url: img.url,
            altText: img.altText ?? "",
            sortOrder: img.sortOrder ?? 0,
          })
        ),
      },
    },
  });

  return NextResponse.json({ ...product, price: Number(product.price) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
