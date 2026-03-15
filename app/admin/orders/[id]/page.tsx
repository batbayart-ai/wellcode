import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
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
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Orders
          </Link>
          <h1 className="font-heading text-2xl font-bold mt-2">
            Order #{order.orderNumber.slice(-8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-sm">Order Items</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">× {item.quantity} · {formatPrice(Number(item.unitPrice), "CZK")} each</p>
                  </div>
                  <p className="font-semibold text-sm">{formatPrice(Number(item.total), "CZK")}</p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 border-t border-border space-y-2 bg-secondary/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal), "CZK")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping ({order.shippingMethod?.name ?? "—"})</span>
                <span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost), "CZK")}</span>
              </div>
              {Number(order.paymentExtraCharge) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment fee</span>
                  <span>{formatPrice(Number(order.paymentExtraCharge), "CZK")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-border pt-2 mt-1">
                <span>Total</span>
                <span>{formatPrice(Number(order.total), "CZK")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-sm mb-3">Customer</h2>
            <p className="font-medium text-sm">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-sm text-muted-foreground">{order.customerPhone}</p>}
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-sm mb-3">Delivery</h2>
            <p className="text-sm font-medium mb-1">{order.shippingMethod?.name ?? "—"}</p>
            {order.packetaPointName ? (
              <div>
                <p className="text-sm">{order.packetaPointName}</p>
                <p className="text-xs text-muted-foreground">{order.packetaPointAddress}</p>
              </div>
            ) : (
              <div className="text-sm text-foreground/70">
                <p>{address.street}</p>
                <p>{address.zip} {address.city}</p>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-sm mb-3">Payment</h2>
            <p className="text-sm font-medium">{order.paymentMethod?.name ?? "—"}</p>
            {order.stripePaymentIntentId && (
              <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                {order.stripePaymentIntentId}
              </p>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-sm mb-2">Notes</h2>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
