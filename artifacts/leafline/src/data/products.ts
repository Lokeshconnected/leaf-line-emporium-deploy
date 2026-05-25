export interface Plant {
  id: number;
  name: string;
  scientific: string;
  price: number;
  originalPrice?: number;
  category: string;
  care: "Easy" | "Moderate" | "Expert";
  light: string;
  water: string;
  description: string;
  badge?: string;
  emoji: string;
  gradient: string;
}

export const plants: Plant[] = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    scientific: "Monstera deliciosa",
    price: 68,
    originalPrice: 89,
    category: "Tropical",
    care: "Easy",
    light: "Indirect bright",
    water: "Weekly",
    description: "The iconic split-leaf philodendron that defines modern interiors. Each leaf is a masterpiece of natural design.",
    badge: "Bestseller",
    emoji: "🌿",
    gradient: "from-emerald-400/20 to-green-600/10",
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    scientific: "Ficus lyrata",
    price: 95,
    category: "Statement",
    care: "Moderate",
    light: "Bright indirect",
    water: "Bi-weekly",
    description: "A dramatic statement plant with large, violin-shaped leaves that commands attention in any space.",
    badge: "Premium",
    emoji: "🌱",
    gradient: "from-lime-400/20 to-emerald-600/10",
  },
  {
    id: 3,
    name: "Pothos Golden",
    scientific: "Epipremnum aureum",
    price: 28,
    category: "Trailing",
    care: "Easy",
    light: "Low to bright",
    water: "Weekly",
    description: "The ultimate beginner plant. Its cascading heart-shaped leaves bring life to shelves and hanging baskets.",
    badge: "New Arrival",
    emoji: "🪴",
    gradient: "from-yellow-400/20 to-lime-600/10",
  },
  {
    id: 4,
    name: "Snake Plant",
    scientific: "Sansevieria trifasciata",
    price: 42,
    originalPrice: 55,
    category: "Succulent",
    care: "Easy",
    light: "Any light",
    water: "Monthly",
    description: "Nearly indestructible and strikingly architectural. The perfect plant for minimalist and modern aesthetics.",
    emoji: "🌵",
    gradient: "from-teal-400/20 to-cyan-600/10",
  },
  {
    id: 5,
    name: "Pink Princess Philodendron",
    scientific: "Philodendron erubescens",
    price: 145,
    category: "Rare",
    care: "Moderate",
    light: "Bright indirect",
    water: "Weekly",
    description: "A collector's dream with stunning pink variegation. Each leaf is uniquely patterned — no two are alike.",
    badge: "Rare Find",
    emoji: "🌸",
    gradient: "from-pink-400/20 to-rose-600/10",
  },
  {
    id: 6,
    name: "Bird of Paradise",
    scientific: "Strelitzia reginae",
    price: 120,
    category: "Tropical",
    care: "Moderate",
    light: "Full sun",
    water: "Weekly",
    description: "Commanding presence with enormous paddle-shaped leaves. Creates an instant tropical ambiance in any room.",
    badge: "Popular",
    emoji: "🌴",
    gradient: "from-orange-400/20 to-amber-600/10",
  },
];

export const categories = [
  {
    name: "Tropical",
    description: "Lush, bold foliage from the tropics",
    count: 24,
    emoji: "🌴",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Succulents",
    description: "Low-maintenance sculptural beauties",
    count: 18,
    emoji: "🌵",
    gradient: "from-lime-500 to-green-600",
  },
  {
    name: "Rare & Exotic",
    description: "Collector-grade statement pieces",
    count: 12,
    emoji: "✨",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Trailing Vines",
    description: "Cascading beauty for shelves",
    count: 16,
    emoji: "🌿",
    gradient: "from-green-500 to-emerald-600",
  },
];

export const reviews = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Interior Designer",
    avatar: "SC",
    rating: 5,
    text: "LEAFLINE has completely transformed how I source plants for my clients. The quality is exceptional — every plant arrives pristine, healthy, and packed with care.",
    plant: "Monstera Deliciosa",
  },
  {
    id: 2,
    name: "Marcus Williams",
    role: "Plant Enthusiast",
    avatar: "MW",
    rating: 5,
    text: "The Pink Princess Philodendron I ordered is stunning. The packaging was thoughtful, and the plant guide they included was genuinely helpful.",
    plant: "Pink Princess Philodendron",
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Home Stylist",
    avatar: "PP",
    rating: 5,
    text: "I've ordered from many plant shops, but LEAFLINE stands apart. The curation is impeccable — these aren't just plants, they're living sculptures.",
    plant: "Bird of Paradise",
  },
];

export const features = [
  {
    icon: "🌱",
    title: "Expert Curation",
    description: "Every plant is hand-selected by our botanists for health, beauty, and character.",
  },
  {
    icon: "📦",
    title: "Premium Packaging",
    description: "Plants arrive secured in custom eco packaging, guaranteed to survive any journey.",
  },
  {
    icon: "💚",
    title: "30-Day Guarantee",
    description: "If your plant doesn't thrive in the first 30 days, we replace it. No questions.",
  },
  {
    icon: "📱",
    title: "Plant Care App",
    description: "Get personalized care reminders and expert advice via our companion app.",
  },
];
