import { prisma } from "@/lib/prisma";
import { BlogFormWrapper } from "@/components/admin/BlogFormWrapper";

export const metadata = { title: "New Post — Admin" };

export default async function NewBlogPostPage() {
  const categories = await prisma.category.findMany({
    where: { type: "BLOG" },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Blog
        </a>
        <h1 className="font-heading text-2xl font-bold mt-2">New Post</h1>
      </div>
      <BlogFormWrapper categories={categories} />
    </div>
  );
}
