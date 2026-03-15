"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./ImageUploader";
import { Sparkles, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface BannerFormProps {
  banner?: {
    id: string;
    title: string;
    subtitle: string | null;
    ctaText: string | null;
    ctaUrl: string | null;
    imageUrl: string;
    imageAlt: string;
    isActive: boolean;
    sortOrder: number;
  };
  onSaved: () => void;
  onCancel: () => void;
}

export function BannerForm({ banner, onSaved, onCancel }: BannerFormProps) {
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContext, setAiContext] = useState({ theme: "", season: "", promotion: "" });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      ctaText: banner?.ctaText ?? "",
      ctaUrl: banner?.ctaUrl ?? "",
      imageAlt: banner?.imageAlt ?? "",
      sortOrder: banner?.sortOrder ?? 0,
      isActive: banner?.isActive ?? false,
    },
  });

  const generateCopy = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/banner-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiContext),
      });
      const data = await res.json();
      if (data.title) setValue("title", data.title);
      if (data.subtitle) setValue("subtitle", data.subtitle);
      if (data.ctaText) setValue("ctaText", data.ctaText);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!imageUrl) {
      alert("Please upload a banner image.");
      return;
    }
    const url = banner
      ? `/api/banners/${banner.id}`
      : "/api/banners";
    const method = banner ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, imageUrl }),
    });

    if (res.ok) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* AI Generator */}
      <div className="bg-brand-light rounded-xl p-5 border border-brand/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-4 text-brand" />
          <h3 className="font-medium text-sm text-brand">AI Copy Generator</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="space-y-1">
            <Label className="text-xs">Theme</Label>
            <Input
              placeholder="summer skincare"
              value={aiContext.theme}
              onChange={(e) => setAiContext((p) => ({ ...p, theme: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Season / Occasion</Label>
            <Input
              placeholder="Spring 2025"
              value={aiContext.season}
              onChange={(e) => setAiContext((p) => ({ ...p, season: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Promotion</Label>
            <Input
              placeholder="20% off sale"
              value={aiContext.promotion}
              onChange={(e) => setAiContext((p) => ({ ...p, promotion: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={generateCopy}
          disabled={isGenerating}
          className="gap-2"
          style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {isGenerating ? (
            <><Loader2 className="size-3.5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="size-3.5" /> Generate Copy</>
          )}
        </Button>
      </div>

      {/* Image */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">Banner Image</h3>
        <ImageUploader
          value={imageUrl}
          onChange={setImageUrl}
          folder="banners"
          aspectRatio="16/9"
        />
        <div className="space-y-1.5">
          <Label htmlFor="imageAlt">Image Alt Text</Label>
          <Input id="imageAlt" {...register("imageAlt")} placeholder="Describe the image for SEO" />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-sm">Content</h3>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" {...register("title")} error={errors.title?.message} placeholder="Discover Your Glow" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" {...register("subtitle")} placeholder="Premium skincare for radiant skin" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ctaText">CTA Button Text</Label>
            <Input id="ctaText" {...register("ctaText")} placeholder="Shop Now" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctaUrl">CTA Button URL</Label>
            <Input id="ctaUrl" {...register("ctaUrl")} placeholder="/products" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input id="sortOrder" type="number" {...register("sortOrder")} />
          </div>
          <div className="flex items-center gap-3 pt-7">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="w-4 h-4 accent-brand"
            />
            <Label htmlFor="isActive">Active (visible on site)</Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {isSubmitting ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
