import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2, CheckCircle2, Clock, ListChecks, Users } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getPendingListings, getListingStats, getListingsByAdvisor } from "@/lib/data/listings";
import { getAdvisorById, getAllAdvisors } from "@/lib/data/advisors";
import { getUserById, getUserCountsByRole, getAllUsers } from "@/lib/data/users";
import { getSaasPackages } from "@/lib/data/packages";
import { getAllSubscriptions } from "@/lib/data/subscriptions";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { StatCard } from "@/components/danisman/StatCard";
import { PendingListingRow } from "@/components/admin/PendingListingRow";
import { AdminTabs, type AdminTab } from "@/components/admin/AdminTabs";
import { UserRow } from "@/components/admin/UserRow";
import { AdvisorManagementRow } from "@/components/admin/AdvisorManagementRow";
import { SubscriptionRow } from "@/components/admin/SubscriptionRow";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Admin Paneli | Anahtar Gayrimenkul",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris?next=/admin");
  if (session.role !== "admin") redirect("/erisim-engellendi");

  const { tab: tabParam } = await searchParams;
  const validTabs: AdminTab[] = ["genel-bakis", "kullanicilar", "danismanlar", "paketler"];
  const tab: AdminTab = validTabs.includes(tabParam as AdminTab) ? (tabParam as AdminTab) : "genel-bakis";

  const [listingStats, userCounts] = await Promise.all([getListingStats(), getUserCountsByRole()]);

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              Admin Paneli
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
              Hoş geldiniz, {session.name}
            </h1>
            <p className="mt-1 text-sm text-foreground/55">{session.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatCard icon={ListChecks} label="Toplam İlan" value={listingStats.total} />
          <StatCard icon={Clock} label="Onay Bekleyen" value={listingStats.pending} />
          <StatCard icon={CheckCircle2} label="Aktif İlan" value={listingStats.active} />
          <StatCard icon={Building2} label="Toplam Danışman" value={userCounts.danisman} />
          <StatCard icon={Users} label="Toplam Üye" value={userCounts.uye} />
        </div>

        <AdminTabs active={tab} />

        {tab === "genel-bakis" && <GenelBakisTab csrfToken={session.csrf} />}
        {tab === "kullanicilar" && <KullanicilarTab csrfToken={session.csrf} />}
        {tab === "danismanlar" && <DanismanlarTab csrfToken={session.csrf} />}
        {tab === "paketler" && <PaketlerTab csrfToken={session.csrf} />}
      </Container>
    </div>
  );
}

async function GenelBakisTab({ csrfToken }: { csrfToken: string }) {
  const pendingListings = await getPendingListings();

  const pendingWithAdvisorNames = await Promise.all(
    pendingListings.map(async (listing) => {
      const advisor = await getAdvisorById(listing.advisorId);
      if (advisor) return { listing, advisorName: advisor.name };
      const user = await getUserById(listing.advisorId);
      return { listing, advisorName: user?.name ?? "Bilinmeyen Danışman" };
    }),
  );

  return (
    <div className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-brand-950">Onay Bekleyen İlanlar</h2>
      <p className="mt-1 text-sm text-foreground/55">
        Danışmanlar tarafından gönderilen ve yayına alınmayı bekleyen ilanlar.
      </p>

      <div className="mt-5 space-y-3">
        {pendingWithAdvisorNames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
            <p className="font-serif text-lg font-semibold text-brand-950">
              Onay bekleyen ilan yok
            </p>
            <p className="mt-2 text-sm text-foreground/55">
              Danışmanlar yeni ilan gönderdiğinde burada listelenecek.
            </p>
          </div>
        ) : (
          pendingWithAdvisorNames.map(({ listing, advisorName }) => (
            <PendingListingRow
              key={listing.id}
              listing={listing}
              advisorName={advisorName}
              csrfToken={csrfToken}
            />
          ))
        )}
      </div>
    </div>
  );
}

async function KullanicilarTab({ csrfToken }: { csrfToken: string }) {
  const users = await getAllUsers();

  return (
    <div className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-brand-950">Kullanıcılar</h2>
      <p className="mt-1 text-sm text-foreground/55">
        Tüm demo hesapları — üye, danışman ve yönetici. Askıya alınan hesaplar giriş yapamaz.
      </p>

      <div className="mt-5 space-y-3">
        {users.map((user) => (
          <UserRow key={user.id} user={user} csrfToken={csrfToken} />
        ))}
      </div>
    </div>
  );
}

async function DanismanlarTab({ csrfToken }: { csrfToken: string }) {
  const [advisors, users] = await Promise.all([getAllAdvisors(), getAllUsers()]);

  const rows = await Promise.all(
    advisors.map(async (advisor) => {
      const listings = await getListingsByAdvisor(advisor.id);
      const account = users.find((u) => u.id === advisor.id);
      return {
        advisor,
        account,
        stats: {
          total: listings.length,
          active: listings.filter((l) => l.publishStatus === "aktif").length,
          pending: listings.filter((l) => l.publishStatus === "beklemede").length,
        },
      };
    }),
  );

  return (
    <div className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-brand-950">Danışmanlar</h2>
      <p className="mt-1 text-sm text-foreground/55">
        Danışman dizini ve gerçek zamanlı ilan istatistikleri. Yalnızca giriş hesabı bulunan
        danışmanlar askıya alınabilir.
      </p>

      <div className="mt-5 space-y-3">
        {rows.map(({ advisor, account, stats }) => (
          <AdvisorManagementRow
            key={advisor.id}
            advisor={advisor}
            account={account}
            stats={stats}
            csrfToken={csrfToken}
          />
        ))}
      </div>
    </div>
  );
}

async function PaketlerTab({ csrfToken }: { csrfToken: string }) {
  const [packages, subscriptions] = await Promise.all([getSaasPackages(), getAllSubscriptions()]);
  const packageName = (id: string) => packages.find((p) => p.id === id)?.name ?? id;

  const activeCount = subscriptions.filter((s) => s.status === "aktif").length;
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === "aktif")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="mt-8 space-y-10">
      <div>
        <h2 className="font-serif text-xl font-semibold text-brand-950">SaaS Paketleri</h2>
        <p className="mt-1 text-sm text-foreground/55">
          /paketler sayfasında yayınlanan mevcut paket tanımları.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-2xl border border-black/5 bg-white p-4">
              <p className="font-serif text-lg font-semibold text-brand-950">{pkg.name}</p>
              <p className="mt-1 text-sm text-foreground/55">{pkg.description}</p>
              <p className="mt-2 text-sm font-semibold text-brand-800">
                {formatPrice(pkg.priceMonthly)}/ay
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-brand-950">Abonelikler</h2>
            <p className="mt-1 text-sm text-foreground/55">
              Danışmanların satın aldığı paketler (mock ödeme kayıtları).
            </p>
          </div>
          <div className="flex gap-3">
            <StatCard icon={CheckCircle2} label="Aktif Abonelik" value={activeCount} />
            <StatCard icon={Building2} label="Aylık Ciro" value={formatPrice(monthlyRevenue)} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {subscriptions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
              <p className="font-serif text-lg font-semibold text-brand-950">Henüz abonelik yok</p>
              <p className="mt-2 text-sm text-foreground/55">
                Bir danışman /paketler üzerinden satın alma yaptığında burada listelenecek.
              </p>
            </div>
          ) : (
            subscriptions.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                packageName={packageName(subscription.packageId)}
                csrfToken={csrfToken}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
