export interface FallbackPlant {
  id: number;
  name: string;
  scientificName: string;
  price: number;
  originalPrice: number | null;
  category: string;
  difficulty: string;
  lightRequirement: string;
  wateringFrequency: string;
  petSafe: boolean;
  airPurificationRating: number;
  indoor: boolean;
  description: string;
  careInstructions: string;
  recommendedPlacement: string;
  growthSpeed: string;
  humidityRequirement: string;
  emoji: string;
  gradient: string;
  badge: string | null;
  popularity: number;
}

export const fallbackPlants: FallbackPlant[] = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    price: 68,
    originalPrice: 89,
    category: "Tropical",
    difficulty: "Easy",
    lightRequirement: "Indirect bright",
    wateringFrequency: "Weekly",
    petSafe: false,
    airPurificationRating: 4,
    indoor: true,
    description: "The iconic split-leaf philodendron that defines modern interiors. Each leaf is a masterpiece of natural design.",
    careInstructions: "Water when the top 2 inches of soil are dry and rotate monthly for even growth.",
    recommendedPlacement: "Bright living room corners away from harsh afternoon sun",
    growthSpeed: "Moderate",
    humidityRequirement: "Medium",
    emoji: "🌿",
    gradient: "from-emerald-400/20 to-green-600/10",
    badge: "Bestseller",
    popularity: 95,
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    scientificName: "Ficus lyrata",
    price: 95,
    originalPrice: null,
    category: "Statement",
    difficulty: "Moderate",
    lightRequirement: "Bright indirect",
    wateringFrequency: "Bi-weekly",
    petSafe: false,
    airPurificationRating: 3,
    indoor: true,
    description: "A dramatic statement plant with large, violin-shaped leaves that commands attention in any space.",
    careInstructions: "Keep lighting consistent and let the top layer of soil dry slightly between waterings.",
    recommendedPlacement: "Well-lit corners with stable temperature and no drafts",
    growthSpeed: "Slow",
    humidityRequirement: "Medium",
    emoji: "🌱",
    gradient: "from-lime-400/20 to-emerald-600/10",
    badge: "Premium",
    popularity: 88,
  },
  {
    id: 3,
    name: "Pothos Golden",
    scientificName: "Epipremnum aureum",
    price: 28,
    originalPrice: null,
    category: "Trailing",
    difficulty: "Easy",
    lightRequirement: "Low to bright",
    wateringFrequency: "Weekly",
    petSafe: false,
    airPurificationRating: 5,
    indoor: true,
    description: "The ultimate beginner plant. Its cascading heart-shaped leaves bring life to shelves and hanging baskets.",
    careInstructions: "Water when soil dries out and trim vines occasionally to encourage bushier growth.",
    recommendedPlacement: "Shelves, bookcases, and hanging planters",
    growthSpeed: "Fast",
    humidityRequirement: "Low",
    emoji: "🪴",
    gradient: "from-yellow-400/20 to-lime-600/10",
    badge: "New Arrival",
    popularity: 92,
  },
  {
    id: 4,
    name: "Snake Plant",
    scientificName: "Sansevieria trifasciata",
    price: 42,
    originalPrice: 55,
    category: "Succulent",
    difficulty: "Easy",
    lightRequirement: "Any light",
    wateringFrequency: "Monthly",
    petSafe: false,
    airPurificationRating: 5,
    indoor: true,
    description: "Nearly indestructible and strikingly architectural. The perfect plant for minimalist and modern aesthetics.",
    careInstructions: "Use fast-draining soil and water sparingly, especially during cooler months.",
    recommendedPlacement: "Bedrooms, offices, and low-light corners",
    growthSpeed: "Slow",
    humidityRequirement: "Low",
    emoji: "🌵",
    gradient: "from-teal-400/20 to-cyan-600/10",
    badge: null,
    popularity: 97,
  },
  {
    id: 5,
    name: "Pink Princess Philodendron",
    scientificName: "Philodendron erubescens",
    price: 145,
    originalPrice: null,
    category: "Rare",
    difficulty: "Moderate",
    lightRequirement: "Bright indirect",
    wateringFrequency: "Weekly",
    petSafe: false,
    airPurificationRating: 4,
    indoor: true,
    description: "A collector's dream with stunning pink variegation. Each leaf is uniquely patterned and one of a kind.",
    careInstructions: "Provide bright indirect light and higher humidity to support strong variegation.",
    recommendedPlacement: "Bright rooms near east-facing windows",
    growthSpeed: "Moderate",
    humidityRequirement: "High",
    emoji: "🌸",
    gradient: "from-pink-400/20 to-rose-600/10",
    badge: "Rare Find",
    popularity: 78,
  },
  {
    id: 6,
    name: "Bird of Paradise",
    scientificName: "Strelitzia reginae",
    price: 120,
    originalPrice: null,
    category: "Tropical",
    difficulty: "Moderate",
    lightRequirement: "Full sun",
    wateringFrequency: "Weekly",
    petSafe: false,
    airPurificationRating: 3,
    indoor: true,
    description: "Commanding presence with enormous paddle-shaped leaves. Creates an instant tropical ambiance in any room.",
    careInstructions: "Give it maximum light and water deeply once the top inch of soil has dried.",
    recommendedPlacement: "Sunrooms and bright spots near south-facing windows",
    growthSpeed: "Slow",
    humidityRequirement: "Medium",
    emoji: "🌴",
    gradient: "from-orange-400/20 to-amber-600/10",
    badge: "Popular",
    popularity: 85,
  },
];
