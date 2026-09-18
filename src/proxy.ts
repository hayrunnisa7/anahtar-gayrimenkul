import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, parseSessionCookie } from "@/lib/auth/session-cookie";
import type { AuthenticatedRole } from "@/types/user";

const roleGuards: { prefix: string; role: AuthenticatedRole }[] = [
  { prefix: "/hesabim", role: "uye" },
  { prefix: "/danisman", role: "danisman" },
  { prefix: "/admin", role: "admin" },
];

/** Belirli bir rol gerektirmeyen, yalnızca oturum açılmış olmasını isteyen yollar. */
const authOnlyPrefixes = ["/favoriler"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authOnly = authOnlyPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const guard = roleGuards.find((g) => pathname === g.prefix || pathname.startsWith(`${g.prefix}/`));

  if (!authOnly && !guard) return NextResponse.next();

  const session = await parseSessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    const loginUrl = new URL("/giris", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (guard && session.role !== guard.role) {
    return NextResponse.redirect(new URL("/erisim-engellendi", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hesabim/:path*", "/danisman/:path*", "/admin/:path*", "/favoriler/:path*"],
};
