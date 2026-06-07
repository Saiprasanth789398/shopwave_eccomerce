import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Auth ────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);

// ── Theme ────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const t = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', t);
        set({ theme: t });
      },
      initTheme: () => {
        const t = get().theme || 'light';
        document.documentElement.setAttribute('data-theme', t);
      },
    }),
    { name: 'theme-store' }
  )
);

// ── Cart ─────────────────────────────────────────────────
export const useCartStore = create((set) => ({
  cart: null,
  itemCount: 0,
  setCart: (cart) => {
    const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
    set({ cart, itemCount });
  },
  clearCartStore: () => set({ cart: null, itemCount: 0 }),
}));

// ── Wishlist ──────────────────────────────────────────────
export const useWishlistStore = create((set) => ({
  wishlist: [],
  wishlistIds: new Set(),
  setWishlist: (items) => set({ wishlist: items, wishlistIds: new Set(items.map((p) => p._id)) }),
  toggleItem: (id) =>
    set((s) => {
      const ids = new Set(s.wishlistIds);
      if (ids.has(id)) { ids.delete(id); return { wishlistIds: ids, wishlist: s.wishlist.filter((p) => p._id !== id) }; }
      ids.add(id);
      return { wishlistIds: ids };
    }),
}));
