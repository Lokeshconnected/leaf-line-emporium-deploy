import { create } from "zustand";

export interface CartItem {
  id: number;
  plantId: number;
  quantity: number;
  plant: {
    id: number;
    name: string;
    scientificName: string;
    price: number;
    originalPrice: number | null;
    category: string;
    emoji: string;
    gradient: string;
    badge?: string | null;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (plantId: number, quantity: number) => void;
  removeItem: (plantId: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,
  setItems: (items) => set({ items }),
  addItem: (item) => {
    const existing = get().items.find(i => i.plantId === item.plantId);
    if (existing) {
      set({ items: get().items.map(i => i.plantId === item.plantId ? { ...i, quantity: i.quantity + item.quantity } : i) });
    } else {
      set({ items: [...get().items, item] });
    }
  },
  updateItem: (plantId, quantity) =>
    set({ items: get().items.map(i => i.plantId === plantId ? { ...i, quantity } : i) }),
  removeItem: (plantId) =>
    set({ items: get().items.filter(i => i.plantId !== plantId) }),
  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.plant.price * i.quantity, 0),
}));
