import { prisma } from "@/lib/db/prisma";
import type { User as DbUser } from "@prisma/client";
import type { MockUser } from "@/lib/mock/users";
import type { AuthenticatedRole } from "@/types/user";

/**
 * Data-access layer for demo accounts. Prisma/Supabase üzerinden okur/yazar.
 * `MockUser` tipi (yalnızca tip olarak) mock dosyasından import edilir ki
 * admin bileşenleri tek bir tip tanımına bağlı kalsın.
 */

function toMockUser(row: DbUser): MockUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role as AuthenticatedRole,
    isBlocked: row.isBlocked,
  };
}

export async function getUserById(id: string): Promise<MockUser | undefined> {
  const row = await prisma.user.findUnique({ where: { id } });
  return row ? toMockUser(row) : undefined;
}

export async function getUserCountsByRole(): Promise<Record<AuthenticatedRole, number>> {
  const groups = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  const counts: Record<AuthenticatedRole, number> = { uye: 0, danisman: 0, admin: 0 };
  for (const g of groups) {
    counts[g.role as AuthenticatedRole] = g._count._all;
  }
  return counts;
}

/** Admin panelindeki "Kullanıcılar" sekmesi için tüm hesapları döner. */
export async function getAllUsers(): Promise<MockUser[]> {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toMockUser);
}

/**
 * Bir hesabı askıya alır/askıyı kaldırır. "admin" rolündeki hesaplar asla
 * askıya alınamaz — sistemin yönetimsiz kalmaması için burada engellenir.
 */
export async function setUserBlocked(id: string, blocked: boolean): Promise<MockUser | undefined> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "admin") return undefined;
  const updated = await prisma.user.update({ where: { id }, data: { isBlocked: blocked } });
  return toMockUser(updated);
}
