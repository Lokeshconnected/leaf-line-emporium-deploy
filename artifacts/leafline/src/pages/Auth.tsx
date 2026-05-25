import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/api";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setAuth } = useAuthStore();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login" ? { email, password } : { name, email, password };

      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Something went wrong");
        return;
      }

      const data = await res.json();
      setAuth(data.token, data.user);

      setSuccess(mode === "login" ? "Welcome back!" : "Account created!");
      setTimeout(() => navigate("/shop"), 800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-background rounded-2xl shadow-xl border border-border/50 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-green-700 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-1">
            {mode === "login" ? "Welcome back" : "Join LEAFLINE"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {mode === "login"
              ? "Sign in to your plant sanctuary"
              : "Create your account and start your plant journey"}
          </p>

          {/* Toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "login" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "register" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 px-4 py-2.5 rounded-lg"
              >
                <CheckCircle className="w-4 h-4" />
                {success}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-3.5 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}
