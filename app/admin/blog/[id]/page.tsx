import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BlogFormWrapper } from "@/components/admin/BlogFormWrapper";

export const metadata = { title: "Edit Post — Admin" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      include: { categories: true },
    }),
    prisma.category.findMany({ where: { type: "BLOG" }, orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Blog
        </a>
        <h1 className="font-heading text-2xl font-bold mt-2">Edit Post</h1>
      </div>
      <BlogFormWrapper post={post} categories={categories} />
    </div>
  );
}
