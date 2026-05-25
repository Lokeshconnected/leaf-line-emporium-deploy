import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Package, Leaf, Loader2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/api";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [form, setForm] = useState({
    shippingName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingZip: "",
    paymentMethod: "card",
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate("/auth"); return; }
    setLoading(true);
    try {
      const res = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(form),
      }, token);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrderId(data.id);
      clearCart();
      setSuccess(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed! 🌿</h1>
        <p className="text-muted-foreground mb-2">Your plants are on their way.</p>
        {orderId && <p className="text-sm text-muted-foreground mb-8">Order #{orderId}</p>}
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate("/orders")} className="w-full py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors">View My Orders</button>
          <button onClick={() => navigate("/shop")} className="w-full py-3 border border-border rounded-xl font-medium hover:bg-accent transition-colors">Continue Shopping</button>
        </div>
      </motion.div>
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold mb-4">Your cart is empty</p>
        <button onClick={() => navigate("/shop")} className="px-6 py-2.5 bg-green-700 text-white rounded-full hover:bg-green-600 transition-colors">Shop Plants</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
          <button onClick={() => navigate("/shop")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Shopping
          </button>

          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-3 space-y-6">
                {/* Shipping */}
                <div className="bg-background border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Shipping Details</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name</label>
                      <input required value={form.shippingName} onChange={e => update("shippingName", e.target.value)} placeholder="Jane Smith" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Street Address</label>
                      <input required value={form.shippingAddress} onChange={e => update("shippingAddress", e.target.value)} placeholder="123 Garden Lane" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">City</label>
                        <input required value={form.shippingCity} onChange={e => update("shippingCity", e.target.value)} placeholder="San Francisco" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">ZIP Code</label>
                        <input required value={form.shippingZip} onChange={e => update("shippingZip", e.target.value)} placeholder="94102" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-background border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Payment Method</h2>
                  </div>
                  <div className="space-y-2">
                    {["card", "paypal", "apple_pay"].map(method => (
                      <label key={method} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.paymentMethod === method ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-border hover:bg-accent"}`}>
                        <input type="radio" name="payment" value={method} checked={form.paymentMethod === method} onChange={() => update("paymentMethod", method)} className="accent-green-600" />
                        <span className="text-sm font-medium capitalize">{method.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">🔒 This is a demo checkout. No real payment is processed.</p>
                </div>
              </div>

              {/* Right: Order summary */}
              <div className="lg:col-span-2">
                <div className="bg-background border border-border rounded-2xl p-6 sticky top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Order Summary</h2>
                  </div>

                  <div className="space-y-3 mb-4">
                    {items.map(item => (
                      <div key={item.plantId} className="flex items-center gap-3">
                        <span className="text-xl">{item.plant.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.plant.name}</p>
                          <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">${(item.plant.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span><span>${totalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span><span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                      <span>Total</span><span>${totalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-4 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
