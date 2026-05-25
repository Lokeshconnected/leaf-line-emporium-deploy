import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, Leaf } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api";

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateItem, removeItem, totalPrice } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();
  const [, navigate] = useLocation();

  const handleQuantityChange = async (plantId: number, newQty: number) => {
    if (!token) return;
    if (newQty <= 0) {
      await apiFetch(`/cart/items/${plantId}`, { method: "DELETE" }, token);
      removeItem(plantId);
    } else {
      await apiFetch(`/cart/items/${plantId}`, { method: "PUT", body: JSON.stringify({ quantity: newQty }) }, token);
      updateItem(plantId, newQty);
    }
  };

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate("/auth");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">Your Cart</h2>
                {items.length > 0 && (
                  <span className="text-sm text-muted-foreground">({items.length} item{items.length !== 1 ? "s" : ""})</span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Leaf className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Add some plants to get started</p>
                  </div>
                  <button
                    onClick={() => { closeCart(); navigate("/shop"); }}
                    className="px-6 py-2 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Browse Plants
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.plantId}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="flex gap-3 p-3 rounded-xl border border-border hover:border-green-200 dark:hover:border-green-900 transition-colors"
                      >
                        {/* Plant emoji */}
                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${item.plant.gradient} flex items-center justify-center text-2xl flex-shrink-0`}>
                          {item.plant.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.plant.name}</p>
                          <p className="text-xs text-muted-foreground">${item.plant.price.toFixed(2)}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleQuantityChange(item.plantId, item.quantity - 1)}
                              className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.plantId, item.quantity + 1)}
                              className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Price + Remove */}
                        <div className="flex flex-col items-end justify-between">
                          <p className="font-semibold text-sm">${(item.plant.price * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => handleQuantityChange(item.plantId, 0)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold">${totalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shipping calculated at checkout</p>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                >
                  {isAuthenticated ? "Proceed to Checkout" : "Sign In to Checkout"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
