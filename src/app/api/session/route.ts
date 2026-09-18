import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/**
 * Header gibi paylaşılan client bileşenlerinin oturum durumunu okuyabilmesi
 * için hafif bir uç nokta. Ana sayfa/ilan sayfalarının statik render'ını
 * bozmamak amacıyla oturum bilgisi kök layout yerine burada, istek anında
 * okunur.
 */
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
