// GraphQL fragments for Shopify Storefront API operations.
// Targets Storefront API 2026-07. See SHOPIFY_HEADLESS_AGENT_GUIDE.md sections
// 6 and 9 for the rationale behind each selection.
//
// IMPORTANT:
// - Do NOT include `quantityAvailable` on variants — it requires token
//   access (Customer Account / Storefront Access Token scopes) and the
//   guide warns against it for headless public storefronts.
// - Do NOT include `totalTaxAmount` on Cart cost — it is deprecated in
//   the 2026-07 API version.

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 5) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      id
      name
      optionValues {
        id
        name
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export const CART_FIELDS_FRAGMENT = `#graphql
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
            product {
              id
              handle
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;
