import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FavoritesProvider } from "@/lib/favorites/FavoritesProvider";
import { CompareProvider } from "@/lib/compare/CompareProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Anahtar Gayrimenkul | Satılık ve Kiralık İlanlar",
  description:
    "Anahtar Gayrimenkul ile satılık ve kiralık konut, arsa ve işyeri ilanlarını keşfedin. Güvenilir danışmanlar, gelişmiş filtreleme ve yapay zeka destekli arama.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream-50 text-foreground">
        <CompareProvider>
          <FavoritesProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </FavoritesProvider>
        </CompareProvider>
      </body>
    </html>
  );
}
