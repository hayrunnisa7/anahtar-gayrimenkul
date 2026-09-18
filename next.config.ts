import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `iyzipay` kendi kaynak modüllerini `fs.readdirSync` + dinamik `require`
  // ile çalışma zamanında keşfediyor — bu, Turbopack'in statik analizle
  // paketleyemeyeceği bir desen. Next.js'e bu paketi paketlemeden doğrudan
  // Node'un kendi `require`'ıyla çözmesini söylüyoruz (standart çözüm).
  // `@huggingface/transformers`, native `onnxruntime-node` binary'lerine
  // (libonnxruntime.so vb.) dayanıyor. Next.js bu paketi kendi sunucu
  // bundle'ına dahil etmeye çalışırsa, native dosyalar Vercel'in serverless
  // fonksiyon paketine dahil edilmiyor ve çalışma zamanında "cannot open
  // shared object file" hatasıyla patlıyor. `iyzipay` ile aynı çözüm:
  // paketi bundle dışında (external) bırakıp node_modules'tan olduğu gibi
  // çözülmesini sağlamak, gerekli native dosyaların dosya izlemesine
  // (file tracing) dahil edilmesini garantiler.
  serverExternalPackages: ["iyzipay", "@huggingface/transformers"],

  // `serverExternalPackages` tek başına yetmiyor: Next.js'in dosya izleme
  // (output file tracing) aracı @vercel/nft, statik import/require analiziyle
  // çalışıyor ve onnxruntime-node'un platform/mimariye göre çalışma
  // zamanında dinamik olarak seçtiği `.so` dosyasını (libonnxruntime.so.1)
  // yakalayamıyor — bu yüzden Vercel'in serverless fonksiyon paketine hiç
  // dahil edilmiyordu. Bu, native/runtime dosyalar için Next.js'in kendi
  // dokümantasyonunda önerilen standart çözüm.
  outputFileTracingIncludes: {
    "/*": ["node_modules/onnxruntime-node/**/*"],
  },
};

export default nextConfig;
