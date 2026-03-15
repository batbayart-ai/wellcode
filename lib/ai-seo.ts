import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface SeoResult {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  excerpt?: string;
}

export async function generateProductSeo(product: {
  name: string;
  description: string;
  categories?: string[];
  tags?: string[];
  price?: number;
}): Promise<SeoResult> {
  const prompt = `You are an expert SEO specialist for a beauty and cosmetics e-commerce website.

Generate optimized SEO metadata for the following product:

Product Name: ${product.name}
Description: ${product.description}
Categories: ${product.categories?.join(", ") || "N/A"}
Tags: ${product.tags?.join(", ") || "N/A"}
Price: ${product.price ? `$${product.price}` : "N/A"}

Return a JSON object with exactly these fields:
{
  "seoTitle": "A compelling, keyword-rich title under 60 characters",
  "seoDescription": "An engaging meta description under 160 characters that encourages clicks",
  "seoKeywords": ["array", "of", "5-10", "relevant", "keywords"]
}

Focus on beauty/cosmetics industry search terms. Be specific, natural, and persuasive.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response format");

  return JSON.parse(jsonMatch[0]) as SeoResult;
}

export async function generateBlogSeo(post: {
  title: string;
  content: string;
  categories?: string[];
  tags?: string[];
}): Promise<SeoResult> {
  // Strip HTML tags for content preview
  const plainContent = post.content.replace(/<[^>]*>/g, "").slice(0, 500);

  const prompt = `You are an expert SEO specialist for a beauty and cosmetics blog.

Generate optimized SEO metadata for the following blog post:

Title: ${post.title}
Content Preview: ${plainContent}
Categories: ${post.categories?.join(", ") || "N/A"}
Tags: ${post.tags?.join(", ") || "N/A"}

Return a JSON object with exactly these fields:
{
  "seoTitle": "A compelling, keyword-rich title under 60 characters",
  "seoDescription": "An engaging meta description under 160 characters that encourages clicks",
  "seoKeywords": ["array", "of", "5-10", "relevant", "keywords"],
  "excerpt": "A short 1-2 sentence excerpt summarizing the post (under 200 characters)"
}

Focus on beauty/cosmetics/wellness search terms. Make it natural and engaging.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response format");

  return JSON.parse(jsonMatch[0]) as SeoResult;
}

export async function generateBannerCopy(context: {
  theme?: string;
  season?: string;
  promotion?: string;
  targetAudience?: string;
}): Promise<{ title: string; subtitle: string; ctaText: string }> {
  const prompt = `You are a copywriter for a luxury beauty and cosmetics brand.

Generate compelling banner/hero copy for:
Theme: ${context.theme || "beauty & skincare"}
Season/Occasion: ${context.season || "general"}
Promotion: ${context.promotion || "none"}
Target Audience: ${context.targetAudience || "beauty enthusiasts"}

Return a JSON object with exactly these fields:
{
  "title": "A short, punchy headline (under 8 words)",
  "subtitle": "A supporting line that adds detail (under 15 words)",
  "ctaText": "Call-to-action button text (2-4 words)"
}

Make it luxurious, aspirational, and on-brand for a premium beauty store.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response format");

  return JSON.parse(jsonMatch[0]);
}
