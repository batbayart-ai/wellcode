"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  imageUrl?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  stockQty: number;
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  comparePrice,
  imageUrl,
  isNew,
  isFeatured,
  stockQty,
}: ProductCardProps) {
  const { addItem } = useCart();
  const discount =
    comparePrice && comparePrice > price
      ? Math.round((1 - price / comparePrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id,
      slug,
      name,
      price,
      imageUrl: imageUrl || "",
      stockQty,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link href={`/products/${slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary mb-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <ShoppingBag className="size-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <span className="bg-brand text-brand-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {isNew && !discount && (
              <span className="bg-foreground text-background text-xs font-semibold px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-foreground/40 hover:text-brand transition-all opacity-0 group-hover:opacity-100">
            <Heart className="size-4" />
          </button>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={stockQty === 0}
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
                stockQty > 0
                  ? "bg-foreground text-background hover:bg-foreground/80"
                  : "bg-foreground/20 text-foreground/40 cursor-not-allowed"
              )}
            >
              {stockQty > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {isFeatured ? "Featured" : ""}
          </p>
          <h3 className="font-medium text-sm text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-snug">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-foreground">
              {formatPrice(price, "CZK")}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(comparePrice, "CZK")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
