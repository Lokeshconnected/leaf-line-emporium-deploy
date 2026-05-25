import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShoppingCart, Heart, Eye, Droplets, Sun, Star } from "lucide-react";
import type { Plant } from "@/data/products";

const badgeColors: Record<string, string> = {
  "Bestseller": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Premium": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "New Arrival": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Rare Find": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  "Popular": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

const careColors: Record<string, string> = {
  "Easy": "text-emerald-600 dark:text-emerald-400",
  "Moderate": "text-amber-600 dark:text-amber-400",
  "Expert": "text-red-600 dark:text-red-400",
};

interface ProductCardProps {
  plant: Plant;
  index: number;
}

export default function ProductCard({ plant, index }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-card border border-card-border rounded-3xl overflow-hidden cursor-pointer"
      whileHover={{ y: -8, boxShadow: "0 32px 64px rgba(0,0,0,0.12)" }}
      style={{ transition: "box-shadow 0.4s ease" }}
    >
      {/* Plant display area */}
      <div className={`relative h-60 bg-gradient-to-br ${plant.gradient} overflow-hidden`}>
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Plant emoji — zoom on hover */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-9xl select-none"
          animate={{ scale: hovered ? 1.15 : 1, rotate: hovered ? 3 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {plant.emoji}
        </motion.div>

        {/* Badge */}
        {plant.badge && (
          <div
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColors[plant.badge]}`}
          >
            {plant.badge}
          </div>
        )}

        {/* Like button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
          />
        </motion.button>

        {/* Quick view — appears on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <button className="flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold rounded-xl border border-border shadow-lg">
                <Eye className="w-3.5 h-3.5" />
                Quick View
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name and category */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight">{plant.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 italic">{plant.scientific}</p>
          </div>
          <div className="flex-shrink-0">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {plant.description}
        </p>

        {/* Care info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{plant.light}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>{plant.water}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <span className={`text-xs font-semibold ${careColors[plant.care]}`}>
            {plant.care}
          </span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">${plant.price}</span>
            {plant.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${plant.originalPrice}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              added
                ? "bg-emerald-500 text-white"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {added ? "Added!" : "Add"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
