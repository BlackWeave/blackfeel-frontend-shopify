// Barrel entry for the Shopify module. Consumers can import everything
// from `lib/shopify` instead of reaching into individual files.

export {
  PRODUCT_CARD_FRAGMENT,
  CART_FIELDS_FRAGMENT,
} from './fragments';

export {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
} from './queries';

export {
  CART_CREATE_MUTATION,
  CART_QUERY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './mutations';

export {
  mapShopifyProduct,
  findVariant,
  getVariantId,
  formatPrice,
  isShopifyConfigured,
} from './adapters';

export {
  createCart,
  fetchCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  createCheckout,
} from './cart';

export { shopifyClient, shopifyRequest } from './client';

// Backwards-compatible wrappers for components that still use the legacy
// client names (fetchProducts, fetchProductByHandle, fetchProductsByCollection).
// These all delegate to the modern Storefront API queries and return the
// mapped product shape. They will be removed once the pages that use them
// are migrated to the new module functions.
import { shopifyRequest } from './client';
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
} from './queries';
import { mapShopifyProduct } from './adapters';

export async function fetchProducts(first = 50) {
  const data = await shopifyRequest(PRODUCTS_QUERY, { first });
  const nodes = data?.products?.nodes || [];
  return nodes.map(mapShopifyProduct);
}

export async function fetchProductByHandle(handle) {
  const data = await shopifyRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.product ? mapShopifyProduct(data.product) : null;
}

// Fetches products belonging to a collection by handle. Walks the
// collection → products connection and maps the result.
export async function fetchProductsByCollection(handle, first = 50) {
  const query = `#graphql
    query CollectionByHandle($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) {
          nodes {
            id
            handle
            title
            description
            availableForSale
            featuredImage { url altText width height }
            images(first: 5) { nodes { url altText width height } }
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            options { id name optionValues { id name } }
            variants(first: 100) {
              nodes {
                id
                title
                availableForSale
                selectedOptions { name value }
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                image { url altText width height }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyRequest(query, { handle, first });
  const nodes = data?.collection?.products?.nodes || [];
  return nodes.map(mapShopifyProduct);
}

export async function fetchCollections(first = 20) {
  const data = await shopifyRequest(COLLECTIONS_QUERY, { first });
  return data?.collections?.nodes || [];
}
