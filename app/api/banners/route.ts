import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const banner = await prisma.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle || null,
      ctaText: body.ctaText || null,
      ctaUrl: body.ctaUrl || null,
      imageUrl: body.imageUrl,
      imageAlt: body.imageAlt || "",
      isActive: body.isActive ?? false,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(banner, { status: 201 });
}
