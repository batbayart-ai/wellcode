import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const isAdmin = searchParams.get("admin") === "1";

  const posts = await prisma.blogPost.findMany({
    where: {
      ...(isAdmin ? {} : { isPublished: true }),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    },
    include: { categories: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date();

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content,
      coverImageUrl: body.coverImageUrl || null,
      coverImageAlt: body.coverImageAlt || "",
      isPublished: body.isPublished ?? false,
      publishedAt: body.isPublished ? now : null,
      tags: body.tags ?? [],
      readingTime: body.readingTime || null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      seoKeywords: body.seoKeywords ?? [],
      categories: {
        connect: (body.categoryIds ?? []).map((id: string) => ({ id })),
      },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
