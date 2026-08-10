/**
 * Shopify Storefront API Client
 * For BlackFeel - Indian Market Headless Storefront
 * 
 * Environment Variables Required:
 * - REACT_APP_SHOPIFY_STOREFRONT_URL: Your Shopify store URL (e.g., https://blackfeel.myshopify.com)
 * - REACT_APP_SHOPIFY_STOREFRONT_TOKEN: Storefront API access token
 */

const SHOPIFY_STOREFRONT_URL = process.env.REACT_APP_SHOPIFY_STOREFRONT_URL;
const SHOPIFY_STOREFRONT_TOKEN = process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN;

// GraphQL endpoint
const getEndpoint = () => {
  if (!SHOPIFY_STOREFRONT_URL) {
    console.warn('REACT_APP_SHOPIFY_STOREFRONT_URL is not set');
    return null;
  }
  return `${SHOPIFY_STOREFRONT_URL}/api/2024-01/graphql.json`;
};

/**
 * Execute GraphQL query against Shopify Storefront API
 */
export async function shopifyFetch(query, variables = {}) {
  const endpoint = getEndpoint();
  
  if (!endpoint || !SHOPIFY_STOREFRONT_TOKEN) {
    console.warn('Shopify credentials not configured. Using mock data.');
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    return data.data;
  } catch (error) {
    console.error('Shopify fetch error:', error);
    throw error;
  }
}

/**
 * Fetch all products with INR pricing
 */
export async function fetchProducts(first = 50) {
  const query = `
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            tags
            productType
            vendor
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
            options {
              id
              name
              values
            }
            metafield(namespace: "custom", key: "cod_available") {
              value
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first });
  return data?.products?.edges?.map(({ node }) => transformProduct(node)) || [];
}

/**
 * Fetch single product by handle
 */
export async function fetchProductByHandle(handle) {
  const query = `
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        tags
        productType
        vendor
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
              }
            }
          }
        }
        options {
          id
          name
          values
        }
        metafield(namespace: "custom", key: "cod_available") {
          value
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { handle });
  return data?.product ? transformProduct(data.product) : null;
}

/**
 * Fetch product by ID (Shopify GID)
 */
