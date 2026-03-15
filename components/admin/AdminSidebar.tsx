"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ImageIcon,
  Package,
  BookOpen,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-border flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="block">
          <span className="text-xl font-heading font-bold" style={{ color: "var(--brand)" }}>
            Wellcode
          </span>
          <span className="text-xl font-heading font-light text-foreground/40"> Beauty</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-brand-light text-brand"
                  : "text-foreground/60 hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon
                className={cn(
                  "size-4 flex-shrink-0",
                  active ? "text-brand" : "text-foreground/40 group-hover:text-foreground/60"
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="size-3.5 text-brand" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-all w-full"
        >
          <LogOut className="size-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
