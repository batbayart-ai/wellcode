"use client";

import { useRouter } from "next/navigation";
import { BlogPostForm } from "./BlogPostForm";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogFormWrapperProps {
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
}

export function BlogFormWrapper({ post, categories }: BlogFormWrapperProps) {
  const router = useRouter();
  return (
    <BlogPostForm
      post={post}
      categories={categories}
      onSaved={() => router.push("/admin/blog")}
      onCancel={() => router.push("/admin/blog")}
    />
  );
}
