import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Instagram, Twitter, Youtube, Facebook, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { scrollToSection } from "@/hooks/useLenis";

const footerLinks = {
  Shop: [
    { label: "Tropical Plants", href: "/shop?category=Tropical" },
    { label: "Succulents", href: "/shop?category=Succulent" },
    { label: "Rare & Exotic", href: "/shop?category=Rare" },
    { label: "Trailing Vines", href: "/shop?category=Trailing" },
    { label: "Gift Sets", href: "/shop?sortBy=popularity" },
  ],
  Learn: [
    { label: "Plant Care Guides", href: "/learn/plant-care-guides" },
    { label: "Blog", href: "/learn/blog" },
    { label: "FAQs", href: "/learn/faqs" },
    { label: "Plant Doctor", href: "/learn/plant-doctor" },
    { label: "Community", href: "/learn/community" },
  ],
  Company: [
    { label: "About Us", href: "/company/about-us" },
    { label: "Careers", href: "/company/careers" },
    { label: "Press", href: "/company/press" },
    { label: "Partners", href: "/company/partners" },
    { label: "Sustainability", href: "/company/sustainability" },
  ],
};

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/", label: "Instagram" },
  { icon: Twitter, href: "https://x.com/", label: "Twitter" },
  { icon: Youtube, href: "https://www.youtube.com/", label: "Youtube" },
  { icon: Facebook, href: "https://www.facebook.com/", label: "Facebook" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [location, navigate] = useLocation();

  const handleSubscribe = () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    const existing = JSON.parse(window.localStorage.getItem("leafline-newsletter-subscribers") ?? "[]") as string[];
    const next = Array.from(new Set([...existing, trimmed]));
    window.localStorage.setItem("leafline-newsletter-subscribers", JSON.stringify(next));
    setSubscribed(true);
    setEmail("");
    window.setTimeout(() => setSubscribed(false), 3500);
  };

  const handleBrandClick = () => {
    if (location === "/" || location === "") {
      scrollToSection("home");
      return;
    }
    navigate("/");
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter bar */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-xl font-black text-foreground mb-1">
                Join the LEAFLINE Community
              </h3>
              <p className="text-sm text-muted-foreground">
                Get care tips, exclusive deals, and new arrivals delivered weekly.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex-1 md:w-64 px-4 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <motion.button
                type="button"
                onClick={handleSubscribe}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl whitespace-nowrap hover:opacity-90 transition-all"
              >
                Subscribe
              </motion.button>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Saved locally for demo updates.
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <motion.button
              onClick={handleBrandClick}
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">LEAFLINE</span>
            </motion.button>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Bringing the beauty of nature into modern living spaces — one premium plant at a time.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>
                      <div
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 group transition-colors duration-200"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LEAFLINE. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy Policy", href: "/legal/privacy-policy" },
              { label: "Terms of Service", href: "/legal/terms-of-service" },
              { label: "Cookies", href: "/legal/cookies" },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <div
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
