import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  createCart,
  fetchCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  isShopifyConfigured,
  getVariantId,
} from '@/lib/shopify';

const CartContext = createContext(undefined);

// localStorage key for the persisted Shopify cart id. Replaces the legacy
// blackfeel_cart / blackfeel_checkout keys the previous client used.
const CART_ID_STORAGE_KEY = 'blackfeel_shopify_cart_id';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Prevent duplicate submissions while a mutation is in flight.
  const inFlight = useRef(false);
  // Ref to the latest removeLine callback so updateLineQuantity can call it
  // without depending on its identity (avoids exhaustive-deps warnings).
  const removeLineRef = useRef(null);
  useEffect(() => {
    try {
      const savedId = localStorage.getItem(CART_ID_STORAGE_KEY);
      if (savedId) {
        setCartId(savedId);
      }
    } catch (e) {
      console.error('Error reading cart id from storage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      if (cartId) {
        localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
      } else {
        localStorage.removeItem(CART_ID_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving cart id to storage:', e);
    }
  }, [cartId]);

  // Restore the cart from Shopify when we have an id but no cart yet.
  const refreshCart = useCallback(async () => {
    if (!cartId) return null;
    if (!isShopifyConfigured()) {
      setCart(null);
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fetchCart(cartId);
      // The cart may have been deleted on the Shopify side. If so, drop it
      // locally so the next addVariant creates a new one.
      if (!fetched) {
        setCart(null);
        setCartId(null);
        return null;
      }
      setCart(fetched);
      return fetched;
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.message || 'Could not load your cart');
      // If the cart id is invalid, drop it so we re-create on next add.
      setCartId(null);
      setCart(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  useEffect(() => {
    if (cartId && !cart && isShopifyConfigured()) {
      refreshCart();
    }
  }, [cartId, cart, refreshCart]);

  // Add a variant to the cart. If no cart exists, creates one. If a variant
  // for the same merchandise already exists in the cart, increments its
  // quantity instead of adding a duplicate line.
  const addVariant = useCallback(
    async (product, selectedSize, selectedColor, quantity = 1) => {
      const merchandiseId = getVariantId(product, selectedSize, selectedColor);
      if (!merchandiseId) {
        const message =
          'Could not find a matching variant for the selected options.';
        setError(message);
        throw new Error(message);
      }
      if (!isShopifyConfigured()) {
        const message =
          'Shopify is not configured. Add the REACT_APP_SHOPIFY_* env vars to enable checkout.';
        setError(message);
        throw new Error(message);
      }
      if (inFlight.current) return;
      inFlight.current = true;
      setIsLoading(true);
      setError(null);
      try {
        // If the user has already added this variant, increment its line.
        const existing = (cart?.lines?.nodes || []).find((line) => {
          if (!line.merchandise) return false;
          return line.merchandise.id === merchandiseId;
        });

        let updatedCart;
        if (!cartId) {
          updatedCart = await createCart({
            lines: [{ merchandiseId, quantity }],
          });
          if (updatedCart?.id) {
            setCartId(updatedCart.id);
          }
        } else if (existing) {
          updatedCart = await updateCartLines(cartId, [
            { id: existing.id, quantity: existing.quantity + quantity },
          ]);
        } else {
          updatedCart = await addCartLines(cartId, [
            { merchandiseId, quantity },
          ]);
        }
        setCart(updatedCart);
        setIsCartOpen(true);
        return updatedCart;
      } catch (err) {
        console.error('Failed to add variant:', err);
        setError(err.message || 'Could not add to cart');
        throw err;
      } finally {
        setIsLoading(false);
        inFlight.current = false;
      }
    },
    [cart, cartId]
  );

  // Update a cart line's quantity by its line id.
  const updateLineQuantity = useCallback(
    async (lineId, quantity) => {
      if (!cartId) return;
      if (quantity <= 0) {
        const snapshot = removeLineRef.current;
        return snapshot ? snapshot(lineId) : null;
      }
      if (inFlight.current) return;
      inFlight.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const updatedCart = await updateCartLines(cartId, [
          { id: lineId, quantity },
        ]);
        setCart(updatedCart);
        return updatedCart;
      } catch (err) {
        console.error('Failed to update line:', err);
        setError(err.message || 'Could not update cart');
        throw err;
      } finally {
        setIsLoading(false);
        inFlight.current = false;
      }
    },
    [cartId]
  );

  // Remove a single line by its line id.
  const removeLine = useCallback(
    async (lineId) => {
      if (!cartId) return;
      if (inFlight.current) return;
      inFlight.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const updatedCart = await removeCartLines(cartId, [lineId]);
        setCart(updatedCart);
        return updatedCart;
      } catch (err) {
        console.error('Failed to remove line:', err);
        setError(err.message || 'Could not remove line');
        throw err;
      } finally {
        setIsLoading(false);
        inFlight.current = false;
      }
    },
    [cartId]
  );

  // Keep removeLineRef in sync with the latest removeLine so
  // updateLineQuantity can forward to it without circular dependencies.
  useEffect(() => {
    removeLineRef.current = removeLine;
  }, [removeLine]);

  // Clear the local cart (drop the cart id and the in-memory cart).
  // Does not call Shopify — the cart remains on the Shopify side and can
  // be re-attached by saving the id again.
  const clearLocalCart = useCallback(() => {
    setCart(null);
    setCartId(null);
    setError(null);
  }, []);

  // Redirect to Shopify's hosted checkout. The checkoutUrl comes from the
  // cart object — never construct it manually.
  const openCheckout = useCallback(() => {
    if (!cart?.checkoutUrl) {
      setError('Cart is not ready for checkout yet.');
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.assign(cart.checkoutUrl);
    }
  }, [cart]);

  // Derived values from the cart.
  const lines = useMemo(
    () => cart?.lines?.nodes || [],
    [cart]
  );
  const totalItems = useMemo(() => {
    if (cart?.totalQuantity != null) return cart.totalQuantity;
    return lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
  }, [cart, lines]);
  const subtotal = useMemo(
    () => cart?.cost?.subtotalAmount?.amount ?? null,
    [cart]
  );
  const total = useMemo(
    () => cart?.cost?.totalAmount?.amount ?? null,
    [cart]
  );
  const currencyCode = useMemo(
    () =>
      cart?.cost?.totalAmount?.currencyCode ||
      cart?.cost?.subtotalAmount?.currencyCode ||
      'INR',
    [cart]
  );
  const checkoutUrl = cart?.checkoutUrl || null;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        lines,
        totalItems,
        subtotal,
        total,
        currencyCode,
        checkoutUrl,
        isCartOpen,
        setIsCartOpen,
        isLoading,
        error,
        addVariant,
        updateLineQuantity,
        removeLine,
        clearLocalCart,
        refreshCart,
        openCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
