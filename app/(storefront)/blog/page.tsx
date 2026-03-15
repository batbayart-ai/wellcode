import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/storefront/BlogCard";

export const metadata = {
  title: "Beauty Journal",
  description: "Skincare tips, beauty secrets, and wellness inspiration from Wellcode Beauty.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="pt-20 lg:pt-24">
      {/* Header */}
      <div className="bg-secondary py-14 px-4 text-center">
        <p
          className="text-sm font-medium uppercase tracking-widest mb-2"
          style={{ color: "var(--brand)" }}
        >
          Beauty Journal
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
          Our Blog
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Tips, trends, and stories from the world of beauty & wellness
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-heading text-2xl text-foreground/50 mb-2">No posts yet</p>
            <p className="text-muted-foreground text-sm">Check back soon for new articles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                coverImageUrl={post.coverImageUrl}
                publishedAt={post.publishedAt}
                readingTime={post.readingTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
