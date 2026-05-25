import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Heart, ShoppingBag, Star, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { apiFetch, getApiBase } from "@/lib/api";

interface Plant {
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
  emoji: string;
  gradient: string;
  badge: string | null;
  popularity: number;
  description: string;
}

const CATEGORIES = ["All", "Tropical", "Succulent", "Trailing", "Statement", "Rare", "Flowering", "Fern", "Cactus", "Small"];
const DIFFICULTIES = ["All", "Easy", "Moderate", "Expert"];
const SORT_OPTIONS = [
  { value: "popularity", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
];

export default function Shop() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");
  const [petSafe, setPetSafe] = useState(false);
  const [airPurifier, setAirPurifier] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const { addItem, openCart } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const categoryParam = params.get("category");
    const difficultyParam = params.get("difficulty");
    const sortParam = params.get("sortBy");
    const petSafeParam = params.get("petSafe");
    const airPurifierParam = params.get("airPurifier");

    if (searchParam) setSearch(searchParam);
    if (categoryParam && CATEGORIES.includes(categoryParam)) setCategory(categoryParam);
    if (difficultyParam && DIFFICULTIES.includes(difficultyParam)) setDifficulty(difficultyParam);
    if (sortParam && SORT_OPTIONS.some((option) => option.value === sortParam)) setSortBy(sortParam);
    if (petSafeParam === "true") setPetSafe(true);
    if (airPurifierParam === "true") setAirPurifier(true);
  }, []);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    if (difficulty !== "All") params.set("difficulty", difficulty);
    if (petSafe) params.set("petSafe", "true");
    if (airPurifier) params.set("airPurifier", "true");
    params.set("sortBy", sortBy);

    try {
      const res = await fetch(`${getApiBase()}/api/plants?${params}`);
      const data = await res.json();
      setPlants(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, category, difficulty, petSafe, airPurifier, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchPlants, 300);
    return () => clearTimeout(timer);
  }, [fetchPlants]);

  useEffect(() => {
    if (isAuthenticated && token) {
      apiFetch("/wishlist", {}, token)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setWishlist(data) : null)
        .catch(() => {});
    }
  }, [isAuthenticated, token]);

  const toggleWishlist = async (plantId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    const isInWishlist = wishlist.includes(plantId);
    if (isInWishlist) {
      await apiFetch(`/wishlist/${plantId}`, { method: "DELETE" }, token!);
      setWishlist(prev => prev.filter(id => id !== plantId));
    } else {
      await apiFetch("/wishlist", { method: "POST", body: JSON.stringify({ plantId }) }, token!);
      setWishlist(prev => [...prev, plantId]);
    }
  };

  const addToCart = async (plant: Plant, e: React.MouseEvent) => {
    e.preventDefault();
    setAddingToCart(plant.id);
    try {
      if (isAuthenticated && token) {
        const res = await apiFetch("/cart/items", {
          method: "POST",
          body: JSON.stringify({ plantId: plant.id, quantity: 1 }),
        }, token);
        const data = await res.json();
        addItem(data);
      } else {
        addItem({
          id: Date.now(),
          plantId: plant.id,
          quantity: 1,
          plant: { id: plant.id, name: plant.name, scientificName: plant.scientificName, price: plant.price, originalPrice: plant.originalPrice, category: plant.category, emoji: plant.emoji, gradient: plant.gradient, badge: plant.badge },
        });
      }
      openCart();
    } catch {
      // ignore
    } finally {
      setAddingToCart(null);
    }
  };

  const activeFiltersCount = [category !== "All", difficulty !== "All", petSafe, airPurifier].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-10 pb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">Plant Shop</h1>
          <p className="text-base text-muted-foreground">
            {loading ? "Loading..." : `${plants.length} plants available`}
          </p>
        </motion.div>

        {/* Search & Sort bar */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search plants..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="hidden sm:flex px-4 py-3 rounded-xl border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-base font-medium transition-colors ${filtersOpen || activeFiltersCount > 0 ? "bg-green-700 text-white border-green-700" : "border-border hover:bg-accent"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-white text-green-700 text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-base font-medium transition-all ${category === cat ? "bg-green-700 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-muted/30 border border-border rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Difficulty</p>
                  <div className="space-y-1">
                    {DIFFICULTIES.map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="difficulty" checked={difficulty === d} onChange={() => setDifficulty(d)} className="accent-green-600" />
                        <span className="text-base">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Sort by</p>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map(o => (
                      <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="sort" checked={sortBy === o.value} onChange={() => setSortBy(o.value)} className="accent-green-600" />
                        <span className="text-base">{o.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Special</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={petSafe} onChange={e => setPetSafe(e.target.checked)} className="accent-green-600 w-4 h-4" />
                      <span className="text-base">🐾 Pet Safe only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={airPurifier} onChange={e => setAirPurifier(e.target.checked)} className="accent-green-600 w-4 h-4" />
                      <span className="text-base">💨 Air purifiers only</span>
                    </label>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => { setCategory("All"); setDifficulty("All"); setPetSafe(false); setAirPurifier(false); }}
                      className="mt-3 text-sm text-red-500 hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-foreground mb-2">No plants found</p>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); setPetSafe(false); setAirPurifier(false); }} className="px-6 py-2.5 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors">Reset filters</button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {plants.map((plant, i) => (
                <motion.div
                  key={plant.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link href={`/plant/${plant.id}`}>
                    <div className="group relative bg-background border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-green-200 dark:hover:border-green-900 transition-all duration-300 cursor-pointer">
                      {/* Image area */}
                      <div className={`relative h-48 bg-gradient-to-br ${plant.gradient} flex items-center justify-center`}>
                        <span className="text-5xl">{plant.emoji}</span>

                        {/* Wishlist */}
                        <button
                          onClick={e => toggleWishlist(plant.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                          title={isAuthenticated ? "Add to wishlist" : "Sign in to save"}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.includes(plant.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        </button>

                        {/* Badge */}
                        {plant.badge && (
                        <span className="absolute top-3 left-3 px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-full">
                            {plant.badge}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-base text-foreground leading-tight">{plant.name}</h3>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span className="text-sm font-medium">{(plant.popularity / 20).toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic mb-2">{plant.scientificName}</p>

                        <div className="flex gap-1 mb-3 flex-wrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${plant.difficulty === "Easy" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : plant.difficulty === "Moderate" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"}`}>
                            {plant.difficulty}
                          </span>
                          {plant.petSafe && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-medium">Pet Safe</span>}
                          {plant.airPurificationRating >= 4 && <span className="text-xs px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 font-medium">Air Filter</span>}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-foreground">${plant.price.toFixed(2)}</span>
                            {plant.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-1">${plant.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <button
                            onClick={e => addToCart(plant, e)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                            disabled={addingToCart === plant.id}
                          >
                            {addingToCart === plant.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShoppingBag className="w-3 h-3" />
                            )}
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