export async function fetchProductById(id) {
  const query = `
    query GetProductById($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        description
        descriptionHtml
        tags
        productType
        vendor
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
              }
            }
          }
        }
        options {
          id
          name
          values
        }
        metafield(namespace: "custom", key: "cod_available") {
          value
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { id });
  return data?.product ? transformProduct(data.product) : null;
}

/**
 * Fetch collections
 */
export async function fetchCollections(first = 10) {
  const query = `
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            products(first: 1) {
              edges {
                node {
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { first });
  return data?.collections?.edges?.map(({ node }) => ({
    id: node.handle,
    shopifyId: node.id,
    name: node.title,
    description: node.description,
    image: node.image?.url,
    price: parseFloat(node.products?.edges?.[0]?.node?.priceRange?.minVariantPrice?.amount || 0),
  })) || [];
}

/**
 * Fetch products by collection handle
 */
export async function fetchProductsByCollection(handle, first = 50) {
  const query = `
    query GetCollectionProducts($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              tags
              productType
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              options {
                name
                values
              }
              metafield(namespace: "custom", key: "cod_available") {
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { handle, first });
  return data?.collection?.products?.edges?.map(({ node }) => transformProduct(node)) || [];
}

/**
 * Create Shopify Checkout - Indian Market Optimized
 * Includes allowPartialAddresses for flexible address entry
 * Phone is primary contact field for Indian customers
 */
export async function createCheckout(lineItems, customerInfo = {}) {
  const query = `
    mutation CheckoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  // Build line items for Shopify (variantId is the node.id from variants)
  const formattedLineItems = lineItems.map(item => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  const input = {
    lineItems: formattedLineItems,
    allowPartialAddresses: true, // Required for Indian market - allows partial address entry
  };

  // Add customer email if provided
  if (customerInfo.email) {
    input.email = customerInfo.email;
  }

  // Add shipping address with phone as primary contact (Indian market standard)
  if (customerInfo.phone || customerInfo.address) {
    input.shippingAddress = {
      phone: customerInfo.phone || '', // Phone is primary for Indian customers
      firstName: customerInfo.firstName || '',
      lastName: customerInfo.lastName || '',
      address1: customerInfo.address1 || '',
      address2: customerInfo.address2 || '',
      city: customerInfo.city || '',
      province: customerInfo.province || '',
      country: customerInfo.country || 'IN', // Default to India
      zip: customerInfo.zip || '',
    };
  }

  const data = await shopifyFetch(query, { input });
  
  if (data?.checkoutCreate?.checkoutUserErrors?.length > 0) {
    const error = data.checkoutCreate.checkoutUserErrors[0];
    throw new Error(`Checkout error: ${error.message}`);
  }

  return data?.checkoutCreate?.checkout;
}

/**
 * Update checkout with customer information
 */
export async function updateCheckoutEmail(checkoutId, email) {
  const query = `
    mutation CheckoutEmailUpdate($checkoutId: ID!, $email: String!) {
      checkoutEmailUpdateV2(checkoutId: $checkoutId, email: $email) {
        checkout {
          id
          email
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { checkoutId, email });
  return data?.checkoutEmailUpdateV2?.checkout;
}

/**
 * Update checkout shipping address (with phone for Indian market)
 */
export async function updateCheckoutShippingAddress(checkoutId, address) {
  const query = `
    mutation CheckoutShippingAddressUpdate($checkoutId: ID!, $shippingAddress: MailingAddressInput!) {
      checkoutShippingAddressUpdateV2(checkoutId: $checkoutId, shippingAddress: $shippingAddress) {
        checkout {
          id
          shippingAddress {
            phone
            firstName
            lastName
            address1
            city
            province
            country
            zip
          }
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const shippingAddress = {
    phone: address.phone || '',
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    address1: address.address1 || '',
    address2: address.address2 || '',
    city: address.city || '',
    province: address.province || '',
    country: address.country || 'IN',
    zip: address.zip || '',
  };

  const data = await shopifyFetch(query, { checkoutId, shippingAddress });
  return data?.checkoutShippingAddressUpdateV2?.checkout;
}

/**
 * Add line items to existing checkout
 */
export async function addLineItemsToCheckout(checkoutId, lineItems) {
  const query = `
    mutation CheckoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
      checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
        checkout {
          id
          webUrl
          totalPrice {
            amount
            currencyCode
          }
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { checkoutId, lineItems });
  return data?.checkoutLineItemsAdd?.checkout;
}

/**
 * Remove line items from checkout
 */
export async function removeLineItemsFromCheckout(checkoutId, lineItemIds) {
  const query = `
    mutation CheckoutLineItemsRemove($checkoutId: ID!, $lineItemIds: [ID!]!) {
      checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
        checkout {
          id
          webUrl
          totalPrice {
            amount
            currencyCode
          }
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { checkoutId, lineItemIds });
  return data?.checkoutLineItemsRemove?.checkout;
}

/**
 * Transform Shopify product to app format
 */
function transformProduct(shopifyProduct) {
  // Extract sizes and colors from options
  const sizeOption = shopifyProduct.options?.find(opt => 
    opt.name.toLowerCase() === 'size'
  );
  const colorOption = shopifyProduct.options?.find(opt => 
    opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour'
  );

  // Map variants with their IDs for cart operations
  const variants = shopifyProduct.variants?.edges?.map(({ node }) => ({
    id: node.id, // This is the variantId needed for cart/checkout
    title: node.title,
    available: node.availableForSale,
    quantityAvailable: node.quantityAvailable,
    price: parseFloat(node.price?.amount || 0),
    currencyCode: node.price?.currencyCode || 'INR',
    compareAtPrice: node.compareAtPrice ? parseFloat(node.compareAtPrice.amount) : null,
    options: node.selectedOptions?.reduce((acc, opt) => {
      acc[opt.name.toLowerCase()] = opt.value;
      return acc;
    }, {}),
    image: node.image?.url,
  })) || [];

  // Check COD eligibility from tags or metafield
  const hasCodTag = shopifyProduct.tags?.some(tag => 
    tag.toLowerCase() === 'cod' || tag.toLowerCase() === 'cash on delivery'
  );
  const codMetafield = shopifyProduct.metafield?.value;
  const codAvailable = hasCodTag || codMetafield === 'true' || codMetafield === 'yes';

  // Get price in INR
  const price = parseFloat(shopifyProduct.priceRange?.minVariantPrice?.amount || 0);
  const currencyCode = shopifyProduct.priceRange?.minVariantPrice?.currencyCode || 'INR';

  return {
    id: shopifyProduct.handle, // Use handle as ID for URL routing
    shopifyId: shopifyProduct.id, // Store original Shopify GID
    name: shopifyProduct.title,
    handle: shopifyProduct.handle,
    description: shopifyProduct.description,
    descriptionHtml: shopifyProduct.descriptionHtml,
    category: shopifyProduct.productType?.toLowerCase() || 'basic',
    tags: shopifyProduct.tags || [],
    price,
    currencyCode,
    codAvailable,
    images: shopifyProduct.images?.edges?.map(({ node }) => node.url) || [],
    sizes: sizeOption?.values || [],
    colors: colorOption?.values || [],
    variants,
    options: shopifyProduct.options || [],
    inStock: variants.some(v => v.available),
    details: [
      shopifyProduct.vendor && `Brand: ${shopifyProduct.vendor}`,
      shopifyProduct.productType && `Type: ${shopifyProduct.productType}`,
    ].filter(Boolean),
  };
}

/**
 * Get variant ID by selected options (size, color)
 */
export function getVariantId(product, selectedSize, selectedColor) {
  if (!product?.variants) return null;

  const variant = product.variants.find(v => {
    const sizeMatch = !selectedSize || v.options?.size === selectedSize;
    const colorMatch = !selectedColor || v.options?.color === selectedColor || v.options?.colour === selectedColor;
    return sizeMatch && colorMatch && v.available;
  });

  return variant?.id || product.variants[0]?.id;
}

/**
 * Format price for Indian Rupees
 */
export function formatPrice(amount, currencyCode = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Check if Shopify is configured
 */
export function isShopifyConfigured() {
  return !!(SHOPIFY_STOREFRONT_URL && SHOPIFY_STOREFRONT_TOKEN);
}
