import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      items: true,
      shippingMethod: true,
      paymentMethod: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      total: Number(o.total),
    }))
  );
}
