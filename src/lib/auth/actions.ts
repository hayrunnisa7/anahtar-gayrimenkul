"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import argon2 from "argon2";
import { prisma } from "@/lib/db/prisma";
import {
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
  serializeSession,
  type SessionUser,
} from "@/lib/auth/session-cookie";
import {
  checkRateLimit,
  emailKey,
  EMAIL_LOCK_MS,
  EMAIL_MAX_ATTEMPTS,
  EMAIL_WINDOW_MS,
  getClientIp,
  ipKey,
  IP_LOCK_MS,
  IP_MAX_ATTEMPTS,
  IP_WINDOW_MS,
  recordFailedAttempt,
  resetAttempts,
} from "@/lib/auth/rate-limit";
import { validatePassword } from "@/lib/auth/password-policy";
import { generateCsrfToken } from "@/lib/auth/csrf";
import { slugify } from "@/lib/utils/slugify";
import type { AuthenticatedRole } from "@/types/user";

export interface AuthFormState {
  error?: string;
}

async function setSessionCookie(user: SessionUser) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, await serializeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
}

function roleHome(role: AuthenticatedRole) {
  switch (role) {
    case "uye":
      return "/hesabim";
    case "danisman":
      return "/danisman/panel";
    case "admin":
      return "/admin";
  }
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Lütfen e-posta ve şifrenizi girin." };
  }

  const eKey = emailKey(email);
  const ip = await getClientIp();
  const iKey = ipKey(ip);

  const [emailLimit, ipLimit] = await Promise.all([checkRateLimit(eKey), checkRateLimit(iKey)]);
  if (emailLimit.limited || ipLimit.limited) {
    const minutes = Math.max(emailLimit.retryAfterMinutes, ipLimit.retryAfterMinutes);
    return { error: `Çok fazla başarısız deneme yapıldı. Lütfen ${minutes} dakika sonra tekrar deneyin.` };
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (!user || !(await argon2.verify(user.password, password))) {
    await Promise.all([
      recordFailedAttempt(eKey, EMAIL_WINDOW_MS, EMAIL_MAX_ATTEMPTS, EMAIL_LOCK_MS),
      recordFailedAttempt(iKey, IP_WINDOW_MS, IP_MAX_ATTEMPTS, IP_LOCK_MS),
    ]);
    return { error: "E-posta veya şifre hatalı." };
  }

  if (user.isBlocked) {
    return { error: "Bu hesap yönetici tarafından askıya alınmıştır." };
  }

  // Başarılı giriş: yalnızca hesap sayacı sıfırlanır, IP sayacı zaman
  // penceresine bırakılır (bkz. rate-limit.ts).
  await resetAttempts(eKey);

  await setSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    csrf: generateCsrfToken(),
  });
  redirect(next.startsWith("/") ? next : roleHome(user.role));
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const accountTypeRaw = String(formData.get("accountType") ?? "uye");

  if (!name || !email) {
    return { error: "Lütfen tüm alanları eksiksiz doldurun." };
  }

  const passwordError = validatePassword({ password, email, name });
  if (passwordError) {
    return { error: passwordError };
  }

  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) {
    return { error: "Bu e-posta ile zaten bir demo hesap kayıtlı. Giriş yapabilirsiniz." };
  }

  // Admin rolü kayıt formundan asla seçilemez — yalnızca "uye" veya "danisman".
  const role: AuthenticatedRole = accountTypeRaw === "danisman" ? "danisman" : "uye";
  const id = `demo-${Date.now()}`;
  const hashedPassword = await argon2.hash(password);

  await prisma.user.create({ data: { id, name, email, password: hashedPassword, role } });

  // Danışman rolündeki her User'ın karşılığında bir Advisor satırı olmalı —
  // Subscription.advisorId ve Listing.advisorId, User.id'ye değil
  // Advisor.id'ye referans veriyor (bkz. schema.prisma). Bu adım eksikse
  // yeni kayıt olan danışmanlar için paket satın alma/ilan oluşturma
  // "foreign key constraint violated" hatasıyla çöküyordu (id'ler eşit
  // tutularak User<->Advisor eşleşmesi sağlanıyor, schema'daki mevcut
  // "adv-1 gibi" konvansiyonunun aynısı).
  if (role === "danisman") {
    await prisma.advisor.create({
      data: {
        id,
        slug: `${slugify(name)}-${id.slice(-6)}`,
        name,
        title: "Emlak Danışmanı",
        phone: "",
        whatsapp: "",
        email,
        bio: "",
        regions: [],
      },
    });
  }

  await setSessionCookie({ id, name, email, role, csrf: generateCsrfToken() });
  redirect(roleHome(role));
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
