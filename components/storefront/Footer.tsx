import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

const footerLinks = {
  shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?category=skincare", label: "Skincare" },
    { href: "/products?category=makeup", label: "Makeup" },
    { href: "/products?featured=true", label: "Featured" },
  ],
  info: [
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/shipping", label: "Shipping Info" },
    { href: "/returns", label: "Returns" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-foreground/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-heading font-bold text-brand">
                Wellcode
              </span>
              <br />
              <span className="text-sm font-light text-white/40 tracking-widest uppercase">
                Beauty
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Premium beauty & skincare — crafted for your glow.
            </p>
            <div className="flex gap-3">
              {[
                { href: "#", Icon: Instagram },
                { href: "#", Icon: Facebook },
                { href: "#", Icon: Youtube },
              ].map(({ href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="p-2 rounded-full bg-white/5 hover:bg-brand/20 text-white/40 hover:text-brand transition-all"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wider uppercase text-xs">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wider uppercase text-xs">
              Info
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wider uppercase text-xs">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Wellcode Beauty. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Secure payments via Stripe · Delivery by Packeta & DPD
          </p>
        </div>
      </div>
    </footer>
  );
}
