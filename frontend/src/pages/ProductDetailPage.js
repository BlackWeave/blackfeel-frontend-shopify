import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Minus, Plus, Check, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCart } from '@/context/CartContext';
import { SizeGuide } from '@/components/product/SizeGuide';
import { ProductCard } from '@/components/product/ProductCard';
import { getProductById, getColorById, PRODUCTS, CATEGORIES } from '@/data/products';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const product = getProductById(productId);
  const { addItem } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Get related products (same category, different product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === product.category);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }
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
                src={product.images[selectedImageIndex]}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
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
            {product.images.length > 1 && (
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
              <Link 
                to={`/shop?category=${product.category}`}
                className="inline-block text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {category?.name.toUpperCase()}
              </Link>

              {/* Title & Price */}
              <div>
                <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                  {product.name.toUpperCase()}
                </h1>
                <p className="font-display text-2xl">${product.price}</p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <Separator />

              {/* Color Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    Color: {selectedColor && getColorById(selectedColor)?.name}
                  </span>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((colorId) => {
                    const color = getColorById(colorId);
                    return (
                      <button
                        key={colorId}
                        onClick={() => setSelectedColor(colorId)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === colorId 
                            ? 'border-foreground scale-110' 
                            : 'border-transparent hover:border-muted-foreground'
                        }`}
                        style={{ backgroundColor: color?.hex }}
                        title={color?.name}
                      >
                        {selectedColor === colorId && (
                          <Check className={`h-4 w-4 ${
                            colorId === 'white' || colorId === 'bone' ? 'text-foreground' : 'text-background'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
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
                  disabled={!selectedSize || !selectedColor}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      ADDED TO CART
                    </>
                  ) : (
                    'ADD TO CART'
                  )}
                </Button>
                {(!selectedSize || !selectedColor) && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please select {!selectedColor && 'a color'}{!selectedSize && !selectedColor && ' and '}{!selectedSize && 'a size'}
                  </p>
                )}
              </div>

              {/* Shipping Info */}
              <div className="flex gap-6 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping over $100</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  <span>30-day returns</span>
                </div>
              </div>

              {/* Product Details Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm font-medium">
                    Product Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {product.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-foreground rounded-full" />
                          {detail}
                        </li>
                      ))}
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
                        Free standard shipping on orders over $100. Orders ship within 
                        1-2 business days.
                      </p>
                      <p>
                        We offer free returns within 30 days of purchase. Items must be 
                        unworn with tags attached.
                      </p>
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
