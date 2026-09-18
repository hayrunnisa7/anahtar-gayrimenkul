import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidCsrfToken } from "@/lib/auth/csrf";
import { createListing } from "@/lib/data/listings";
import { parseNumberInput } from "@/lib/utils/parseNumberInput";
import type { ListingStatus, PropertyCategory, UsageStatus } from "@/types/listing";

/**
 * Yeni ilan oluşturma uç noktası. Klasik Post/Redirect/Get deseni kullanır
 * (danışman panelindeki yayın durumu değiştirme aksiyonuyla aynı, kanıtlanmış
 * güvenilir yaklaşım) — böylece danışman paneline dönüldüğünde yeni ilan
 * "Beklemede" olarak listede anında ve güvenilir şekilde görünür.
 *
 * Yetki: advisorId HER ZAMAN oturumdan alınır, form verisinden ASLA
 * alınmaz — bu sayede bir kullanıcı başka bir danışman adına ilan
 * oluşturamaz.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "danisman") {
    return NextResponse.redirect(new URL("/giris?next=/danisman/ilan-ver", request.url), { status: 303 });
  }

  const formData = await request.formData();

  if (!isValidCsrfToken(formData, session)) {
    const url = new URL("/danisman/ilan-ver", request.url);
    url.searchParams.set("hata", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const num = (key: string): number | undefined => parseNumberInput(String(formData.get(key) ?? ""));
  const bool = (key: string) => formData.get(key) === "evet";

  const status = str("status");
  const category = str("category");
  const title = str("title");
  const price = num("price");
  const area = num("area");

  const validStatus: ListingStatus[] = ["satilik", "kiralik"];
  const validCategory: PropertyCategory[] = ["konut", "arsa", "isyeri"];

  if (
    !title ||
    price === undefined ||
    price <= 0 ||
    area === undefined ||
    area <= 0 ||
    !validStatus.includes(status as ListingStatus) ||
    !validCategory.includes(category as PropertyCategory)
  ) {
    // Sunucu tarafı güvenlik ağı: client validasyonunu atlatan bozuk bir
    // gönderim varsa, formu tekrar doldurmaları için geri yönlendir.
    const url = new URL("/danisman/ilan-ver", request.url);
    url.searchParams.set("hata", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const floorCurrent = str("floorCurrent");
  const floorTotal = str("floorTotal");
  const floor = floorCurrent ? (floorTotal ? `${floorCurrent}/${floorTotal}` : floorCurrent) : undefined;

  const photos = formData
    .getAll("photos")
    .filter((p): p is File => p instanceof File && p.size > 0);

  await createListing(
    {
      status: status as ListingStatus,
      category: category as PropertyCategory,
      subCategory: str("subCategory"),
      title,
      description: str("description"),
      price,
      city: str("city"),
      district: str("district"),
      neighborhood: str("neighborhood"),
      address: str("address"),
      area,
      netArea: num("netArea"),
      roomCount: str("roomCount") || undefined,
      bathroomCount: num("bathroomCount"),
      buildingAge: num("buildingAge"),
      floor,
      heating: str("heating") || undefined,
      balconyCount: num("balconyCount"),
      isFurnished: category === "konut" ? bool("isFurnished") : undefined,
      hasParking: category !== "arsa" ? bool("hasParking") : undefined,
      inComplex: category !== "arsa" ? bool("inComplex") : undefined,
      dues: num("dues"),
      facade: formData.getAll("facade").map(String),
      titleDeedStatus: str("titleDeedStatus") || undefined,
      loanEligible: bool("loanEligible"),
      usageStatus: (str("usageStatus") || undefined) as UsageStatus | undefined,
      features: formData.getAll("features").map(String),
      photoCount: photos.length,
    },
    session.id,
  );

  return NextResponse.redirect(new URL("/danisman/panel?ilan-eklendi=1", request.url), { status: 303 });
}
