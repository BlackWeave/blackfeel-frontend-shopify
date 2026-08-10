// Static site constants and visual assets.
//
// This file holds the parts of `data/products.js` that are NOT Shopify-driven:
// imagery, the LOGO, the size guide, the color swatches, and the category
// labels used in navigation/filter UI. Commerce data (products, variants,
// prices) lives in Shopify and is loaded via `@/lib/shopify` instead.
//
// The category labels here are the pre-Shopify placeholder names. Once
// Shopify collections are created they can be replaced by handles looked
// up via `GET_COLLECTIONS_QUERY`, but the storefront UI doesn't depend on
// collection titles for business logic.

// Brand logos
export const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_tshirt-portal/artifacts/ipaog4n8_Gemini_Generated_Image_mzt01hmzt01hmzt0-removebg-preview.png";

// Placeholder product images (used in non-commerce visuals: hero, editorial)
export const PRODUCT_IMAGES = {
  model1: "https://images.unsplash.com/photo-1626128325088-25d26c4809ed?w=800&q=80",
  model2: "https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg?w=800",
  model3: "https://images.pexels.com/photos/3214772/pexels-photo-3214772.jpeg?w=800",
  product1: "https://images.unsplash.com/photo-1562135291-7728cc647783?w=800&q=80",
  product2: "https://images.unsplash.com/photo-1499971442178-8c10fdf5f6ac?w=800&q=80",
  product3: "https://images.unsplash.com/photo-1716952029045-feb119b58583?w=800&q=80",
  flatlay: "https://images.pexels.com/photos/18186105/pexels-photo-18186105.jpeg?w=800",
  minimalist: "https://images.unsplash.com/photo-1621573094640-0b2391e9acec?w=800&q=80",
  editorial1: "https://images.unsplash.com/photo-1645996830739-8fe3df27c33f?w=800&q=80",
  editorial2: "https://images.unsplash.com/photo-1553614186-d23d17be2ad3?w=800&q=80",
};

// Hero image for the landing page
export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1626128325088-25d26c4809ed?w=1920&q=80";

// Category labels used by the navigation, filter UI, and homepage cards.
// These are visual labels — the storefront does not depend on the names
// for business logic. When Shopify collections are created, the `id`
// values here should match the collection handles (`basic`, `voted-designs`,
// `ai`) so the existing `?category=` URL queries continue to work.
export const CATEGORIES = [
  {
    id: "basic",
    name: "Basic",
    description: "Timeless essentials. Premium cotton, perfect fit.",
    price: 39,
    image: PRODUCT_IMAGES.product1,
  },
  {
    id: "voted",
    name: "Voted Designs",
    description: "Community favorites. Curated by you.",
    price: 49,
    image: PRODUCT_IMAGES.model1,
  },
  {
    id: "ai",
    name: "AI",
    description: "Generated art. Unique to each piece.",
    price: 59,
    image: PRODUCT_IMAGES.product3,
  },
];

// Color swatches used by the filter UI and quick-view. The hex values are
// visual fallback only — Shopify product options are the source of truth at
// runtime. The `id` field is used as the URL filter parameter.
export const COLORS = [
  { id: "black", name: "Black", hex: "#0a0a0a" },
  { id: "white", name: "White", hex: "#fafafa" },
  { id: "charcoal", name: "Charcoal", hex: "#374151" },
  { id: "navy", name: "Navy", hex: "#1e3a5f" },
  { id: "olive", name: "Olive", hex: "#4a5c41" },
];

// Available sizes (used for the size filter and as fallback for empty
// Shopify options). Shopify variants are the source of truth at runtime.
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Size guide measurements (in inches)
export const SIZE_GUIDE = {
  XS: { chest: "32-34", length: "26", shoulder: "16" },
  S: { chest: "35-37", length: "27", shoulder: "17" },
  M: { chest: "38-40", length: "28", shoulder: "18" },
  L: { chest: "41-43", length: "29", shoulder: "19" },
  XL: { chest: "44-46", length: "30", shoulder: "20" },
  XXL: { chest: "47-49", length: "31", shoulder: "21" },
};

// Helper: lookup a color by its id. Returns the swatch object or undefined.
export function getColorById(colorId) {
  return COLORS.find((color) => color.id === colorId);
}
