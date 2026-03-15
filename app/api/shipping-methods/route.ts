import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(methods.map((m) => ({ ...m, price: Number(m.price) })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const method = await prisma.shippingMethod.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: body.price,
      carrier: body.carrier || null,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ ...method, price: Number(method.price) }, { status: 201 });
}
