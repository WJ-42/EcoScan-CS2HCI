// ─── Types ───────────────────────────────────────────────────────────────────

export type SustainabilityGrade = "A" | "B" | "C" | "D" | "E";

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number; // GBP
  grade: SustainabilityGrade;
  score: number; // 0-100
  carbonFootprint: number; // kg CO2e
  packagingRecyclability: number; // 0-100 %
  sourcing: "Local" | "Regional" | "National" | "Imported";
  certifications: string[];
  alternativeIds: string[];
  averageRating: number; // 1-5
  reviewCount: number;
}

export function formatPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1-5
  comment: string;
  category: "Packaging" | "Sourcing" | "Carbon" | "Overall";
  date: string;
}

export interface EcoTip {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// ─── Grade Helpers ──────────────────────────────────────────────────────────

export const GRADE_COLORS: Record<SustainabilityGrade, { bg: string; text: string }> = {
  A: { bg: "#16A34A", text: "#FFFFFF" },
  B: { bg: "#65D26E", text: "#FFFFFF" },
  C: { bg: "#EAB308", text: "#1A1A1A" },
  D: { bg: "#F97316", text: "#FFFFFF" },
  E: { bg: "#DC2626", text: "#FFFFFF" },
};

export const GRADE_LABELS: Record<SustainabilityGrade, string> = {
  A: "Excellent",
  B: "Good",
  C: "Moderate",
  D: "Poor",
  E: "Very Poor",
};

export function getGradeFromScore(score: number): SustainabilityGrade {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "E";
}

// ─── Mock Products ──────────────────────────────────────────────────────────
// Products span all grades A-E. Alternatives always point to BETTER-rated products.

export const PRODUCTS: Product[] = [
  // ── Dairy Alternatives ──
  {
    id: "1",
    barcode: "5901234123457",
    name: "Organic Oat Milk",
    brand: "GreenValley",
    category: "Dairy Alternatives",
    imageUrl: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=200&h=200&fit=crop",
    price: 2.49,
    grade: "A",
    score: 92,
    carbonFootprint: 0.4,
    packagingRecyclability: 85,
    sourcing: "Local",
    certifications: ["Organic", "Carbon Neutral"],
    alternativeIds: [], // Already top-rated, no better alternative
    averageRating: 4.5,
    reviewCount: 128,
  },
  {
    id: "2",
    barcode: "4006381333931",
    name: "Almond Milk Original",
    brand: "NatureFresh",
    category: "Dairy Alternatives",
    imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&h=200&fit=crop",
    price: 1.99,
    grade: "C",
    score: 48,
    carbonFootprint: 1.8,
    packagingRecyclability: 45,
    sourcing: "Imported",
    certifications: [],
    alternativeIds: ["1", "3"], // Points to better: Oat Milk (A) and Soy Milk (B)
    averageRating: 3.2,
    reviewCount: 89,
  },
  {
    id: "3",
    barcode: "8710398527837",
    name: "Soy Milk Unsweetened",
    brand: "EcoChoice",
    category: "Dairy Alternatives",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
    price: 2.19,
    grade: "B",
    score: 68,
    carbonFootprint: 0.5,
    packagingRecyclability: 60,
    sourcing: "National",
    certifications: ["Non-GMO"],
    alternativeIds: ["1"], // Points to better: Oat Milk (A)
    averageRating: 3.8,
    reviewCount: 56,
  },

  // ── Pasta & Grains ──
  {
    id: "4",
    barcode: "3017620422003",
    name: "Whole Wheat Pasta",
    brand: "TerraGrain",
    category: "Pasta & Grains",
    imageUrl: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=200&h=200&fit=crop",
    price: 1.89,
    grade: "A",
    score: 88,
    carbonFootprint: 0.3,
    packagingRecyclability: 95,
    sourcing: "Local",
    certifications: ["Organic", "Plastic-Free"],
    alternativeIds: [], // Already top-rated
    averageRating: 4.7,
    reviewCount: 203,
  },
  {
    id: "5",
    barcode: "8076809513753",
    name: "White Spaghetti",
    brand: "PastaClassic",
    category: "Pasta & Grains",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop",
    price: 0.99,
    grade: "C",
    score: 45,
    carbonFootprint: 0.8,
    packagingRecyclability: 40,
    sourcing: "Imported",
    certifications: [],
    alternativeIds: ["4"], // Points to better: Whole Wheat Pasta (A)
    averageRating: 3.2,
    reviewCount: 34,
  },

  // ── Snacks ──
  {
    id: "6",
    barcode: "7622210449283",
    name: "Fair Trade Dark Chocolate",
    brand: "CocoaPure",
    category: "Snacks",
    imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=200&h=200&fit=crop",
    price: 3.49,
    grade: "B",
    score: 72,
    carbonFootprint: 1.2,
    packagingRecyclability: 80,
    sourcing: "Imported",
    certifications: ["Fair Trade", "Rainforest Alliance"],
    alternativeIds: [], // Best in snacks category
    averageRating: 4.3,
    reviewCount: 167,
  },
  {
    id: "7",
    barcode: "5000159484695",
    name: "Milk Chocolate Bar",
    brand: "SweetTreat",
    category: "Snacks",
    imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=200&h=200&fit=crop",
    price: 1.29,
    grade: "D",
    score: 28,
    carbonFootprint: 3.4,
    packagingRecyclability: 20,
    sourcing: "Imported",
    certifications: [],
    alternativeIds: ["6"], // Points to better: Fair Trade Dark Chocolate (B)
    averageRating: 2.8,
    reviewCount: 45,
  },

  // ── Eggs & Dairy ──
  {
    id: "8",
    barcode: "4002359001234",
    name: "Organic Free-Range Eggs",
    brand: "HappyHens",
    category: "Eggs & Dairy",
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop",
    price: 3.99,
    grade: "A",
    score: 85,
    carbonFootprint: 0.6,
    packagingRecyclability: 100,
    sourcing: "Local",
    certifications: ["Free-Range", "Organic"],
    alternativeIds: [], // Already top-rated
    averageRating: 4.6,
    reviewCount: 312,
  },
  {
    id: "9",
    barcode: "5012345678901",
    name: "Cage Eggs 12 Pack",
    brand: "ValueFarm",
    category: "Eggs & Dairy",
    imageUrl: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=200&h=200&fit=crop",
    price: 1.69,
    grade: "E",
    score: 15,
    carbonFootprint: 2.1,
    packagingRecyclability: 30,
    sourcing: "National",
    certifications: [],
    alternativeIds: ["8"], // Points to better: Organic Free-Range Eggs (A)
    averageRating: 2.1,
    reviewCount: 22,
  },

  // ── Household ──
  {
    id: "10",
    barcode: "9780201379624",
    name: "Bamboo Paper Towels",
    brand: "EcoWipe",
    category: "Household",
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop",
    price: 4.99,
    grade: "A",
    score: 91,
    carbonFootprint: 0.2,
    packagingRecyclability: 100,
    sourcing: "Regional",
    certifications: ["FSC", "Compostable"],
    alternativeIds: [],
    averageRating: 4.8,
    reviewCount: 89,
  },
  {
    id: "11",
    barcode: "1234567890123",
    name: "Standard Paper Towels",
    brand: "QuickClean",
    category: "Household",
    imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop",
    price: 2.29,
    grade: "D",
    score: 25,
    carbonFootprint: 1.8,
    packagingRecyclability: 30,
    sourcing: "Imported",
    certifications: [],
    alternativeIds: ["10"], // Points to better: Bamboo Paper Towels (A)
    averageRating: 2.5,
    reviewCount: 38,
  },

  // ── Beverages ──
  {
    id: "12",
    barcode: "2345678901234",
    name: "Sparkling Water 6-Pack",
    brand: "ClearSpring",
    category: "Beverages",
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=200&h=200&fit=crop",
    price: 2.99,
    grade: "C",
    score: 42,
    carbonFootprint: 1.5,
    packagingRecyclability: 55,
    sourcing: "Imported",
    certifications: [],
    alternativeIds: ["14"], // Points to better: Filtered Tap Water Bottle (A)
    averageRating: 3.4,
    reviewCount: 67,
  },

  // ── Additional products for variety ──
  {
    id: "13",
    barcode: "3456789012345",
    name: "Instant Noodle Cup",
    brand: "QuickBite",
    category: "Ready Meals",
    imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop",
    price: 0.89,
    grade: "D",
    score: 22,
    carbonFootprint: 2.8,
    packagingRecyclability: 15,
    sourcing: "Imported",
    certifications: [],
    alternativeIds: ["4"], // Points to better: Whole Wheat Pasta (A)
    averageRating: 2.3,
    reviewCount: 19,
  },
  {
    id: "14",
    barcode: "4567890123456",
    name: "Reusable Water Bottle",
    brand: "PureFlow",
    category: "Beverages",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop",
    price: 12.99,
    grade: "A",
    score: 96,
    carbonFootprint: 0.05,
    packagingRecyclability: 100,
    sourcing: "Local",
    certifications: ["Zero Waste", "BPA-Free"],
    alternativeIds: [],
    averageRating: 4.9,
    reviewCount: 310,
  },
  {
    id: "15",
    barcode: "5678901234567",
    name: "Frozen Pizza Margherita",
    brand: "EasyMeal",
    category: "Ready Meals",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
    price: 3.49,
    grade: "D",
    score: 30,
    carbonFootprint: 2.5,
    packagingRecyclability: 25,
    sourcing: "National",
    certifications: [],
    alternativeIds: ["4"], // Points to better: Whole Wheat Pasta (A)
    averageRating: 2.9,
    reviewCount: 52,
  },
  {
    id: "16",
    barcode: "6789012345678",
    name: "Crisps Multipack",
    brand: "SnackCo",
    category: "Snacks",
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop",
    price: 2.79,
    grade: "C",
    score: 38,
    carbonFootprint: 1.6,
    packagingRecyclability: 35,
    sourcing: "National",
    certifications: [],
    alternativeIds: ["6"], // Points to better: Fair Trade Dark Chocolate (B)
    averageRating: 3.0,
    reviewCount: 41,
  },
];

// ─── Mock Reviews ───────────────────────────────────────────────────────────

export const REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "1",
    userName: "Sarah M.",
    userAvatar: "SM",
    rating: 5,
    comment: "Love this oat milk! The packaging is fully recyclable and it tastes amazing. Great to know it's locally sourced too.",
    category: "Overall",
    date: "2026-03-01",
  },
  {
    id: "r2",
    productId: "1",
    userName: "James K.",
    userAvatar: "JK",
    rating: 4,
    comment: "Good sustainability credentials. Wish the carton was easier to flatten for recycling though.",
    category: "Packaging",
    date: "2026-02-28",
  },
  {
    id: "r3",
    productId: "1",
    userName: "Emma L.",
    userAvatar: "EL",
    rating: 5,
    comment: "Carbon neutral certified and tastes great. My go-to milk alternative now.",
    category: "Carbon",
    date: "2026-02-25",
  },
  {
    id: "r4",
    productId: "4",
    userName: "Michael R.",
    userAvatar: "MR",
    rating: 5,
    comment: "Plastic-free packaging and organic. This is how all pasta should be sold!",
    category: "Packaging",
    date: "2026-03-02",
  },
  {
    id: "r5",
    productId: "4",
    userName: "Lisa T.",
    userAvatar: "LT",
    rating: 4,
    comment: "Locally sourced wheat with minimal carbon footprint. A great everyday choice.",
    category: "Sourcing",
    date: "2026-02-20",
  },
  {
    id: "r6",
    productId: "6",
    userName: "David W.",
    userAvatar: "DW",
    rating: 4,
    comment: "Fair trade and rainforest alliance certified. The packaging could be better but the sourcing is ethical.",
    category: "Sourcing",
    date: "2026-03-03",
  },
  {
    id: "r7",
    productId: "8",
    userName: "Anna P.",
    userAvatar: "AP",
    rating: 5,
    comment: "Free-range, organic, and the cardboard packaging is 100% recyclable. Perfect!",
    category: "Overall",
    date: "2026-03-04",
  },
  {
    id: "r8",
    productId: "7",
    userName: "Tom H.",
    userAvatar: "TH",
    rating: 2,
    comment: "Excessive plastic wrapping and high carbon footprint. There are much better chocolate options out there.",
    category: "Packaging",
    date: "2026-02-15",
  },
  {
    id: "r9",
    productId: "5",
    userName: "Rachel G.",
    userAvatar: "RG",
    rating: 3,
    comment: "Imported from far away with plastic packaging. The whole wheat alternative is much greener.",
    category: "Carbon",
    date: "2026-02-18",
  },
  {
    id: "r10",
    productId: "10",
    userName: "Chris B.",
    userAvatar: "CB",
    rating: 5,
    comment: "Bamboo is so much more sustainable than regular paper towels. Compostable packaging is a huge plus.",
    category: "Overall",
    date: "2026-03-05",
  },
  {
    id: "r11",
    productId: "2",
    userName: "Olivia N.",
    userAvatar: "ON",
    rating: 3,
    comment: "Almond farming uses a lot of water and this one is imported. Switched to oat milk instead.",
    category: "Sourcing",
    date: "2026-02-22",
  },
  {
    id: "r12",
    productId: "13",
    userName: "Jake F.",
    userAvatar: "JF",
    rating: 2,
    comment: "Way too much single-use plastic. The styrofoam cup can't be recycled at all.",
    category: "Packaging",
    date: "2026-02-10",
  },
  {
    id: "r13",
    productId: "15",
    userName: "Mia S.",
    userAvatar: "MS",
    rating: 2,
    comment: "Cardboard box is fine but the inner plastic tray and wrap are wasteful. High carbon from frozen transport.",
    category: "Carbon",
    date: "2026-02-14",
  },
  {
    id: "r14",
    productId: "11",
    userName: "Ben C.",
    userAvatar: "BC",
    rating: 2,
    comment: "Wrapped in plastic, bleached paper, shipped from overseas. Bamboo alternatives are so much better.",
    category: "Overall",
    date: "2026-02-08",
  },
  {
    id: "r15",
    productId: "16",
    userName: "Sophie W.",
    userAvatar: "SW",
    rating: 3,
    comment: "Each bag inside is non-recyclable plastic film. Wish they'd switch to compostable packaging.",
    category: "Packaging",
    date: "2026-02-19",
  },
];

// ─── Eco Tips ───────────────────────────────────────────────────────────────

export const ECO_TIPS: EcoTip[] = [
  {
    id: "t1",
    title: "Choose Local",
    description: "Locally sourced products have a smaller carbon footprint from transportation.",
    icon: "globe.americas.fill",
  },
  {
    id: "t2",
    title: "Check Packaging",
    description: "Look for products with recyclable or compostable packaging to reduce waste.",
    icon: "shippingbox.fill",
  },
  {
    id: "t3",
    title: "Buy Seasonal",
    description: "Seasonal produce requires less energy for growing and storing.",
    icon: "leaf.fill",
  },
  {
    id: "t4",
    title: "Reduce Plastic",
    description: "Opt for products with minimal or no plastic packaging when possible.",
    icon: "arrow.counterclockwise",
  },
];

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductByBarcode(barcode: string): Product | undefined {
  return PRODUCTS.find((p) => p.barcode === barcode);
}

export function getReviewsForProduct(productId: string): Review[] {
  return REVIEWS.filter((r) => r.productId === productId);
}

export function getAlternatives(product: Product): Product[] {
  return product.alternativeIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined && p.score > product.score);
}
