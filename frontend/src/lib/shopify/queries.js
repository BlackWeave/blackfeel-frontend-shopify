// GraphQL queries for Shopify Storefront API.
// Each query interpolates `PRODUCT_CARD_FRAGMENT` so the fragment definition
// is bundled into the final document sent to Shopify.
// See SHOPIFY_HEADLESS_AGENT_GUIDE.md sections 6 and 9.

import { PRODUCT_CARD_FRAGMENT } from './fragments';

export const PRODUCTS_QUERY = `#graphql
  query Products(
    $first: Int!
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductCard
      descriptionHtml
      productType
      vendor
      tags
      collections(first: 10) {
        nodes {
          id
          handle
          title
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
        }
      }
    }
  }
`;
