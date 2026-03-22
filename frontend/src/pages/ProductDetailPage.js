import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Minus, Plus, Check, Truck, RefreshCw, IndianRupee, Banknote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCart } from '@/context/CartContext';
import { SizeGuide } from '@/components/product/SizeGuide';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProductByHandle, formatPrice, isShopifyConfigured, getVariantId } from '@/lib/shopify';
import { getProductById, getColorById, PRODUCTS, CATEGORIES } from '@/data/products';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { addItem } = useCart();

  // State for Shopify product data
  const [shopifyProduct, setShopifyProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Fetch product from Shopify or use mock data
  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setError(null);

      try {
        if (isShopifyConfigured()) {
          // Fetch from Shopify Storefront API
          const product = await fetchProductByHandle(productId);
          if (product) {
            setShopifyProduct(product);
          } else {
            // Fallback to mock data if product not found in Shopify
            const mockProduct = getProductById(productId);
            if (mockProduct) {
              setShopifyProduct(mockProduct);
            } else {
              setError('Product not found');
            }
          }
        } else {
          // Use mock data when Shopify not configured
          const mockProduct = getProductById(productId);
          if (mockProduct) {
            setShopifyProduct(mockProduct);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
        // Fallback to mock data on error
        const mockProduct = getProductById(productId);
        if (mockProduct) {
          setShopifyProduct(mockProduct);
        } else {
          setError('Failed to load product');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  // Use Shopify product or mock product
  const product = shopifyProduct;

  // Get related products (same category, different product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  // Get available variant for selected options
  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find(v => {
      const sizeMatch = !selectedSize || v.options?.size === selectedSize;
      const colorMatch = !selectedColor || v.options?.color === selectedColor || v.options?.colour === selectedColor;
      return sizeMatch && colorMatch;
    });
  }, [product, selectedSize, selectedColor]);

  // Derived values
  const category = product ? CATEGORIES.find(c => c.id === product.category) : null;
  const currencyCode = product?.currencyCode || 'INR';
  const isVariantAvailable = selectedVariant?.available !== false;
  const variantPrice = selectedVariant?.price || product?.price || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      alert('Please select a size');
      return;
    }
    if (!selectedColor && product.colors?.length > 0) {
      alert('Please select a color');
      return;
    }
    
    // Add product with variant info for Shopify checkout
    addItem(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  // Check if color is a light color (for checkmark visibility)
  const isLightColor = (colorName) => {
    const lightColors = ['white', 'bone', 'cream', 'ivory', 'beige', 'light'];
    return lightColors.some(light => colorName?.toLowerCase().includes(light));
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-foreground">Shop</Link>
            <span className="mx-2">/</span>
            <Link to={`/shop?category=${product.category}`} className="hover:text-foreground">
              {category?.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-product bg-secondary relative overflow-hidden group">
              <img
                src={product.images?.[selectedImageIndex] || '/placeholder.png'}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-24 bg-secondary overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-foreground' 
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-6">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <Link 
                  to={`/shop?category=${product.category}`}
                  className="inline-block text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category?.name?.toUpperCase() || product.category?.toUpperCase()}
                </Link>
                
                {/* COD Available Badge - Check for 'COD' tag or metafield */}
                {product.codAvailable && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Banknote className="h-3 w-3 mr-1" />
                    COD Available
                  </Badge>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                  {product.name?.toUpperCase()}
                </h1>
                <div className="flex items-center gap-3">
                  <p className="font-display text-2xl">
                    {formatPrice(variantPrice, currencyCode)}
                  </p>
                  {selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > variantPrice && (
                    <p className="text-lg text-muted-foreground line-through">
                      {formatPrice(selectedVariant.compareAtPrice, currencyCode)}
                    </p>
                  )}
                </div>
                {/* Stock status */}
                {!isVariantAvailable && selectedSize && selectedColor && (
                  <p className="text-sm text-destructive mt-1">Out of stock</p>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <Separator />

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      Color: {selectedColor || 'Select a color'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      // For Shopify products, colors are strings
                      const colorName = typeof color === 'string' ? color : color?.name;
                      const colorHex = typeof color === 'string' ? null : color?.hex;
                      const mockColor = getColorById(color);
                      
                      return (
                        <button
                          key={colorName}
                          onClick={() => setSelectedColor(colorName)}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor === colorName 
                              ? 'border-foreground scale-110' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                          style={{ 
                            backgroundColor: colorHex || mockColor?.hex || colorName?.toLowerCase() 
                          }}
                          title={colorName}
                        >
                          {selectedColor === colorName && (
                            <Check className={`h-4 w-4 ${
                              isLightColor(colorName) ? 'text-foreground' : 'text-background'
                            }`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      Size: {selectedSize || 'Select a size'}
                    </span>
                    <SizeGuide />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 min-w-[3rem] px-4 border text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <span className="text-sm font-medium mb-3 block">Quantity</span>
                <div className="flex items-center border border-border w-fit">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="h-12 w-12 flex items-center justify-center hover:bg-secondary transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="h-12 w-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleAddToCart}
                  className={`w-full h-14 font-display text-lg tracking-wider btn-animate ${
                    isAdded ? 'bg-green-600 hover:bg-green-600' : ''
                  }`}
                  disabled={!isVariantAvailable && (product.sizes?.length > 0 || product.colors?.length > 0)}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      ADDED TO CART
                    </>
                  ) : !isVariantAvailable && selectedSize && selectedColor ? (
                    'OUT OF STOCK'
                  ) : (
                    'ADD TO CART'
                  )}
                </Button>
                {(!selectedSize && product.sizes?.length > 0) || (!selectedColor && product.colors?.length > 0) ? (
                  <p className="text-xs text-muted-foreground text-center">
                    Please select {!selectedColor && product.colors?.length > 0 && 'a color'}
                    {!selectedSize && !selectedColor && product.sizes?.length > 0 && product.colors?.length > 0 && ' and '}
                    {!selectedSize && product.sizes?.length > 0 && 'a size'}
                  </p>
                ) : null}
              </div>

              {/* Shipping Info - Indian Market */}
              <div className="flex flex-wrap gap-4 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping over ₹999</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  <span>7-day returns</span>
                </div>
                {product.codAvailable && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Banknote className="h-4 w-4" />
                    <span>Cash on Delivery</span>
                  </div>
                )}
              </div>

              {/* Product Details Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm font-medium">
                    Product Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {product.details?.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-foreground rounded-full" />
                          {detail}
                        </li>
                      ))}
                      {product.tags?.length > 0 && (
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-foreground rounded-full" />
                          Tags: {product.tags.join(', ')}
                        </li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care">
                  <AccordionTrigger className="text-sm font-medium">
                    Care Instructions
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-foreground rounded-full" />
                        Machine wash cold with like colors
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-foreground rounded-full" />
                        Tumble dry low
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-foreground rounded-full" />
                        Do not bleach
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-foreground rounded-full" />
                        Iron on low if needed
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-sm font-medium">
                    Shipping & Returns
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-muted-foreground space-y-3">
                      <p>
                        Free standard shipping on orders over ₹999. Orders ship within 
                        1-2 business days via Delhivery.
                      </p>
                      <p>
                        We offer easy returns within 7 days of delivery. Items must be 
                        unworn with tags attached.
                      </p>
                      {product.codAvailable && (
                        <p className="text-green-700">
                          Cash on Delivery available for this product. Additional ₹50 COD charges may apply.
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl sm:text-3xl tracking-wider mb-8 text-center">
              YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
