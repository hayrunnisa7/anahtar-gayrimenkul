import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidCsrfToken } from "@/lib/auth/csrf";
import { updateListing } from "@/lib/data/listings";
import { parseNumberInput } from "@/lib/utils/parseNumberInput";
import type { ListingStatus, PropertyCategory, UsageStatus } from "@/types/listing";

/**
 * Mevcut ilan güncelleme uç noktası. `create-listing` ile aynı Post/Redirect/Get
 * desenini kullanır. Yetki: advisorId HER ZAMAN oturumdan alınır; `updateListing`
 * ayrıca ilanın gerçekten bu danışmana ait olduğunu doğrular, aksi halde
 * hiçbir alanı değiştirmeden `undefined` döner.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "danisman") {
    return NextResponse.redirect(new URL("/giris?next=/danisman/panel", request.url), { status: 303 });
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

  const listingId = str("listingId");
  const status = str("status");
  const category = str("category");
  const title = str("title");
  const price = num("price");
  const area = num("area");

  const validStatus: ListingStatus[] = ["satilik", "kiralik"];
  const validCategory: PropertyCategory[] = ["konut", "arsa", "isyeri"];

  if (
    !listingId ||
    !title ||
    price === undefined ||
    price <= 0 ||
    area === undefined ||
    area <= 0 ||
    !validStatus.includes(status as ListingStatus) ||
    !validCategory.includes(category as PropertyCategory)
  ) {
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

  const updated = await updateListing(
    listingId,
    session.id,
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
      photoCount: photos.length > 0 ? photos.length : undefined,
    },
  );

  if (!updated) {
    return NextResponse.redirect(new URL("/erisim-engellendi", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/danisman/panel?ilan-guncellendi=1", request.url), { status: 303 });
}
