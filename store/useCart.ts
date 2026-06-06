import create from 'zustand'

type CartItem = { productId: number; quantity: number }

type CartState = {
  items: CartItem[]
  add: (productId: number, qty?: number) => void
  remove: (productId: number) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (productId, qty = 1) => set((s) => ({ items: [...s.items.filter(i=>i.productId!==productId), { productId, quantity: qty }] })),
  remove: (productId) => set((s) => ({ items: s.items.filter(i=>i.productId!==productId) })),
  clear: () => set({ items: [] }),
}))
