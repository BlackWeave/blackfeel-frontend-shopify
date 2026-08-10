/**
 * Unit tests for the Shopify product adapter.
 *
 * These tests run via jest when invoked with `npm test -- --watchAll=false`.
 * They cover the critical mapping logic that every page depends on:
 * Shopify Product/Variant → component shape.
 */

import {
  mapShopifyProduct,
  findVariant,
  getVariantId,
  formatPrice,
} from '../adapters';

const shopifyProduct = {
  id: 'gid://shopify/Product/1',
  handle: 'essential-crew',
  title: 'Essential Crew',
  description: 'A perfect everyday tee.',
  availableForSale: true,
  priceRange: {
    minVariantPrice: {
      amount: '39.00',
      currencyCode: 'INR',
    },
  },
  images: {
    nodes: [
      { url: 'https://cdn.example.com/1.jpg', altText: 'Front' },
      { url: 'https://cdn.example.com/2.jpg', altText: 'Back' },
    ],
  },
  options: [
    {
      id: 'opt-color',
      name: 'Color',
      optionValues: [
        { id: 'c-black', name: 'Black' },
        { id: 'c-white', name: 'White' },
      ],
    },
    {
      id: 'opt-size',
      name: 'Size',
      optionValues: [
        { id: 's-m', name: 'M' },
        { id: 's-l', name: 'L' },
      ],
    },
  ],
  variants: {
    nodes: [
      {
        id: 'gid://shopify/ProductVariant/10',
        title: 'Black / M',
        availableForSale: true,
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'M' },
        ],
        price: { amount: '39.00', currencyCode: 'INR' },
        compareAtPrice: null,
        image: { url: 'https://cdn.example.com/1.jpg' },
      },
      {
        id: 'gid://shopify/ProductVariant/11',
        title: 'Black / L',
        availableForSale: false,
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'L' },
        ],
        price: { amount: '39.00', currencyCode: 'INR' },
        compareAtPrice: { amount: '49.00', currencyCode: 'INR' },
        image: { url: 'https://cdn.example.com/1.jpg' },
      },
      {
        id: 'gid://shopify/ProductVariant/12',
        title: 'White / M',
        availableForSale: true,
        selectedOptions: [
          { name: 'Color', value: 'White' },
          { name: 'Size', value: 'M' },
        ],
        price: { amount: '39.00', currencyCode: 'INR' },
        compareAtPrice: null,
        image: { url: 'https://cdn.example.com/2.jpg' },
      },
    ],
  },
};

describe('mapShopifyProduct', () => {
  it('maps a Shopify Product to the storefront shape', () => {
    const mapped = mapShopifyProduct(shopifyProduct);
    expect(mapped.id).toBe(shopifyProduct.id);
    expect(mapped.handle).toBe('essential-crew');
    expect(mapped.name).toBe('Essential Crew');
    expect(mapped.description).toBe('A perfect everyday tee.');
    expect(mapped.price).toBe(39);
    expect(mapped.currencyCode).toBe('INR');
    expect(mapped.images).toEqual([
      'https://cdn.example.com/1.jpg',
      'https://cdn.example.com/2.jpg',
    ]);
    expect(mapped.colors).toEqual(['Black', 'White']);
    expect(mapped.sizes).toEqual(['M', 'L']);
    expect(mapped.inStock).toBe(true);
    expect(mapped.variants).toHaveLength(3);
    expect(mapped.raw).toBe(shopifyProduct);
  });

  it('returns sane defaults when given a null product', () => {
    const mapped = mapShopifyProduct(null);
    expect(mapped.id).toBe(null);
    expect(mapped.name).toBe('');
    expect(mapped.price).toBe(0);
    expect(mapped.images).toEqual([]);
    expect(mapped.colors).toEqual([]);
    expect(mapped.sizes).toEqual([]);
    expect(mapped.inStock).toBe(false);
    expect(mapped.variants).toEqual([]);
  });

  it('returns empty arrays when images are missing', () => {
    const noImages = { ...shopifyProduct, images: { nodes: null } };
    expect(mapShopifyProduct(noImages).images).toEqual([]);
  });

  it('handles a missing priceRange gracefully', () => {
    const noPrice = { ...shopifyProduct, priceRange: null };
    expect(mapShopifyProduct(noPrice).price).toBe(0);
  });

  it('matches option names case-insensitively', () => {
    const cased = {
      ...shopifyProduct,
      options: [
        { id: 'opt-color', name: 'COLOR', optionValues: [{ id: 'c-black', name: 'Black' }] },
        { id: 'opt-size', name: 'size', optionValues: [{ id: 's-m', name: 'M' }] },
      ],
    };
    const mapped = mapShopifyProduct(cased);
    expect(mapped.colors).toEqual(['Black']);
    expect(mapped.sizes).toEqual(['M']);
  });
});

describe('findVariant', () => {
  it('finds a variant by exact option selections', () => {
    const v = findVariant(shopifyProduct, { Color: 'Black', Size: 'M' });
    expect(v?.id).toBe('gid://shopify/ProductVariant/10');
  });

  it('matches option names case-insensitively', () => {
    const v = findVariant(shopifyProduct, { color: 'WHITE', size: 'm' });
    expect(v?.id).toBe('gid://shopify/ProductVariant/12');
  });

  it('returns undefined when no variant matches', () => {
    expect(findVariant(shopifyProduct, { Color: 'Black', Size: 'XL' })).toBeUndefined();
  });

  it('returns undefined when the product has no variants', () => {
    expect(findVariant({ ...shopifyProduct, variants: null }, {})).toBeUndefined();
  });

  it('returns the variant when no selections are provided', () => {
    const v = findVariant(shopifyProduct, {});
    expect(v).toBeDefined();
    expect(v.id).toMatch(/^gid:\/\/shopify\/ProductVariant\//);
  });
});

describe('getVariantId', () => {
  it('returns the matching variant id', () => {
    expect(getVariantId(shopifyProduct, 'M', 'Black')).toBe(
      'gid://shopify/ProductVariant/10'
    );
  });

  it('returns null when no variant matches', () => {
    expect(getVariantId(shopifyProduct, 'XL', 'Black')).toBeNull();
  });

  it('returns the first variant when no options are provided', () => {
    expect(getVariantId(shopifyProduct, '', '')).toBe(
      'gid://shopify/ProductVariant/10'
    );
  });

  it('returns null when the product is null', () => {
    expect(getVariantId(null, 'M', 'Black')).toBeNull();
  });
});

describe('formatPrice', () => {
  it('formats INR by default', () => {
    const out = formatPrice(999);
    expect(out).toMatch(/₹/);
    expect(out).toMatch(/999/);
  });

  it('formats a different currency when provided', () => {
    const out = formatPrice(10, 'USD');
    expect(out).toContain('$');
    expect(out).toContain('10');
  });

  it('returns an empty string for null/invalid amounts', () => {
    expect(formatPrice(null)).toBe('');
    expect(formatPrice('nope')).toBe('');
  });
});
