import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  AWAITING_PAYMENT: "warning",
  PAID: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "secondary",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter as never } : undefined,
    include: {
      items: true,
      shippingMethod: true,
      paymentMethod: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
  const total = orders.length;

  const filterOptions = [
    { value: "", label: "All", count: Object.values(counts).reduce((a, b) => a + b, 0) },
    { value: "PENDING", label: "Pending", count: counts.PENDING ?? 0 },
    { value: "AWAITING_PAYMENT", label: "Awaiting Payment", count: counts.AWAITING_PAYMENT ?? 0 },
    { value: "PAID", label: "Paid", count: counts.PAID ?? 0 },
    { value: "PROCESSING", label: "Processing", count: counts.PROCESSING ?? 0 },
    { value: "SHIPPED", label: "Shipped", count: counts.SHIPPED ?? 0 },
    { value: "DELIVERED", label: "Delivered", count: counts.DELIVERED ?? 0 },
    { value: "CANCELLED", label: "Cancelled", count: counts.CANCELLED ?? 0 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">{total} orders</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5 overflow-x-auto pb-1">
        {filterOptions.map((opt) => (
          <a
            key={opt.value}
            href={opt.value ? `/admin/orders?status=${opt.value}` : "/admin/orders"}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              (statusFilter ?? "") === opt.value
                ? "bg-foreground text-background"
                : "bg-white hover:bg-secondary text-foreground/60 border border-border"
            }`}
          >
            {opt.label} ({opt.count})
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-brand transition-colors">
                      <p className="font-medium">#{order.orderNumber.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[order.status] ?? "default"}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatPrice(Number(order.total), "CZK")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
