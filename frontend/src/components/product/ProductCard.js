import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { getColorById, SIZES } from '@/data/products';

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] || product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addItem } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, selectedSize, selectedColor);
  };

  return (
    <>
      <div 
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`} className="block">
          {/* Image Container */}
          <div className="aspect-product overflow-hidden bg-secondary relative">
            <img
              src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            
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
              <span className="font-display text-lg">${product.price}</span>
            </div>
            
            {/* Color Options Preview */}
            <div className="flex items-center gap-2">
              {product.colors.slice(0, 4).map((colorId) => {
                const color = getColorById(colorId);
                return (
                  <span
                    key={colorId}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color?.hex }}
                    title={color?.name}
                  />
                );
              })}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
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
            <div className="aspect-product bg-secondary overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h2 className="font-display text-2xl tracking-wider mb-1">
                {product.name.toUpperCase()}
              </h2>
              <p className="font-display text-xl mb-4">${product.price}</p>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="mb-4">
                <span className="text-sm font-medium mb-2 block">Color</span>
                <div className="flex gap-2">
                  {product.colors.map((colorId) => {
                    const color = getColorById(colorId);
                    return (
                      <button
                        key={colorId}
                        onClick={() => setSelectedColor(colorId)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === colorId 
                            ? 'border-foreground scale-110' 
                            : 'border-transparent hover:border-muted-foreground'
                        }`}
                        style={{ backgroundColor: color?.hex }}
                        title={color?.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
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

              {/* Add to Cart */}
              <div className="mt-auto space-y-3">
                <Button 
                  className="w-full h-12 font-display text-lg tracking-wider btn-animate"
                  onClick={() => {
                    addItem(product, selectedSize, selectedColor);
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
                  <Link to={`/product/${product.id}`}>View Full Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
