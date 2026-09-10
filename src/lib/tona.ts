export const WHATSAPP_NUMBER = "251986212224";
export const WHATSAPP_DISPLAY = "+251 98 621 2224";

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export type Product = {
  slug: string;
  name: string;
  region: string;
  process: string;
  notes: string[];
  blurb: string;
  altitude: string;
  accent: "orange" | "teal";
};

export const PRODUCTS: Product[] = [
  {
    slug: "yirgacheffe",
    name: "Yirgacheffe",
    region: "Gedeo Zone, Southern Ethiopia",
    process: "Washed",
    notes: ["Jasmine", "Bergamot", "Lemon Blossom"],
    blurb:
      "Ethiopia's most iconic origin. Bright, floral and tea-like, with a clean citrus finish that stays elegant from first sip to last.",
    altitude: "1,900 – 2,200 masl",
    accent: "orange",
  },
  {
    slug: "sidama",
    name: "Sidama",
    region: "Sidama Region, Southern Ethiopia",
    process: "Natural",
    notes: ["Blueberry", "Cocoa", "Red Wine"],
    blurb:
      "Full-bodied and syrupy with fruit-forward sweetness — a deeper, more grounding cup that carries beautifully through milk.",
    altitude: "1,700 – 2,100 masl",
    accent: "teal",
  },
  {
    slug: "guji",
    name: "Guji",
    region: "Guji Zone, Oromia",
    process: "Natural & Washed lots",
    notes: ["Peach", "Sweet Spice", "Cane Sugar"],
    blurb:
      "Layered and juicy with a rounded, silky body. Guji sits between the brightness of Yirgacheffe and the depth of Sidama.",
    altitude: "1,950 – 2,300 masl",
    accent: "teal",
  },
  {
    slug: "gesha",
    name: "Gesha",
    region: "Bench Maji / Gesha Village, Western Ethiopia",
    process: "Washed micro-lot",
    notes: ["Jasmine", "Papaya", "Honeysuckle"],
    blurb:
      "Our rarest lot. Perfumed, delicate and exceptionally aromatic — released in limited quantities as harvest allows.",
    altitude: "1,900 – 2,100 masl",
    accent: "orange",
  },
];

export const SIZES = ["250g", "500g", "1kg"] as const;
export const FORMATS = ["Whole Bean", "Espresso Grind", "Filter Grind"] as const;
