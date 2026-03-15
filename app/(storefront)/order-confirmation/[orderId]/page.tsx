import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shippingMethod: true,
      paymentMethod: true,
    },
  });

  if (!order) notFound();

  const address = order.shippingAddress as {
    street: string;
    city: string;
    zip: string;
    country: string;
  };

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-secondary/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        {/* Success header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ backgroundColor: "var(--brand-light)" }}
          >
            <CheckCircle2 className="size-10 text-brand" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you, {order.customerName}. We&apos;ll process your order shortly.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-brand" />
              <span className="font-medium text-sm">Order #{order.orderNumber.slice(-8).toUpperCase()}</span>
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
          </div>

          {/* Items */}
          <div className="px-6 py-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.productImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-secondary"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(Number(item.total), "CZK")}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-6 py-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(Number(order.subtotal), "CZK")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Shipping ({order.shippingMethod?.name ?? "—"})
              </span>
              <span>
                {Number(order.shippingCost) === 0
                  ? "Free"
                  : formatPrice(Number(order.shippingCost), "CZK")}
              </span>
            </div>
            {Number(order.paymentExtraCharge) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment fee</span>
                <span>{formatPrice(Number(order.paymentExtraCharge), "CZK")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-border pt-3">
              <span>Total</span>
              <span>{formatPrice(Number(order.total), "CZK")}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="px-6 py-4 border-t border-border bg-secondary/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground/70 mb-1">Delivery Address</p>
                {order.packetaPointName ? (
                  <p className="text-foreground">
                    {order.packetaPointName}
                    <br />
                    {order.packetaPointAddress}
                  </p>
                ) : (
                  <p className="text-foreground">
                    {address.street}<br />
                    {address.zip} {address.city}
                  </p>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground/70 mb-1">Payment</p>
                <p className="text-foreground">{order.paymentMethod?.name ?? "—"}</p>
                {order.paymentMethod?.instructions && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {order.paymentMethod.instructions}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to{" "}
            <strong className="text-foreground">{order.customerEmail}</strong>
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-secondary transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
