import { prisma } from "@/lib/db/prisma";
import type { BlogPost as DbBlogPost } from "@prisma/client";
import type { BlogPost } from "@/types/blog";

function toAppBlogPost(row: DbBlogPost): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    publishedAt: row.publishedAt.toISOString().slice(0, 10),
    readMinutes: row.readMinutes,
    category: row.category,
  };
}

export async function getLatestBlogPosts(limit = 3): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" }, take: limit });
  return rows.map(toAppBlogPost);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
  return rows.map(toAppBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? toAppBlogPost(row) : undefined;
}
