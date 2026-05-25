import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { scrollToSection } from "@/hooks/useLenis";
import { useLocation } from "wouter";

const smoothEase = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: smoothEase },
  },
};

const floatingLeaves = [
  { emoji: "🌿", top: "15%", left: "8%", delay: 0, size: "text-4xl" },
  { emoji: "🍃", top: "70%", left: "5%", delay: 0.3, size: "text-3xl" },
  { emoji: "🌱", top: "25%", right: "8%", delay: 0.6, size: "text-3xl" },
  { emoji: "🪴", top: "65%", right: "6%", delay: 0.9, size: "text-4xl" },
  { emoji: "🌿", top: "45%", left: "3%", delay: 1.2, size: "text-2xl" },
  { emoji: "🍃", top: "40%", right: "4%", delay: 1.5, size: "text-2xl" },
];

export default function Hero() {
  const [, navigate] = useLocation();
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/30" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

      {/* Floating leaves */}
      {floatingLeaves.map((leaf, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            scale: [0, 1, 1, 0],
            y: [0, -20, -40, -60],
            rotate: [0, 10, -5, 15],
          }}
          transition={{
            delay: leaf.delay + 1,
            duration: 8,
            repeat: Infinity,
            repeatDelay: 4,
          }}
          className={`absolute ${leaf.size} pointer-events-none select-none`}
          style={{
            top: leaf.top,
            left: (leaf as { left?: string }).left,
            right: (leaf as { right?: string }).right,
          }}
        >
          {leaf.emoji}
        </motion.div>
      ))}

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 lg:py-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border text-sm font-medium text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Premium Plants, Curated for Modern Living</span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-[0.9] text-foreground mb-6"
          >
            <span className="block">Bring the</span>
            <span className="block relative">
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">Wild</span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: smoothEase }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-primary/15 -z-0 origin-left"
                />
              </span>
              <span className="text-foreground"> Inside</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Premium living plants, thoughtfully curated for those who appreciate nature's finest.
            Each plant is a living work of art, ready to transform your space.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate("/shop")}
              className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Collection
              <motion.div
                className="w-5 h-5"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>

            <motion.button
              onClick={() => scrollToSection("categories")}
              className="flex items-center gap-3 px-8 py-4 bg-accent text-foreground text-base font-semibold rounded-2xl border border-border hover:bg-accent/80 transition-all duration-300"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Browse Categories
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "500+", label: "Plant Varieties" },
              { value: "20K+", label: "Happy Customers" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
