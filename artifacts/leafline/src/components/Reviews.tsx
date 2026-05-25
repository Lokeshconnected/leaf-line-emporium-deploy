import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/products";

const avatarColors = [
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-orange-400 to-amber-500",
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 lg:py-32 bg-accent/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            ⭐ Customer Stories
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight">
            Loved by Plant<br />
            <span className="text-primary">Enthusiasts</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our community of plant lovers has to say.
          </p>

          {/* Overall rating */}
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-background rounded-2xl border border-border shadow-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-black text-foreground">4.9</span>
            <span className="text-muted-foreground text-sm">out of 5 · 2,400+ reviews</span>
          </div>
        </motion.div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="relative bg-card border border-card-border rounded-3xl p-7 flex flex-col"
              style={{ transition: "box-shadow 0.3s ease" }}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-accent flex items-center justify-center opacity-50">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-foreground/80 leading-relaxed flex-1 mb-6">
                "{review.text}"
              </p>

              {/* Plant purchased */}
              <div className="px-3 py-1.5 rounded-full bg-accent border border-border text-xs font-medium text-primary inline-flex items-center gap-1.5 self-start mb-5">
                <span>🪴</span>
                {review.plant}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {review.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{review.name}</div>
                  <div className="text-xs text-muted-foreground">{review.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
