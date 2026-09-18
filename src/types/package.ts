export interface SaasPackage {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  listingLimit: number | "sinirsiz";
  highlighted: boolean;
  cta: string;
}
