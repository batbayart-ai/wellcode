import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateProductSeo, generateBlogSeo } from "@/lib/ai-seo";
import { apiRatelimit } from "@/lib/upstash";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit
  const { success } = await apiRatelimit.limit(session.user?.email ?? "unknown");
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { type, context } = await req.json();

  try {
    const result =
      type === "product"
        ? await generateProductSeo(context)
        : await generateBlogSeo(context);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
