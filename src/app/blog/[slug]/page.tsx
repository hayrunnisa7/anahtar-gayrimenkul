import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Clock, User } from "lucide-react";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/data/blog";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { formatFullDate } from "@/lib/utils/format";

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Anahtar Gayrimenkul`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllBlogPosts();
  const otherPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className="bg-cream-50">
      <div className="border-b border-black/5 bg-white">
        <Container className="flex items-center gap-2 py-3 text-sm">
          <Link href="/blog" className="flex items-center gap-1.5 text-brand-700 hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> Bloga Dön
          </Link>
        </Container>
      </div>

      <Container className="max-w-3xl py-8 sm:py-10">
        <Badge tone="cream">{post.category}</Badge>
        <h1 className="mt-3 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/50">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {formatFullDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {post.readMinutes} dk okuma
          </span>
        </div>

        <PlaceholderImage
          seed={post.id}
          icon={BookOpen}
          className="mt-6 aspect-[16/9] w-full rounded-2xl"
          iconClassName="h-12 w-12"
        />

        <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/80 sm:text-base">
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {otherPosts.length > 0 && (
          <div className="mt-12 border-t border-black/5 pt-8">
            <h2 className="mb-4 font-serif text-lg font-semibold text-brand-950">Diğer Yazılar</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="rounded-xl border border-black/5 bg-white p-4 transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
                >
                  <Badge tone="cream">{p.category}</Badge>
                  <p className="mt-2 line-clamp-2 font-medium text-brand-950">{p.title}</p>
                  <p className="mt-1 text-xs text-foreground/45">{formatFullDate(p.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
