// GraphQL mutations and the cart-by-id query for the Shopify Storefront API.
// Each document interpolates `${CART_FIELDS_FRAGMENT}` literally so the
// fragment definition is part of the final GraphQL document sent to Shopify.
// See SHOPIFY_HEADLESS_AGENT_GUIDE.md sections 6 and 10.

import { CART_FIELDS_FRAGMENT } from './fragments';

export const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
      warnings {
        code
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

export const CART_QUERY = `#graphql
  query CartById($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

export const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
      warnings {
        code
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

export const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
      warnings {
        code
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

export const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
      warnings {
        code
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;
