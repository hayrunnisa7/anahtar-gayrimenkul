import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `iyzipay` kendi kaynak modüllerini `fs.readdirSync` + dinamik `require`
  // ile çalışma zamanında keşfediyor — bu, Turbopack'in statik analizle
  // paketleyemeyeceği bir desen. Next.js'e bu paketi paketlemeden doğrudan
  // Node'un kendi `require`'ıyla çözmesini söylüyoruz (standart çözüm).
  serverExternalPackages: ["iyzipay"],
};

export default nextConfig;
