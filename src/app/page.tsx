import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { AISearchTeaser } from "@/components/home/AISearchTeaser";
import { LatestListings } from "@/components/home/LatestListings";
import { RegionsSection } from "@/components/home/RegionsSection";
import { AdvisorsSection } from "@/components/home/AdvisorsSection";
import { PackagesTeaser } from "@/components/home/PackagesTeaser";
import { BlogSection } from "@/components/home/BlogSection";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedListings />
      <AISearchTeaser />
      <LatestListings />
      <RegionsSection />
      <AdvisorsSection />
      <PackagesTeaser />
      <BlogSection />
      <CTASection />
    </>
  );
}
