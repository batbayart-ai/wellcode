"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Minus, Check, ChevronRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import DOMPurify from "isomorphic-dompurify";

interface ProductImage {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: object;
  comparePrice: object | null;
  stockQty: number;
  sku: string | null;
  tags: string[];
  images: ProductImage[];
  categories: Category[];
}

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  price: object;
  comparePrice: object | null;
  stockQty: number;
  images: ProductImage[];
  isFeatured: boolean;
}

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: RelatedProduct[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round((1 - price / comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price,
        imageUrl: product.images[0]?.url || "",
        stockQty: product.stockQty,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const safeDescription = DOMPurify.sanitize(product.description);

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square overflow-hidden rounded-2xl bg-secondary"
            >
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].altText || product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <ShoppingBag className="size-20" />
                </div>
              )}
              {discount && (
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--brand)" }}
                >
                  -{discount}%
                </div>
              )}
            </motion.div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedImage ? "border-brand" : "border-transparent"
                    }`}
                  >
                    <Image src={img.url} alt={img.altText || ""} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {product.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="text-xs font-medium uppercase tracking-wider text-brand hover:underline"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(price, "CZK")}
              </span>
              {comparePrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(comparePrice, "CZK")}
                </span>
              )}
            </div>

            {product.sku && (
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  product.stockQty > 5
                    ? "bg-emerald-500"
                    : product.stockQty > 0
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {product.stockQty > 5
                  ? "In stock"
                  : product.stockQty > 0
                  ? `Only ${product.stockQty} left`
                  : "Out of stock"}
              </span>
            </div>

            {/* Quantity + Add to cart */}
            {product.stockQty > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground/70">Quantity</span>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium w-12 text-center border-x border-border">
                      {qty}
                    </span>
                    <button
                      onClick={() =>
                        setQty((q) => Math.min(q + 1, product.stockQty))
                      }
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full h-13 text-base font-medium gap-2"
                  style={{
                    backgroundColor: added ? "var(--brand)" : "var(--foreground)",
                    color: "var(--background)",
                  }}
                >
                  {added ? (
                    <>
                      <Check className="size-5" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-5" /> Add to Cart
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 max-w-3xl">
          <h2 className="font-heading text-2xl font-semibold mb-6">Product Description</h2>
          <div
            className="prose prose-sm max-w-none text-foreground/70 leading-relaxed [&_h2]:font-heading [&_h3]:font-heading"
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-heading text-2xl font-semibold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
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
          </div>
        )}
      </div>
    </>
  );
}
