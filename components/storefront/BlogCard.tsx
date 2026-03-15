import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  coverImageUrl,
  publishedAt,
  readingTime,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group block">
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary mb-4">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-light to-secondary" />
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        {publishedAt && <span>{formatDate(publishedAt)}</span>}
        {readingTime && (
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {readingTime} min read
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-snug mb-2">
        {title}
      </h3>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
      )}
    </Link>
  );
}
