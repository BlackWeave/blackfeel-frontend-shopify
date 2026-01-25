import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/context/CartContext';
import { getColorById } from '@/data/products';

export const CartDrawer = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalPrice, 
    isCartOpen, 
    setIsCartOpen 
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="font-display text-xl tracking-wider">
            YOUR CART ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add something to make it happy
              </p>
            </div>
            <Button 
              onClick={() => setIsCartOpen(false)}
              asChild
              className="btn-animate"
            >
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {items.map((item) => {
                  const color = getColorById(item.color);
                  return (
                    <div 
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-4 p-3 bg-secondary/30 rounded-sm"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm truncate pr-2">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {item.size}
                              </span>
                              <span className="text-xs text-muted-foreground">/</span>
                              <div className="flex items-center gap-1">
                                <span
                                  className="w-3 h-3 rounded-full border border-border"
                                  style={{ backgroundColor: color?.hex }}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {color?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() => updateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )}
                              className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )}
                              className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-medium text-sm">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Cart Footer */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl">${totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Shipping calculated at checkout
              </p>
              <Button 
                className="w-full h-12 font-display text-lg tracking-wider btn-animate"
                onClick={() => {
                  // This would connect to Medusa checkout
                  alert('Checkout would connect to Medusa backend');
                }}
              >
                CHECKOUT
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsCartOpen(false)}
                asChild
              >
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
