import Link from "next/link";
import { getLatestBlogPosts } from "@/lib/data/blog";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

export async function BlogSection() {
  const posts = await getLatestBlogPosts(3);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Bilgi Merkezi" title="Blog" description="Emlak dünyasından güncel yazılar." href="/blog" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex flex-col rounded-2xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
            >
              <Badge tone="cream" className="w-fit">
                {post.category}
              </Badge>
              <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-brand-950">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/60">{post.excerpt}</p>
              <p className="mt-4 text-xs text-foreground/45">
                {post.author} · {post.readMinutes} dk okuma
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
