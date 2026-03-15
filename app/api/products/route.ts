import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const isAdmin = searchParams.get("admin") === "1";

  const products = await prisma.product.findMany({
    where: {
      ...(isAdmin ? {} : { isActive: true }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      categories: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const product = await prisma.product.create({
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
        connect: (body.categoryIds ?? []).map((id: string) => ({ id })),
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

  return NextResponse.json(product, { status: 201 });
}
