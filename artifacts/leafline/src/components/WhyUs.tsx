import { motion } from "framer-motion";
import { features } from "@/data/products";

export default function WhyUs() {
  return (
    <section id="why-us" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border text-xs font-semibold text-primary uppercase tracking-wider mb-6">
              💚 Why LEAFLINE
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight mb-6">
              Not Just Plants.<br />
              <span className="text-primary">An Experience.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base mb-8">
              We believe every plant deserves a home where it can thrive, and every home deserves the transformative power of living greenery. Our commitment to quality is unwavering.
            </p>

            {/* Large stat block */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "500+", label: "Varieties", icon: "🌿" },
                { value: "20K+", label: "Customers", icon: "👥" },
                { value: "4.9/5", label: "Rating", icon: "⭐" },
                { value: "30 day", label: "Guarantee", icon: "🛡️" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-accent/50 border border-border rounded-2xl p-4"
                >
                  <span className="text-xl mb-2 block">{stat.icon}</span>
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: feature cards */}
          <div className="grid grid-cols-1 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 4 }}
                className="group flex items-start gap-5 p-5 rounded-2xl bg-card border border-card-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
