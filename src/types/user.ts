export type UserRole = "ziyaretci" | "uye" | "danisman" | "admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  ziyaretci: "Ziyaretçi",
  uye: "Üye",
  danisman: "Emlak Danışmanı",
  admin: "Yönetici",
};

/** Oturum açmış bir kullanıcının alabileceği roller ("ziyaretçi" = oturum yok). */
export type AuthenticatedRole = Exclude<UserRole, "ziyaretci">;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
