const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

/**
 * En yaygın/zayıf şifrelerin küçük, elle seçilmiş bir listesi. NIST'in
 * güncel şifre rehberine uygun olarak, zorunlu büyük harf/sayı/sembol
 * kuralları yerine (bunlar kullanılabilirliği düşürür ama etkili değildir)
 * bilinen zayıf şifreleri engellemeyi tercih ediyoruz — meşru kullanıcıların
 * büyük çoğunluğunu hiç etkilemeden gerçek zayıflığı yakalar.
 */
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "12345678910",
  "qwerty123",
  "qwertyuiop",
  "11111111",
  "00000000",
  "abc123456",
  "iloveyou1",
  "admin1234",
  "welcome1",
  "welcome123",
  "letmein123",
  "sifre1234",
  "şifre1234",
  "sifre123456",
  "parola1234",
  "asdfghjkl",
  "qazwsxedc",
  "trustno1",
  "football1",
  "baseball1",
  "monkey123",
  "dragon123",
  "sunshine1",
  "princess1",
  "starwars1",
]);

export interface PasswordValidationInput {
  password: string;
  email: string;
  name: string;
}

/** Geçerliyse `undefined`, geçersizse kullanıcıya gösterilecek hata mesajını döner. */
export function validatePassword({ password, email, name }: PasswordValidationInput): string | undefined {
  if (password.length < MIN_LENGTH) {
    return `Şifre en az ${MIN_LENGTH} karakter olmalı.`;
  }
  if (password.length > MAX_LENGTH) {
    return "Şifre çok uzun.";
  }

  const normalized = password.toLocaleLowerCase("tr");
  const emailNormalized = email.trim().toLocaleLowerCase("tr");
  const emailLocalPart = emailNormalized.split("@")[0] ?? "";
  const nameNormalized = name.trim().toLocaleLowerCase("tr");

  if (normalized === emailNormalized || normalized === emailLocalPart || normalized === nameNormalized) {
    return "Şifreniz e-posta adresinizle veya adınızla aynı olamaz.";
  }

  if (COMMON_PASSWORDS.has(normalized)) {
    return "Bu şifre çok yaygın kullanıldığı için güvenli değil, lütfen başka bir şifre seçin.";
  }

  return undefined;
}
