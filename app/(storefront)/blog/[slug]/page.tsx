import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Clock, ChevronRight } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    keywords: post.seoKeywords,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
    include: { categories: true },
  });

  if (!post) notFound();

  const safeContent = DOMPurify.sanitize(post.content);

  return (
    <div className="pt-20 lg:pt-24">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
        </nav>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.categories.map((cat: { id: string; name: string; slug: string }) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className="text-xs font-medium uppercase tracking-wider text-brand hover:underline"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readingTime} min read
            </span>
          )}
        </div>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-10">
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-foreground/80 leading-relaxed
            [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:mb-5 [&_p]:leading-8
            [&_a]:text-brand [&_a]:underline-offset-2 [&_a:hover]:underline
            [&_img]:rounded-xl [&_img]:my-8
            [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6
            [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6
            [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
