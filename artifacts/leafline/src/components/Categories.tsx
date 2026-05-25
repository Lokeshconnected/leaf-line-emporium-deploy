import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { categories } from "@/data/products";

const categoryRoutes: Record<string, string> = {
  Tropical: "/shop?category=Tropical",
  Succulents: "/shop?category=Succulent",
  "Rare & Exotic": "/shop?category=Rare",
  "Trailing Vines": "/shop?category=Trailing",
};

export default function Categories() {
  return (
    <section id="categories" className="py-24 lg:py-32 bg-accent/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            🗂️ Browse Categories
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight">
            Find Your Perfect<br />
            <span className="text-primary">Plant Match</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Whether you're a seasoned plant parent or just starting your green journey, we have the perfect collection for you.
          </p>
        </motion.div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <Link key={cat.name} href={categoryRoutes[cat.name] ?? "/shop"}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl bg-card border border-card-border cursor-pointer p-7"
                style={{ transition: "box-shadow 0.3s ease" }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-8 transition-opacity duration-500`}
                />
                <div className="text-5xl mb-5">{cat.emoji}</div>
                <h3 className="font-black text-xl text-foreground mb-1.5">{cat.name}</h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-5">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-primary">
                    {cat.count} plants
                  </span>
                  <motion.div
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary))" }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
