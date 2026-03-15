import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const banner = await prisma.banner.update({
    where: { id },
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
  return NextResponse.json(banner);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
