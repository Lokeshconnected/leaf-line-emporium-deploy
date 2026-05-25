import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingBag, Droplets, Sun, Wind, Loader2, Star, AlertCircle, CheckCircle2, CalendarDays, Home, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { apiFetch, getApiBase } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { buildCareTimeline, calculatePlantFit, downloadCareCalendar, type FitPreferences } from "@/lib/plantIntelligence";

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

interface PlantDetailProps {
  params: { id: string };
}

export default function PlantDetail({ params }: PlantDetailProps) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [fitPreferences, setFitPreferences] = useState<FitPreferences>({
    roomLight: "medium",
    routine: "steady",
    humidity: "balanced",
    hasPets: false,
  });
  const [, navigate] = useLocation();
  const { addItem, openCart } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/plants/${params.id}`);
        if (!res.ok) { setError("Plant not found"); return; }
        const data = await res.json();
        setPlant(data);
      } catch {
        setError("Failed to load plant");
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
  }, [params.id]);

  useEffect(() => {
    if (isAuthenticated && token) {
      apiFetch("/wishlist", {}, token).then(r => r.json())
        .then(data => Array.isArray(data) ? setInWishlist(data.includes(parseInt(params.id))) : null)
        .catch(() => {});
    }
  }, [isAuthenticated, token, params.id]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) { navigate("/auth"); return; }
    if (inWishlist) {
      await apiFetch(`/wishlist/${plant!.id}`, { method: "DELETE" }, token!);
      setInWishlist(false);
    } else {
      await apiFetch("/wishlist", { method: "POST", body: JSON.stringify({ plantId: plant!.id }) }, token!);
      setInWishlist(true);
    }
  };

  const addToCart = async () => {
    if (!plant) return;
    setAddingToCart(true);
    try {
      if (isAuthenticated && token) {
        const res = await apiFetch("/cart/items", { method: "POST", body: JSON.stringify({ plantId: plant.id, quantity: qty }) }, token);
        const data = await res.json();
        addItem(data);
      } else {
        addItem({
          id: Date.now(),
          plantId: plant.id,
          quantity: qty,
          plant: { id: plant.id, name: plant.name, scientificName: plant.scientificName, price: plant.price, originalPrice: plant.originalPrice, category: plant.category, emoji: plant.emoji, gradient: plant.gradient, badge: plant.badge },
        });
      }
      setAddedToCart(true);
      setTimeout(() => { setAddedToCart(false); openCart(); }, 600);
    } catch {
      // ignore
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  if (error || !plant) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
      <AlertCircle className="w-12 h-12 text-muted-foreground" />
      <p className="text-xl font-semibold">{error || "Plant not found"}</p>
      <button onClick={() => navigate("/shop")} className="px-6 py-2.5 bg-green-700 text-white rounded-full hover:bg-green-600 transition-colors">Back to Shop</button>
    </div>
  );

  const discount = plant.originalPrice ? Math.round((1 - plant.price / plant.originalPrice) * 100) : null;
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(plant.airPurificationRating));
  const fitResult = calculatePlantFit(plant, fitPreferences);
  const upcomingCare = buildCareTimeline(plant).slice(0, 4);

  const handleCalendarDownload = () => {
    downloadCareCalendar(plant);
    toast({
      title: "Care calendar downloaded",
      description: `A reminder plan for ${plant.name} is ready to import into your calendar.`,
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <motion.button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 mb-8 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Plant visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`relative h-80 sm:h-96 lg:h-[480px] rounded-3xl bg-gradient-to-br ${plant.gradient} flex items-center justify-center overflow-hidden`}>
              <motion.span
                className="text-8xl sm:text-[120px] select-none"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {plant.emoji}
              </motion.span>
              {plant.badge && (
                <div className="absolute top-5 left-5 px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-full">
                  {plant.badge}
                </div>
              )}
              {discount && (
                <div className="absolute top-5 right-5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Care quick icons */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: <Sun className="w-5 h-5 text-amber-500" />, label: "Light", value: plant.lightRequirement },
                { icon: <Droplets className="w-5 h-5 text-blue-500" />, label: "Water", value: plant.wateringFrequency },
                { icon: <Wind className="w-5 h-5 text-teal-500" />, label: "Humidity", value: plant.humidityRequirement },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                  <div className="flex justify-center mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-sm text-muted-foreground italic">{plant.scientificName}</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{plant.name}</h1>
              </div>
              <button onClick={toggleWishlist} className="mt-1 p-2.5 rounded-full border border-border hover:bg-accent transition-colors flex-shrink-0">
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${plant.difficulty === "Easy" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : plant.difficulty === "Moderate" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"}`}>
                {plant.difficulty}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{plant.category}</span>
              {plant.petSafe && <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-semibold">🐾 Pet Safe</span>}
              {plant.indoor && <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">Indoor</span>}
            </div>

            {/* Air purification */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground">Air Purification</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < plant.airPurificationRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">{plant.description}</p>

            {/* Care instructions */}
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">Care Instructions</h3>
              <p className="text-sm text-green-700 dark:text-green-300">{plant.careInstructions}</p>
              <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-900">
                <p className="text-xs text-green-600 dark:text-green-500">
                  <strong>Best placement:</strong> {plant.recommendedPlacement}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-5 mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-foreground">Home Fit Estimator</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Match this plant against your room conditions before you buy.</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{fitResult.score}<span className="text-sm text-muted-foreground">/100</span></p>
                  <p className="text-xs text-muted-foreground">Compatibility score</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <label className="text-sm">
                  <span className="block mb-1.5 text-muted-foreground">Room light</span>
                  <select value={fitPreferences.roomLight} onChange={(e) => setFitPreferences((current) => ({ ...current, roomLight: e.target.value as FitPreferences["roomLight"] }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5">
                    <option value="low">Low light</option>
                    <option value="medium">Medium light</option>
                    <option value="bright">Bright light</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="block mb-1.5 text-muted-foreground">Care routine</span>
                  <select value={fitPreferences.routine} onChange={(e) => setFitPreferences((current) => ({ ...current, routine: e.target.value as FitPreferences["routine"] }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5">
                    <option value="light-touch">Low maintenance</option>
                    <option value="steady">Steady routine</option>
                    <option value="hands-on">Hands-on care</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="block mb-1.5 text-muted-foreground">Humidity</span>
                  <select value={fitPreferences.humidity} onChange={(e) => setFitPreferences((current) => ({ ...current, humidity: e.target.value as FitPreferences["humidity"] }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5">
                    <option value="dry">Dry room</option>
                    <option value="balanced">Balanced room</option>
                    <option value="humid">Humid room</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-sm">
                  <input type="checkbox" checked={fitPreferences.hasPets} onChange={(e) => setFitPreferences((current) => ({ ...current, hasPets: e.target.checked }))} className="h-4 w-4 accent-green-600" />
                  <span>I have pets at home</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-background p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <p className="font-semibold">Why it fits</p>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    {fitResult.strengths.map((strength) => (
                      <p key={strength}>{strength}</p>
                    ))}
                    {fitResult.strengths.length === 0 ? <p>No major strengths detected for this setup yet.</p> : null}
                  </div>
                </div>
                <div className="rounded-xl bg-background p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <p className="font-semibold">Watch-outs</p>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    {fitResult.cautions.map((caution) => (
                      <p key={caution}>{caution}</p>
                    ))}
                    {fitResult.cautions.length === 0 ? <p>This setup looks low-risk for the care profile shown here.</p> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5 mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-foreground">Care Calendar Export</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Download a ready-to-import reminder plan for your calendar app.</p>
                </div>
                <button onClick={handleCalendarDownload} className="px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
                  Download .ics
                </button>
              </div>

              <div className="space-y-3">
                {upcomingCare.map((event) => (
                  <div key={`${event.title}-${event.date.toISOString()}`} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-foreground">{event.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground">{event.date.toLocaleDateString(undefined, { weekday: "short" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Cart */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-foreground">${plant.price.toFixed(2)}</span>
                {plant.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">${plant.originalPrice.toFixed(2)}</span>
                )}
                {discount && <span className="text-sm font-semibold text-red-500">Save {discount}%</span>}
              </div>

              <div className="flex gap-3">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-3 hover:bg-accent transition-colors">-</button>
                  <span className="w-10 text-center font-medium">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-3 py-3 hover:bg-accent transition-colors">+</button>
                </div>
                <motion.button
                  onClick={addToCart}
                  disabled={addingToCart || addedToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all ${addedToCart ? "bg-green-500 text-white" : "bg-green-700 hover:bg-green-600 text-white"}`}
                  whileTap={{ scale: 0.98 }}
                >
                  {addingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : addedToCart ? (
                    <><CheckCircle2 className="w-4 h-4" />Added!</>
                  ) : (
                    <><ShoppingBag className="w-4 h-4" />Add to Cart — ${(plant.price * qty).toFixed(2)}</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
