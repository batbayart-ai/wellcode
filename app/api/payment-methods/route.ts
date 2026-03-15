import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(
    methods.map((m) => ({ ...m, extraCharge: Number(m.extraCharge) }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const method = await prisma.paymentMethod.create({
    data: {
      name: body.name,
      description: body.description || null,
      type: body.type,
      extraCharge: body.extraCharge ?? 0,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
      instructions: body.instructions || null,
    },
  });
  return NextResponse.json(
    { ...method, extraCharge: Number(method.extraCharge) },
    { status: 201 }
  );
}
