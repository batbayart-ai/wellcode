import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SlidersHorizontal } from "lucide-react";

interface SearchParams {
  category?: string;
  sort?: string;
  featured?: string;
}

export const metadata = {
  title: "Shop All Products",
  description: "Browse our complete collection of premium beauty & skincare products.",
};

async function getProducts(params: SearchParams) {
  const { category, sort, featured } = params;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { type: "PRODUCT" }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(featured === "true" ? { isFeatured: true } : {}),
        ...(category
          ? { categories: { some: { slug: category } } }
          : {}),
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy:
        sort === "price_asc"
          ? { price: "asc" }
          : sort === "price_desc"
          ? { price: "desc" }
          : sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" },
    }),
  ]);
  return { categories, products };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { categories, products } = await getProducts(params);

  return (
    <div className="pt-20 lg:pt-24">
      {/* Page header */}
      <div className="bg-secondary py-14 px-4 text-center">
        <p
          className="text-sm font-medium uppercase tracking-widest mb-2"
          style={{ color: "var(--brand)" }}
        >
          Our Collection
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
          Shop All Products
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            <span className="font-medium text-foreground">Filter:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/products"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !params.category
                  ? "bg-foreground text-background"
                  : "bg-secondary hover:bg-accent text-foreground/60 hover:text-foreground"
              }`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  params.category === cat.slug
                    ? "bg-brand text-brand-foreground"
                    : "bg-secondary hover:bg-accent text-foreground/60 hover:text-foreground"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>

          <div className="sm:ml-auto">
            <select
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
              defaultValue={params.sort || "newest"}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("sort", e.target.value);
                window.location.href = url.toString();
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-heading text-2xl text-foreground/50 mb-2">No products found</p>
            <p className="text-muted-foreground text-sm">Try a different filter</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
