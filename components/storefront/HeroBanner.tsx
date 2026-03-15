"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  imageUrl: string;
  imageAlt: string;
}

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, banners.length]);

  if (!banners.length) {
    return (
      <section className="relative h-[80vh] min-h-[500px] bg-secondary flex items-center justify-center">
        <div className="text-center max-w-xl px-4">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-4 leading-tight">
            Discover Your Glow
          </h1>
          <p className="text-foreground/60 text-lg mb-8">
            Premium beauty & skincare crafted for radiant skin
          </p>
          <Link href="/products">
            <Button size="lg" style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }} className="px-8 h-12 text-base">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  const banner = banners[current];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={banner.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          {/* Image */}
          <Image
            src={banner.imageUrl}
            alt={banner.imageAlt || banner.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-lg"
              >
                <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                {banner.ctaText && banner.ctaUrl && (
                  <Link href={banner.ctaUrl}>
                    <Button
                      size="lg"
                      className="px-8 h-12 text-base font-medium tracking-wide"
                      style={{
                        backgroundColor: "var(--brand)",
                        color: "var(--brand-foreground)",
                      }}
                    >
                      {banner.ctaText}
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
            aria-label="Next banner"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
