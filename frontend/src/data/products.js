// Swan Logo URL (user provided)
export const LOGO_URL = "https://customer-assets.emergentagent.com/job_tshirt-portal/artifacts/ipaog4n8_Gemini_Generated_Image_mzt01hmzt01hmzt0-removebg-preview.png";

// Placeholder product images (from vision expert)
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

// Hero images
export const HERO_IMAGE = "https://images.unsplash.com/photo-1626128325088-25d26c4809ed?w=1920&q=80";

// Categories
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

// Available colors
export const COLORS = [
  { id: "black", name: "Black", hex: "#0a0a0a" },
  { id: "white", name: "White", hex: "#fafafa" },
  { id: "charcoal", name: "Charcoal", hex: "#374151" },
  { id: "navy", name: "Navy", hex: "#1e3a5f" },
  { id: "olive", name: "Olive", hex: "#4a5c41" },
];

// Available sizes
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

// Mock products data
export const PRODUCTS = [
  // Basic Collection
  {
    id: "basic-1",
    name: "Essential Crew",
    category: "basic",
    price: 39,
    description: "The foundation of every wardrobe. 100% Supima cotton, crafted for daily wear with invisible stitching and a relaxed fit.",
    images: [PRODUCT_IMAGES.product1, PRODUCT_IMAGES.product2, PRODUCT_IMAGES.minimalist],
    colors: ["black", "white", "charcoal"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    details: ["100% Supima Cotton", "Pre-shrunk", "Invisible stitching", "Relaxed fit"],
    inStock: true,
  },
  {
    id: "basic-2",
    name: "Classic V-Neck",
    category: "basic",
    price: 39,
    description: "Elevated simplicity. A perfectly cut v-neck that flatters every frame.",
    images: [PRODUCT_IMAGES.product2, PRODUCT_IMAGES.product1, PRODUCT_IMAGES.minimalist],
    colors: ["black", "white", "navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    details: ["100% Supima Cotton", "Tapered fit", "Reinforced seams", "Classic V-cut"],
    inStock: true,
  },
  {
    id: "basic-3",
    name: "Heavy Crew",
    category: "basic",
    price: 39,
    description: "Built for durability. A heavier weight cotton for those who demand more.",
    images: [PRODUCT_IMAGES.minimalist, PRODUCT_IMAGES.product1, PRODUCT_IMAGES.product2],
    colors: ["black", "charcoal", "olive"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    details: ["220 GSM Cotton", "Heavyweight construction", "Double-stitched", "Oversized fit"],
    inStock: true,
  },
  // Voted Designs Collection
  {
    id: "voted-1",
    name: "Minimalist Wave",
    category: "voted",
    price: 49,
    description: "Community voted #1. A subtle wave pattern that caught everyone's attention.",
    images: [PRODUCT_IMAGES.model1, PRODUCT_IMAGES.model2, PRODUCT_IMAGES.product1],
    colors: ["black", "white"],
    sizes: ["XS", "S", "M", "L", "XL"],
    details: ["Premium print", "Voted by community", "Limited edition", "Soft-touch finish"],
    inStock: true,
  },
  {
    id: "voted-2",
    name: "Geometric Essence",
    category: "voted",
    price: 49,
    description: "Sharp lines meet soft cotton. A design that speaks volumes through simplicity.",
    images: [PRODUCT_IMAGES.model2, PRODUCT_IMAGES.model1, PRODUCT_IMAGES.product2],
    colors: ["black", "white", "charcoal"],
    sizes: ["S", "M", "L", "XL"],
    details: ["Screen printed", "Geometric design", "Community favorite", "Regular fit"],
    inStock: true,
  },
  {
    id: "voted-3",
    name: "Abstract Flow",
    category: "voted",
    price: 49,
    description: "Movement captured in fabric. An abstract design that flows with you.",
    images: [PRODUCT_IMAGES.model3, PRODUCT_IMAGES.model1, PRODUCT_IMAGES.product1],
    colors: ["white", "charcoal"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    details: ["Artistic print", "Voted design", "Premium cotton", "Relaxed fit"],
    inStock: true,
  },
  // AI Collection
  {
    id: "ai-1",
    name: "Neural Pattern",
    category: "ai",
    price: 59,
    description: "Generated by AI, perfected by design. Each pattern is unique to its batch.",
    images: [PRODUCT_IMAGES.product3, PRODUCT_IMAGES.editorial1, PRODUCT_IMAGES.model1],
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL"],
    details: ["AI-generated art", "Unique batch prints", "Premium cotton", "Modern fit"],
    inStock: true,
  },
  {
    id: "ai-2",
    name: "Digital Dreams",
    category: "ai",
    price: 59,
    description: "Where algorithms meet artistry. A pattern born from machine learning.",
    images: [PRODUCT_IMAGES.editorial1, PRODUCT_IMAGES.product3, PRODUCT_IMAGES.model2],
    colors: ["black", "navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    details: ["Machine-designed", "Limited quantities", "Tech-inspired", "Slim fit"],
    inStock: true,
  },
  {
    id: "ai-3",
    name: "Synthetic Bloom",
    category: "ai",
    price: 59,
    description: "Nature reimagined through code. Organic patterns with digital precision.",
    images: [PRODUCT_IMAGES.editorial2, PRODUCT_IMAGES.product3, PRODUCT_IMAGES.model3],
    colors: ["white", "olive", "charcoal"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    details: ["AI-generated flora", "Eco-conscious inks", "Batch exclusive", "Oversized fit"],
    inStock: true,
  },
];

// Get products by category
export const getProductsByCategory = (categoryId) => {
  return PRODUCTS.filter(product => product.category === categoryId);
};

// Get product by ID
export const getProductById = (productId) => {
  return PRODUCTS.find(product => product.id === productId);
};

// Get color details by ID
export const getColorById = (colorId) => {
  return COLORS.find(color => color.id === colorId);
};
