"use client";

import { useCart } from "@/store/cart";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCart();

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-brand" />
                <h2 className="font-heading text-lg font-semibold">
                  Shopping Cart
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-accent text-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="size-16 text-muted-foreground/30" />
                  <div>
                    <p className="font-heading text-lg font-medium text-foreground/60">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Discover our beautiful products
                    </p>
                  </div>
                  <Button
                    onClick={closeCart}
                    variant="outline"
                    className="mt-2"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-4"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                              <ShoppingBag className="size-8" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="font-medium text-sm hover:text-brand transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-brand font-semibold text-sm mt-0.5">
                            {formatPrice(item.price, "CZK")}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 rounded-md hover:bg-accent text-foreground/50 hover:text-foreground transition-colors"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stockQty}
                              className="p-1 rounded-md hover:bg-accent text-foreground/50 hover:text-foreground transition-colors disabled:opacity-30"
                            >
                              <Plus className="size-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-auto p-1 rounded-md hover:bg-destructive/10 text-foreground/30 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(subtotal(), "CZK")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping & taxes calculated at checkout
                </p>
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full h-12 text-base" style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
                    Proceed to Checkout
                  </Button>
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
