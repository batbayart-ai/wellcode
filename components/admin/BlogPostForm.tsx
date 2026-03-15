"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./ImageUploader";
import { SeoOptimizer } from "./SeoOptimizer";
import { BlogEditor } from "./BlogEditor";
import { calculateReadingTime } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  coverImageAlt: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPostFormProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImageUrl: string | null;
    coverImageAlt: string;
    isPublished: boolean;
    categories: { id: string }[];
    tags: string[];
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string[];
  };
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}

export function BlogPostForm({ post, categories, onSaved, onCancel }: BlogPostFormProps) {
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    post?.categories.map((c) => c.id) ?? []
  );
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [seo, setSeo] = useState({
    seoTitle: post?.seoTitle ?? "",
    seoDescription: post?.seoDescription ?? "",
    seoKeywords: post?.seoKeywords ?? [],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      coverImageAlt: post?.coverImageAlt ?? "",
      isPublished: post?.isPublished ?? false,
    },
  });

  const titleValue = watch("title");
  useEffect(() => {
    if (!post) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [titleValue, post, setValue]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const onSubmit = async (data: FormData) => {
    const url = post ? `/api/blog/${post.id}` : "/api/blog";
    const method = post ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        content,
        coverImageUrl: coverImageUrl || null,
        categoryIds: selectedCategories,
        tags,
        readingTime: calculateReadingTime(content),
        ...seo,
      }),
    });

    if (res.ok) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Title & slug */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-sm">Post Details</h3>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" {...register("title")} error={errors.title?.message} placeholder="10 Essential Skincare Steps for Glowing Skin" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" {...register("excerpt")} rows={2} placeholder="A short summary of the post..." />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPublished" {...register("isPublished")} className="w-4 h-4 accent-brand" />
          <Label htmlFor="isPublished">Publish immediately</Label>
        </div>
      </div>

      {/* Cover image */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-sm">Cover Image</h3>
        <ImageUploader
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          folder="blog"
          aspectRatio="16/9"
        />
        <div className="space-y-1.5">
          <Label htmlFor="coverImageAlt">Image Alt Text</Label>
          <Input id="coverImageAlt" {...register("coverImageAlt")} placeholder="Describe the cover image" />
        </div>
      </div>

      {/* Content editor */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">Content</h3>
        <BlogEditor value={content} onChange={setContent} />
        <p className="text-xs text-muted-foreground">
          ~{calculateReadingTime(content)} min read · {content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length} words
        </p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">Categories</h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={(e) =>
                  setSelectedCategories((prev) =>
                    e.target.checked ? [...prev, cat.id] : prev.filter((id) => id !== cat.id)
                  )
                }
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">Tags</h3>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
          />
          <Button type="button" variant="outline" onClick={addTag}>
            <Plus className="size-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground">
                #{tag}
                <button type="button" onClick={() => setTags((p) => p.filter((t) => t !== tag))}>
                  <X className="size-3 text-muted-foreground hover:text-destructive" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <SeoOptimizer
        type="blog"
        context={{ title: watch("title"), content, categories: categories.filter(c => selectedCategories.includes(c.id)).map(c => c.name), tags }}
        values={seo}
        onChange={setSeo}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
          {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
