const turkishCharMap: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  const withoutTurkishChars = input
    .split("")
    .map((ch) => turkishCharMap[ch] ?? ch)
    .join("");

  return withoutTurkishChars
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
