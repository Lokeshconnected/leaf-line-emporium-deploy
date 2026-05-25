import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Star, Loader2 } from "lucide-react";
import { useLocation, Link } from "wouter";
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
  emoji: string;
  gradient: string;
  badge: string | null;
  popularity: number;
  petSafe: boolean;
  airPurificationRating: number;
}

export default function FeaturedPlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { addItem, openCart } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetch(`${getApiBase()}/api/plants?sortBy=popularity`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setPlants(data.slice(0, 6)) : null)
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (plant: Plant, e: React.MouseEvent) => {
    e.preventDefault();
    setAddingId(plant.id);
    try {
      if (isAuthenticated && token) {
        const res = await apiFetch("/cart/items", { method: "POST", body: JSON.stringify({ plantId: plant.id, quantity: 1 }) }, token);
        const data = await res.json();
        addItem(data);
      } else {
        addItem({
          id: Date.now(), plantId: plant.id, quantity: 1,
          plant: { id: plant.id, name: plant.name, scientificName: plant.scientificName, price: plant.price, originalPrice: plant.originalPrice, category: plant.category, emoji: plant.emoji, gradient: plant.gradient, badge: plant.badge },
        });
      }
      openCart();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <section id="products" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              🌱 Featured Collection
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight">
              Hand-Picked<br />
              <span className="text-primary">Living Art</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">
              Every plant in our collection is selected by our botanists for exceptional quality, beauty, and character.
            </p>
          </motion.div>

          <Link href="/shop">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-shrink-0 flex items-center gap-2 text-base font-semibold text-primary hover:gap-3 transition-all duration-300 cursor-pointer"
              whileHover={{ x: 4 }}
            >
              View all 50 plants
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant, i) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/plant/${plant.id}`}>
                  <div className="group cursor-pointer bg-background border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-green-200 dark:hover:border-green-900 transition-all duration-300">
                    <div className={`relative h-52 bg-gradient-to-br ${plant.gradient} flex items-center justify-center`}>
                      <motion.span
                        className="text-6xl select-none"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {plant.emoji}
                      </motion.span>
                      {plant.badge && (
                        <span className="absolute top-3 left-3 px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-full">
                          {plant.badge}
                        </span>
                      )}
                      <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-background/80 backdrop-blur px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{(plant.popularity / 20).toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-sm text-muted-foreground italic mb-1">{plant.scientificName}</p>
                      <h3 className="text-lg font-bold text-foreground mb-1">{plant.name}</h3>
                      <div className="flex gap-1 mb-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${plant.difficulty === "Easy" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : plant.difficulty === "Moderate" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"}`}>
                          {plant.difficulty}
                        </span>
                        {plant.petSafe && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-semibold">Pet Safe</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-foreground">${plant.price.toFixed(2)}</span>
                          {plant.originalPrice && <span className="text-sm text-muted-foreground line-through ml-1">${plant.originalPrice.toFixed(2)}</span>}
                        </div>
                        <button
                          onClick={e => addToCart(plant, e)}
                          disabled={addingId === plant.id}
                          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          {addingId === plant.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingBag className="w-3 h-3" />}
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-2xl text-base font-semibold hover:bg-accent transition-all duration-300"
          >
            View All 50 Plants
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
