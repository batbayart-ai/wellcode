import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  imageUrl: z.string().optional(),
});

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string(),
    country: z.string().default("CZ"),
  }),
  shippingMethodId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  packetaPointId: z.string().optional(),
  packetaPointName: z.string().optional(),
  packetaPointAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data = parsed.data;

  // Validate items and get current prices from DB
  const productIds = data.items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (dbProducts.length !== productIds.length) {
    return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
  }

  // Validate stock
  for (const item of data.items) {
    const product = dbProducts.find((p) => p.id === item.productId);
    if (!product || product.stockQty < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product?.name ?? item.name}` },
        { status: 400 }
      );
    }
  }

  // Get shipping & payment methods
  const [shippingMethod, paymentMethod] = await Promise.all([
    data.shippingMethodId
      ? prisma.shippingMethod.findUnique({ where: { id: data.shippingMethodId } })
      : null,
    data.paymentMethodId
      ? prisma.paymentMethod.findUnique({ where: { id: data.paymentMethodId } })
      : null,
  ]);

  // Calculate totals using DB prices (not client-provided prices)
  const subtotal = data.items.reduce((sum, item) => {
    const product = dbProducts.find((p) => p.id === item.productId)!;
    return sum + Number(product.price) * item.quantity;
  }, 0);

  const shippingCost = shippingMethod ? Number(shippingMethod.price) : 0;
  const paymentExtra = paymentMethod ? Number(paymentMethod.extraCharge) : 0;
  const total = subtotal + shippingCost + paymentExtra;

  // Create the order
  const order = await prisma.order.create({
    data: {
      customerName: data.customer.name,
      customerEmail: data.customer.email,
      customerPhone: data.customer.phone || null,
      shippingAddress: data.shippingAddress,
      subtotal,
      shippingCost,
      paymentExtraCharge: paymentExtra,
      total,
      currency: "czk",
      notes: data.notes || null,
      shippingMethodId: shippingMethod?.id || null,
      paymentMethodId: paymentMethod?.id || null,
      packetaPointId: data.packetaPointId || null,
      packetaPointName: data.packetaPointName || null,
      packetaPointAddress: data.packetaPointAddress || null,
      status: paymentMethod?.type === "STRIPE" ? "AWAITING_PAYMENT" : "PENDING",
      items: {
        create: data.items.map((item) => {
          const product = dbProducts.find((p) => p.id === item.productId)!;
          const unitPrice = Number(product.price);
          return {
            productId: item.productId,
            productName: product.name,
            productImage: item.imageUrl || null,
            quantity: item.quantity,
            unitPrice,
            total: unitPrice * item.quantity,
          };
        }),
      },
    },
  });

  // If Stripe payment, create Stripe checkout session
  if (paymentMethod?.type === "STRIPE") {
    const lineItems = data.items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      return {
        price_data: {
          currency: "czk",
          product_data: {
            name: product.name,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add shipping as a line item if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "czk",
          product_data: { name: `Shipping: ${shippingMethod?.name}`, images: [] },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: data.customer.email,
      metadata: { orderId: order.id },
      success_url: `${baseUrl}/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    // Decrement stock
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }

    return NextResponse.json({ stripeUrl: session.url, orderId: order.id });
  }

  // Manual payment: decrement stock and return orderId
  for (const item of data.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stockQty: { decrement: item.quantity } },
    });
  }

  return NextResponse.json({ orderId: order.id });
}
