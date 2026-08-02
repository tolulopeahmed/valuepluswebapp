// The public storefront's cart — anonymous buyers, so this is pure
// localStorage state, same SSR-safe shape as lib/referral.ts's
// getStoredReferrerEmail/clearStoredReferrerEmail (every function
// guards on `typeof window === "undefined"` first).
const STORAGE_KEY = "vp_cart";
// Fired on every mutation so the Navbar's cart badge (and the cart page
// itself, if open in another tab) can react without polling or prop
// drilling — referral.ts has no equivalent because nothing renders a
// live count off it.
const CHANGE_EVENT = "vp:cart-changed";

// A physical copy is printed to order — ValuePlus fulfills straight from
// the press, so a single-copy order isn't economical the way an Ebook
// (zero marginal cost, no press run) is. Mirrors apps.storefront.
// services.PHYSICAL_FORMATS/MIN_PHYSICAL_QUANTITY server-side, which is
// the actual enforcement point — this just keeps the UI (BuyBox's
// stepper, cart quantity controls) from ever showing/allowing something
// checkout would reject anyway.
export const MIN_PHYSICAL_QUANTITY = 50;
const PHYSICAL_FORMATS = new Set(["Paperback", "Hardback"]);

export function minQuantityFor(format: string): number {
  return PHYSICAL_FORMATS.has(format) ? MIN_PHYSICAL_QUANTITY : 1;
}

export interface CartItem {
  bookId: string;
  // Stored alongside bookId so the cart/checkout pages can re-fetch each
  // book's live public detail via the existing GET /books/public/<slug>/
  // endpoint (slug-keyed for SEO-friendly URLs) — checkout itself still
  // submits bookId, which is what the backend actually validates against.
  slug: string;
  quantity: number;
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(bookId: string, slug: string, quantity: number) {
  const items = readCart();
  const existing = items.find((i) => i.bookId === bookId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ bookId, slug, quantity });
  }
  writeCart(items);
}

export function updateCartQuantity(bookId: string, quantity: number) {
  const items = readCart();
  if (quantity <= 0) {
    writeCart(items.filter((i) => i.bookId !== bookId));
    return;
  }
  const existing = items.find((i) => i.bookId === bookId);
  if (existing) existing.quantity = quantity;
  writeCart(items);
}

export function removeFromCart(bookId: string) {
  writeCart(readCart().filter((i) => i.bookId !== bookId));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getCartCount(): number {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

// Subscribes to both same-tab mutations (writeCart's own dispatched
// event) and cross-tab ones (the native "storage" event, which only
// fires in OTHER tabs, never the one that made the change) — together
// they cover every way the cart can change while this is mounted.
export function subscribeToCartChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
