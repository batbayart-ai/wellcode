import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const categories = await prisma.category.findMany({
    where: type ? { type: type as "PRODUCT" | "BLOG" } : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      type: body.type,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
