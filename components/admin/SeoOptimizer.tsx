"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SeoOptimizerProps {
  type: "product" | "blog";
  context: Record<string, unknown>;
  values: { seoTitle: string; seoDescription: string; seoKeywords: string[] };
  onChange: (values: { seoTitle: string; seoDescription: string; seoKeywords: string[] }) => void;
}

export function SeoOptimizer({ type, context, values, onChange }: SeoOptimizerProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context }),
      });
      const data = await res.json();
      onChange({
        seoTitle: data.seoTitle ?? values.seoTitle,
        seoDescription: data.seoDescription ?? values.seoDescription,
        seoKeywords: data.seoKeywords ?? values.seoKeywords,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-brand" />
          <h3 className="font-semibold text-sm">SEO Optimizer</h3>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={generate}
          disabled={isGenerating}
          className="gap-1.5 h-7 text-xs"
          style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {isGenerating ? (
            <><Loader2 className="size-3 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="size-3" /> Auto-generate with AI</>
          )}
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          SEO Title{" "}
          <span className={values.seoTitle.length > 60 ? "text-destructive" : "text-muted-foreground"}>
            ({values.seoTitle.length}/60)
          </span>
        </Label>
        <Input
          value={values.seoTitle}
          onChange={(e) => onChange({ ...values, seoTitle: e.target.value })}
          placeholder="SEO optimized page title..."
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          Meta Description{" "}
          <span className={values.seoDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}>
            ({values.seoDescription.length}/160)
          </span>
        </Label>
        <Textarea
          value={values.seoDescription}
          onChange={(e) => onChange({ ...values, seoDescription: e.target.value })}
          placeholder="Compelling meta description..."
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Keywords (comma-separated)</Label>
        <Input
          value={values.seoKeywords.join(", ")}
          onChange={(e) =>
            onChange({
              ...values,
              seoKeywords: e.target.value
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            })
          }
          placeholder="skincare, moisturizer, anti-aging..."
          className="text-sm"
        />
        {values.seoKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {values.seoKeywords.map((kw) => (
              <span
                key={kw}
                className="text-xs px-2 py-0.5 rounded-full bg-brand-light text-brand"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
