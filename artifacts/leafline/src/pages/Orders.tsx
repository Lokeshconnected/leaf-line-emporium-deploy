import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Leaf, Loader2, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/api";

interface OrderItem {
  plantName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30", label: "Pending" },
  processing: { icon: <Package className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30", label: "Processing" },
  shipped: { icon: <Truck className="w-4 h-4" />, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30", label: "Shipped" },
  delivered: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600 bg-green-50 dark:bg-green-950/30", label: "Delivered" },
  cancelled: { icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50 dark:bg-red-950/30", label: "Cancelled" },
};

export default function Orders() {
  const { token, isAuthenticated } = useAuthStore();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth"); return; }
    apiFetch("/orders", {}, token!)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setOrders(data) : null)
      .finally(() => setLoading(false));
  }, [isAuthenticated, token, navigate]);

  return (
    <div className="min-h-screen pt-20 pb-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-7 h-7 text-green-600" />
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Your orders will appear here after your first purchase.</p>
              <button onClick={() => navigate("/shop")} className="px-6 py-2.5 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors">Start Shopping</button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-background border border-border rounded-2xl p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </div>
                        <span className="text-lg font-bold text-foreground">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.map((item, j) => (
                        <div key={j} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.plantName}</span>
                          <span className="text-muted-foreground">×{item.quantity} — ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>📦 {order.shippingName}</span>
                      <span>📍 {order.shippingCity}, {order.shippingZip}</span>
                      <span>💳 {order.paymentMethod?.replace("_", " ")}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
