"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BannerForm } from "@/components/admin/BannerForm";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  imageUrl: string;
  imageAlt: string;
  isActive: boolean;
  sortOrder: number;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const fetchBanners = async () => {
    const res = await fetch("/api/banners");
    const data = await res.json();
    setBanners(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const toggleActive = async (banner: Banner) => {
    await fetch(`/api/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    fetchBanners();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingBanner(null);
    fetchBanners();
  };

  if (showForm || editingBanner) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setShowForm(false); setEditingBanner(null); }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-heading text-2xl font-bold">
            {editingBanner ? "Edit Banner" : "New Banner"}
          </h1>
        </div>
        <BannerForm
          banner={editingBanner ?? undefined}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditingBanner(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Banners</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage hero banners with AI copy generation</p>
        </div>
        <Button onClick={() => setShowForm(true)} style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
          <Plus className="size-4" /> New Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <p className="font-heading text-xl text-foreground/50 mb-2">No banners yet</p>
          <p className="text-muted-foreground text-sm mb-6">Create your first hero banner</p>
          <Button onClick={() => setShowForm(true)} style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
            <Plus className="size-4" /> Create Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl shadow-sm flex items-center gap-4 px-5 py-4"
            >
              <GripVertical className="size-4 text-muted-foreground/40 cursor-grab flex-shrink-0" />

              {/* Thumbnail */}
              <div className="w-16 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{banner.title}</p>
                {banner.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>
                )}
              </div>

              {/* CTA info */}
              {banner.ctaText && (
                <span className="hidden md:block text-xs text-muted-foreground px-2.5 py-1 bg-secondary rounded-full">
                  CTA: {banner.ctaText}
                </span>
              )}

              {/* Active toggle */}
              <button
                onClick={() => toggleActive(banner)}
                className={`transition-colors ${banner.isActive ? "text-brand" : "text-muted-foreground/40"}`}
                title={banner.isActive ? "Active" : "Inactive"}
              >
                {banner.isActive ? (
                  <ToggleRight className="size-6" />
                ) : (
                  <ToggleLeft className="size-6" />
                )}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingBanner(banner)}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-brand-light rounded-lg flex items-center gap-2 text-sm text-brand">
        <Sparkles className="size-4 flex-shrink-0" />
        AI copy generation is available when creating or editing banners
      </div>
    </div>
  );
}
