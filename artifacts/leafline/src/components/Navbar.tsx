import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, Leaf, ShoppingBag, User, Package, Heart, Bot, LogOut, Gift } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [location, navigate] = useLocation();
  const { totalItems, openCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const cartCount = totalItems();
  const isHome = location === "/" || location === "";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/assistant", label: <span className="flex items-center gap-1"><Bot className="w-3.5 h-3.5" />AI Plant Care</span>, labelStr: "AI Plant Care" },
    { href: "/donate", label: <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5" />Donate</span>, labelStr: "Donate" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[4.5rem] lg:h-24">
            {/* Logo */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-2 group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  LEAFLINE
                </span>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className={`px-4 py-2.5 text-base font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                      location.startsWith(link.href)
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.labelStr || link.label}
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              {mounted && (
                <motion.button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-accent transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                      <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun className="w-5 h-5 text-foreground" />
                      </motion.div>
                    ) : (
                      <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon className="w-5 h-5 text-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {isAuthenticated && (
                <>
                  <Link href="/orders">
                    <motion.div className="hidden lg:flex w-11 h-11 rounded-xl items-center justify-center hover:bg-accent transition-colors duration-200 cursor-pointer" title="Orders" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Package className="w-5 h-5 text-foreground" />
                    </motion.div>
                  </Link>
                  <Link href="/donations">
                    <motion.div className="hidden lg:flex w-11 h-11 rounded-xl items-center justify-center hover:bg-accent transition-colors duration-200 cursor-pointer" title="My Donations" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Heart className="w-5 h-5 text-foreground" />
                    </motion.div>
                  </Link>
                </>
              )}

              <motion.button
                onClick={openCart}
                className="relative w-11 h-11 rounded-xl flex items-center justify-center hover:bg-accent transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5 text-foreground" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-[11px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </motion.button>

              {isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-1">
                  <span className="text-base text-muted-foreground px-2">{user?.name?.split(" ")[0]}</span>
                  <motion.button
                    onClick={handleLogout}
                    className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-accent transition-colors duration-200 text-muted-foreground hover:text-foreground"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <Link href="/auth">
                  <motion.div
                    className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-base font-semibold rounded-xl hover:opacity-90 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </motion.div>
                </Link>
              )}

              <motion.button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center hover:bg-accent transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-[4.5rem] left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg lg:hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {mainLinks.map((link, i) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {link.labelStr || link.href.slice(1)}
                  </motion.div>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link href="/orders"><div onClick={() => setMobileOpen(false)} className="px-4 py-3.5 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer">Orders</div></Link>
                  <Link href="/donations"><div onClick={() => setMobileOpen(false)} className="px-4 py-3.5 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer">My Donations</div></Link>
                  <button onClick={handleLogout} className="text-left px-4 py-3.5 rounded-xl text-base font-medium text-red-500 hover:bg-accent/50">Sign Out</button>
                </>
              ) : (
                <Link href="/auth"><div onClick={() => setMobileOpen(false)} className="px-4 py-3.5 rounded-xl text-base font-medium text-green-600 hover:bg-accent/50 cursor-pointer">Sign In / Register</div></Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
