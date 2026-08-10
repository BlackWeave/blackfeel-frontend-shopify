// Adapter helpers that bridge the Shopify Storefront API shapes to the
// shapes used by the storefront components. See SHOPIFY_HEADLESS_AGENT_GUIDE.md
// section 9 for the frontend-side data contracts.

/**
 * Returns the values array for a product option whose name matches
 * `optionName` case-insensitively, or an empty array if not found.
 */
function optionValues(product, optionName) {
  if (!product || !Array.isArray(product.options)) return [];
  const target = String(optionName).toLowerCase();
  const match = product.options.find(
    (opt) => String(opt.name).toLowerCase() === target,
  );
  if (!match || !Array.isArray(match.optionValues)) return [];
  return match.optionValues.map((v) => v.name);
}

/**
 * Maps a Shopify Product (already shaped by `PRODUCT_CARD_FRAGMENT`) to the
 * shape the existing storefront components expect.
 */
export function mapShopifyProduct(product) {
  if (!product) {
    return {
      id: null,
      handle: null,
      name: '',
      description: '',
      price: 0,
      currencyCode: null,
      images: [],
      colors: [],
      sizes: [],
      inStock: false,
      variants: [],
      raw: null,
    };
  }

  const minPrice = product.priceRange?.minVariantPrice;
  const priceAmount = Number(minPrice?.amount ?? 0);

  const imageNodes = Array.isArray(product.images?.nodes)
    ? product.images.nodes
    : [];
  const images = imageNodes.map((n) => n.url).filter(Boolean);

  return {
    id: product.id,
    handle: product.handle,
    name: product.title,
    description: product.description,
    price: Number.isFinite(priceAmount) ? priceAmount : 0,
    currencyCode: minPrice?.currencyCode ?? null,
    images,
    colors: optionValues(product, 'Color'),
    sizes: optionValues(product, 'Size'),
    inStock: Boolean(product.availableForSale),
    variants: Array.isArray(product.variants?.nodes) ? product.variants.nodes : [],
    raw: product,
  };
}

/**
 * Returns the first variant whose `selectedOptions` cover every
 * `{ name: value }` pair in `selections` (case-insensitive on the option
 * name and value). Returns `undefined` if no match is found.
 */
export function findVariant(product, selections = {}) {
  if (!product || !Array.isArray(product.variants?.nodes)) return undefined;
  return product.variants.nodes.find((variant) =>
    Object.entries(selections).every(([name, value]) => {
      const targetName = String(name).toLowerCase();
      const targetValue = String(value).toLowerCase();
      return (variant.selectedOptions || []).some(
        (opt) =>
          String(opt.name).toLowerCase() === targetName &&
          String(opt.value).toLowerCase() === targetValue,
      );
    }),
  );
}

/**
 * Locates a variant matching the provided size and/or color and returns
 * its global id. Returns `null` when the product has no matching variant.
 * Option-name and value matching is case-insensitive.
 */
export function getVariantId(product, selectedSize, selectedColor) {
  if (!product) return null;
  const nodes = Array.isArray(product.variants?.nodes) ? product.variants.nodes : [];
  for (const variant of nodes) {
    const opts = variant.selectedOptions || [];
    const sizeOk = selectedSize
      ? opts.some(
          (o) =>
            String(o.name).toLowerCase() === 'size' &&
            String(o.value).toLowerCase() === String(selectedSize).toLowerCase(),
        )
      : true;
    const colorOk = selectedColor
      ? opts.some(
          (o) =>
            String(o.name).toLowerCase() === 'color' &&
            String(o.value).toLowerCase() === String(selectedColor).toLowerCase(),
        )
      : true;
    if (sizeOk && colorOk) {
      return variant.id || null;
    }
  }
  return null;
}

/**
 * Formats a numeric amount as a currency string. Defaults to INR for the
 * storefront's primary market but respects whatever currency code Shopify
 * returns.
 */
export function formatPrice(amount, currencyCode = 'INR') {
  if (amount == null) return '';
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return '';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch (_err) {
    return `${currencyCode} ${numeric}`;
  }
}

/**
 * Returns true when both the store domain and the storefront public token
 * are configured in the environment. Components can use this to decide
 * whether to render Shopify-backed data or fall back to mocks.
 */
export function isShopifyConfigured() {
  return Boolean(
    process.env.REACT_APP_SHOPIFY_STORE_DOMAIN &&
      process.env.REACT_APP_SHOPIFY_STOREFRONT_PUBLIC_TOKEN,
  );
}
