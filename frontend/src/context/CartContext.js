import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
// TODO(commit-4): replace this entire file with the Shopifty Cart API flow.
// The legacy Checkout API is deprecated; use CartContext.addVariant() and
// CartContext.openCheckout() instead. For now we keep the deprecated client
// as the implementation so the existing UI continues to work.
import { createCheckout as _deprecatedCreateCheckout } from '@/lib/shopify.deprecated';
import { getVariantId, isShopifyConfigured } from '@/lib/shopify';

const createCheckout = _deprecatedCreateCheckout;

const CartContext = createContext(undefined);

// Storage key for cart persistence
const CART_STORAGE_KEY = 'blackfeel_cart';
const CHECKOUT_STORAGE_KEY = 'blackfeel_checkout';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedCheckout = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedCheckout) {
        const checkout = JSON.parse(savedCheckout);
        setCheckoutId(checkout.id);
        setCheckoutUrl(checkout.webUrl);
      }
    } catch (e) {
      console.error('Error loading cart from storage:', e);
    }
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }, [items]);

  /**
   * Add item to cart
   * For Shopify integration, we need the variantId for checkout
   */
  const addItem = useCallback((product, size, color, quantity = 1) => {
    // Get the variant ID for Shopify cart operations
    const variantId = getVariantId(product, size, color);
    
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && item.size === size && item.color === color
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      }

      return [...prevItems, { 
        product, 
        size, 
        color, 
        quantity,
        variantId, // Store variant ID for Shopify checkout
      }];
    });
    
    // Clear existing checkout when cart changes (will create new one at checkout)
    setCheckoutId(null);
    setCheckoutUrl(null);
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    
    setIsCartOpen(true);
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((productId, size, color) => {
    setItems(prevItems =>
      prevItems.filter(
        item => !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
    
    // Clear checkout when cart changes
    setCheckoutId(null);
    setCheckoutUrl(null);
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }, []);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback((productId, size, color, quantity) => {
    if (quantity < 1) return;
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
    
    // Clear checkout when cart changes
    setCheckoutId(null);
    setCheckoutUrl(null);
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setCheckoutId(null);
    setCheckoutUrl(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }, []);

  /**
   * Initiate Shopify Checkout - Indian Market Optimized
   * Creates checkout with allowPartialAddresses and phone as primary contact
   * Redirects to Shopify checkout where Razorpay/Delhivery are configured
   */
  const initiateCheckout = useCallback(async (customerInfo = {}) => {
    if (items.length === 0) {
      setCheckoutError('Cart is empty');
      return null;
    }

    // Check if Shopify is configured
    if (!isShopifyConfigured()) {
      // Fallback for demo/development - show alert
      console.warn('Shopify not configured. Using demo mode.');
      setCheckoutError('Shopify credentials not configured. Please add REACT_APP_SHOPIFY_STOREFRONT_URL and REACT_APP_SHOPIFY_STOREFRONT_TOKEN to your .env file.');
      return null;
    }

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      // Build line items with variant IDs
      const lineItems = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // Filter out items without variant IDs (shouldn't happen but safety check)
      const validLineItems = lineItems.filter(item => item.variantId);

      if (validLineItems.length === 0) {
        throw new Error('No valid items in cart. Please try adding products again.');
      }

      // Create Shopify checkout with Indian market settings
      // allowPartialAddresses: true - allows flexible address entry
      // phone as primary contact - standard for Indian customers
      const checkout = await createCheckout(validLineItems, {
        phone: customerInfo.phone || '',
        email: customerInfo.email || '',
        firstName: customerInfo.firstName || '',
        lastName: customerInfo.lastName || '',
        country: 'IN', // Default to India
      });

      if (checkout) {
        // Save checkout info
        setCheckoutId(checkout.id);
        setCheckoutUrl(checkout.webUrl);
        
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify({
          id: checkout.id,
          webUrl: checkout.webUrl,
        }));

        // Redirect to Shopify checkout (Razorpay & Delhivery configured there)
        window.location.href = checkout.webUrl;
        
        return checkout;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Failed to create checkout. Please try again.');
      return null;
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [items]);

  /**
   * Resume existing checkout (if user returns)
   */
  const resumeCheckout = useCallback(() => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Get currency code from first item (should be consistent)
  const currencyCode = items[0]?.product?.currencyCode || 'INR';

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        currencyCode,
        isCartOpen,
        setIsCartOpen,
        // Shopify checkout
        checkoutId,
        checkoutUrl,
        isCheckoutLoading,
        checkoutError,
        initiateCheckout,
        resumeCheckout,
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
