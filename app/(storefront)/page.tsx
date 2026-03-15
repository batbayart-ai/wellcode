import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BlogCard } from "@/components/storefront/BlogCard";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";

async function getHomeData() {
  const [banners, products, posts] = await Promise.all([
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
    }),
  ]);
  return { banners, products, posts };
}

const perks = [
  { icon: Sparkles, title: "Premium Ingredients", desc: "Sourced from the finest natural origins" },
  { icon: Shield, title: "Dermatologist Tested", desc: "Safe for all skin types" },
  { icon: Truck, title: "Fast Delivery", desc: "Packeta & DPD nationwide" },
];

export default async function HomePage() {
  const { banners, products, posts } = await getHomeData();

  return (
    <>
      {/* Hero */}
      <HeroBanner banners={banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        ctaText: b.ctaText,
        ctaUrl: b.ctaUrl,
        imageUrl: b.imageUrl,
        imageAlt: b.imageAlt,
      }))} />

      {/* Perks strip */}
      <section className="bg-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 text-white">
                <div className="p-2.5 rounded-full" style={{ backgroundColor: "var(--brand)" }}>
                  <Icon className="size-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-white/50 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
                Curated Collection
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Featured Products
              </h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors group">
              View All <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={Number(p.price)}
                comparePrice={p.comparePrice ? Number(p.comparePrice) : null}
                imageUrl={p.images[0]?.url}
                isFeatured={p.isFeatured}
                stockQty={p.stockQty}
              />
            ))}
          </div>
        </section>
      )}

      {/* Brand CTA */}
      <section
        className="py-24 px-4 text-center"
        style={{ background: "linear-gradient(135deg, oklch(0.94 0.022 14) 0%, oklch(0.99 0.004 60) 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: "var(--brand)" }}>
            For Every Skin Type
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Beauty That Feels As Good As It Looks
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Discover our full range of premium skincare, makeup, and wellness products crafted with care.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-base transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: "var(--brand)" }}
          >
            Shop the Collection <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Blog Posts */}
      {posts.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
                Beauty Journal
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                From the Blog
              </h2>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors group">
              Read All <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                coverImageUrl={post.coverImageUrl}
                publishedAt={post.publishedAt}
                readingTime={post.readingTime}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
