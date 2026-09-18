import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, CheckCircle, Clock, Eye, ListChecks, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getAdvisorById } from "@/lib/data/advisors";
import { getListingsByAdvisor } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { StatCard } from "@/components/danisman/StatCard";
import { AdvisorListingRow } from "@/components/danisman/AdvisorListingRow";

export const metadata: Metadata = {
  title: "Danışman Paneli | Anahtar Gayrimenkul",
};

export default async function DanismanPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ "ilan-eklendi"?: string; "ilan-guncellendi"?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris?next=/danisman/panel");
  if (session.role !== "danisman") redirect("/erisim-engellendi");

  const sp = await searchParams;
  const justCreated = sp["ilan-eklendi"] === "1";
  const justUpdated = sp["ilan-guncellendi"] === "1";

  const [advisor, listingsRaw] = await Promise.all([
    getAdvisorById(session.id),
    getListingsByAdvisor(session.id),
  ]);

  const listings = [...listingsRaw].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.publishStatus === "aktif").length,
    pending: listings.filter((l) => l.publishStatus === "beklemede").length,
    totalViews: listings.reduce((sum, l) => sum + l.viewCount, 0),
  };

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              Danışman Paneli
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
              Hoş geldiniz, {session.name}
            </h1>
            <p className="mt-1 text-sm text-foreground/55">
              {advisor ? `${advisor.title} · ${advisor.regions.join(", ")}` : session.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        {justCreated && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            İlanınız admin onayına gönderildi. İnceleme tamamlandığında yayına alınacak — şimdilik
            aşağıda &quot;Beklemede&quot; olarak görünüyor.
          </div>
        )}

        {justUpdated && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            İlanınızdaki değişiklikler kaydedildi.
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={ListChecks} label="Toplam İlan" value={stats.total} />
          <StatCard icon={CheckCircle2} label="Aktif İlan" value={stats.active} />
          <StatCard icon={Clock} label="Bekleyen İlan" value={stats.pending} />
          <StatCard
            icon={Eye}
            label="Toplam Görüntülenme"
            value={stats.totalViews.toLocaleString("tr-TR")}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-brand-950">İlanlarım</h2>
          <LinkButton href="/danisman/ilan-ver" variant="primary" size="sm">
            <Plus className="h-4 w-4" /> Yeni İlan Ekle
          </LinkButton>
        </div>

        <div className="mt-5 space-y-3">
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
              <p className="font-serif text-lg font-semibold text-brand-950">Henüz ilanınız yok</p>
              <p className="mt-2 text-sm text-foreground/55">
                &quot;Yeni İlan Ekle&quot; ile ilk ilanınızı oluşturun.
              </p>
            </div>
          ) : (
            listings.map((listing) => (
              <AdvisorListingRow key={listing.id} listing={listing} csrfToken={session.csrf} />
            ))
          )}
        </div>
      </Container>
    </div>
  );
}
