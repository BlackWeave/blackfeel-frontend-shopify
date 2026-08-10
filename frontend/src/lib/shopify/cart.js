// Cart operations against the Shopify Storefront API.
// Each function delegates to `shopifyRequest` from ./client and unwraps the
// relevant cart payload. See SHOPIFY_HEADLESS_AGENT_GUIDE.md section 10.

import { shopifyRequest } from './client';
import {
  CART_CREATE_MUTATION,
  CART_QUERY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './mutations';

/**
 * Creates a new cart. `input` is a `CartInput` value — pass at minimum
 * `{ lines: [{ merchandiseId, quantity }] }`. Throws when the first
 * userError is returned.
 */
export async function createCart(input) {
  const data = await shopifyRequest(CART_CREATE_MUTATION, { input });
  const result = data?.cartCreate;
  const userErrors = result?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message || 'Cart creation failed');
  }
  return result?.cart ?? null;
}

/**
 * Fetches the cart with the given global id. Returns `null` when the cart
 * no longer exists.
 */
export async function fetchCart(id) {
  const data = await shopifyRequest(CART_QUERY, { id });
  return data?.cart ?? null;
}

/**
 * Adds one or more lines to an existing cart. `lines` is an array of
 * `CartLineInput` values (`{ merchandiseId, quantity }`).
 */
export async function addCartLines(cartId, lines) {
  const data = await shopifyRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines,
  });
  const result = data?.cartLinesAdd;
  const userErrors = result?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message || 'Failed to add cart lines');
  }
  return result?.cart ?? null;
}

/**
 * Updates one or more lines on an existing cart. `lines` is an array of
 * `CartLineUpdateInput` values (`{ id, quantity, merchandiseId?, attributes? }`).
 */
export async function updateCartLines(cartId, lines) {
  const data = await shopifyRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines,
  });
  const result = data?.cartLinesUpdate;
  const userErrors = result?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message || 'Failed to update cart lines');
  }
  return result?.cart ?? null;
}

/**
 * Removes one or more lines from an existing cart.
 */
export async function removeCartLines(cartId, lineIds) {
  const data = await shopifyRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds,
  });
  const result = data?.cartLinesRemove;
  const userErrors = result?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message || 'Failed to remove cart lines');
  }
  return result?.cart ?? null;
}

/**
 * The legacy `checkoutCreate` flow is deprecated — Shopify now expects
 * callers to drive checkout via `cart.checkoutUrl`. The storefront uses
 * `CartContext.addVariant()` and `CartContext.openCheckout()` instead.
 */
export async function createCheckout(lineItems, customerInfo) {
  void lineItems;
  void customerInfo;
  throw new Error(
    'createCheckout is deprecated; use the Cart API flow via CartContext.addVariant() and CartContext.openCheckout()',
  );
}
