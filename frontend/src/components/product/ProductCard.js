import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/shopify';
import { getColorById } from '@/data/site';

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[2] || product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const { addVariant } = useCart();

  const currencyCode = product.currencyCode || 'INR';

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addVariant(product, selectedSize, selectedColor);
    } catch (err) {
      console.error('Quick-add failed:', err);
    }
  };

  // Get color display info (handles both mock data format and Shopify format)
  const getColorInfo = (color) => {
    if (typeof color === 'string') {
      const mockColor = getColorById(color);
      return {
        id: color,
        name: mockColor?.name || color,
        hex: mockColor?.hex || color.toLowerCase(),
      };
    }
    return color;
  };

  return (
    <>
      <div 
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id || product.handle}`} className="block">
          {/* Image Container */}
          <div className="aspect-product overflow-hidden bg-secondary relative">
            <img
              src={isHovered && product.images?.[1] ? product.images[1] : (product.images?.[0] || '/placeholder.png')}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            
            {/* COD Badge */}
            {product.codAvailable && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 bg-green-100 text-green-800 hover:bg-green-100 text-[10px]"
              >
                <Banknote className="h-3 w-3 mr-1" />
                COD
              </Badge>
            )}
            
            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="absolute top-4 right-4 h-10 w-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Quick Add to Cart */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button 
                className="w-full h-11 font-display tracking-wider btn-animate"
                onClick={handleQuickAdd}
              >
                ADD TO CART
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="pt-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm group-hover:underline underline-offset-4 transition-all">
                {product.name}
              </h3>
              <span className="font-display text-lg">
                {formatPrice(product.price, currencyCode)}
              </span>
            </div>
            
            {/* Color Options Preview */}
            {product.colors?.length > 0 && (
              <div className="flex items-center gap-2">
                {product.colors.slice(0, 4).map((color, idx) => {
                  const colorInfo = getColorInfo(color);
                  return (
                    <span
                      key={colorInfo.id || idx}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: colorInfo.hex }}
                      title={colorInfo.name}
                    />
                  );
                })}
                {product.colors.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="aspect-product bg-secondary overflow-hidden relative">
              <img
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.codAvailable && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 bg-green-100 text-green-800"
                >
                  <Banknote className="h-3 w-3 mr-1" />
                  COD Available
                </Badge>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h2 className="font-display text-2xl tracking-wider mb-1">
                {product.name?.toUpperCase()}
              </h2>
              <p className="font-display text-xl mb-4">
                {formatPrice(product.price, currencyCode)}
              </p>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium mb-2 block">Color</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, idx) => {
                      const colorInfo = getColorInfo(color);
                      return (
                        <button
                          key={colorInfo.id || idx}
                          onClick={() => setSelectedColor(colorInfo.name || color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === (colorInfo.name || color)
                              ? 'border-foreground scale-110' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                          style={{ backgroundColor: colorInfo.hex }}
                          title={colorInfo.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <span className="text-sm font-medium mb-2 block">Size</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 min-w-[2.5rem] px-3 border text-sm font-medium transition-colors ${
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

              {/* Add to Cart */}
              <div className="mt-auto space-y-3">
                <Button
                  className="w-full h-12 font-display text-lg tracking-wider btn-animate"
                  onClick={async () => {
                    try {
                      await addVariant(product, selectedSize, selectedColor);
                    } catch (err) {
                      console.error('Quick-add failed:', err);
                    }
                    setShowQuickView(false);
                  }}
                >
                  ADD TO CART
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowQuickView(false)}
                  asChild
                >
                  <Link to={`/product/${product.id || product.handle}`}>View Full Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
