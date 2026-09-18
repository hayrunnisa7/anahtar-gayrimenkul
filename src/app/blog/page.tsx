import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getAllBlogPosts } from "@/lib/data/blog";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { formatFullDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Blog | Anahtar Gayrimenkul",
  description: "Emlak dünyasından güncel haberler, rehberler ve uzman görüşleri.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Bilgi Merkezi</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">Blog</h1>
        <p className="mt-1 text-sm text-foreground/55">Emlak dünyasından güncel yazılar.</p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
            >
              <PlaceholderImage seed={post.id} icon={BookOpen} className="aspect-[16/9] w-full" iconClassName="h-8 w-8" />
              <div className="flex flex-1 flex-col p-6">
                <Badge tone="cream" className="w-fit">
                  {post.category}
                </Badge>
                <h2 className="mt-3 font-serif text-lg font-semibold leading-snug text-brand-950">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/60">{post.excerpt}</p>
                <p className="mt-auto pt-4 text-xs text-foreground/45">
                  {post.author} · {formatFullDate(post.publishedAt)} · {post.readMinutes} dk okuma
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
