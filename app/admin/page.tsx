import { prisma } from "@/lib/prisma";
import {
  ShoppingCart,
  Package,
  BookOpen,
  ImageIcon,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";

async function getStats() {
  const [
    orderCount,
    pendingOrderCount,
    productCount,
    postCount,
    bannerCount,
    recentOrders,
    revenue,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "AWAITING_PAYMENT"] } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.blogPost.count({ where: { isPublished: true } }),
    prisma.banner.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  return {
    orderCount,
    pendingOrderCount,
    productCount,
    postCount,
    bannerCount,
    recentOrders,
    revenue: Number(revenue._sum.total ?? 0),
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.revenue, "CZK"),
      icon: TrendingUp,
      href: "/admin/orders",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Orders",
      value: stats.orderCount,
      sub: `${stats.pendingOrderCount} pending`,
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Products",
      value: stats.productCount,
      icon: Package,
      href: "/admin/products",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Blog Posts",
      value: stats.postCount,
      icon: BookOpen,
      href: "/admin/blog",
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Active Banners",
      value: stats.bannerCount,
      icon: ImageIcon,
      href: "/admin/banners",
      color: "bg-pink-50 text-pink-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back to Wellcode Beauty admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, sub, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="size-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Recent Orders</h2>
          </div>
          <Link href="/admin/orders" className="text-xs text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground text-sm">
              No orders yet
            </div>
          ) : (
            stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="px-6 py-3.5 flex items-center gap-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    #{order.orderNumber.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {formatDate(order.createdAt)}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    statusColors[order.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
                <span className="text-sm font-semibold">
                  {formatPrice(Number(order.total), "CZK")}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
