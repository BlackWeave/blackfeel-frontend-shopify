// Shopify Storefront API client wrapper.
// Pattern follows SHOPIFY_HEADLESS_AGENT_GUIDE.md section 8.

import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const storeDomain = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN;
const publicAccessToken = process.env.REACT_APP_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
const apiVersion =
  process.env.REACT_APP_SHOPIFY_STOREFRONT_API_VERSION || '2026-07';

if (!storeDomain) {
  throw new Error('Missing REACT_APP_SHOPIFY_STORE_DOMAIN');
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain: `https://${storeDomain}`,
  apiVersion,
  publicAccessToken,
});

export async function shopifyRequest(document, variables = {}) {
  const { data, errors } = await shopifyClient.request(document, {
    variables,
  });

  if (errors) {
    const message =
      errors.graphQLErrors?.map((error) => error.message).join('; ') ||
      errors.message ||
      'Unknown Shopify Storefront API error';

    throw new Error(message);
  }

  return data;
}
