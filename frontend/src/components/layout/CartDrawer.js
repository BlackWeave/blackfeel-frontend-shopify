import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/context/CartContext';
import { formatPrice, isShopifyConfigured } from '@/lib/shopify';

export const CartDrawer = () => {
  const {
    lines,
    totalItems,
    subtotal,
    total,
    currencyCode,
    isCartOpen,
    setIsCartOpen,
    isLoading,
    error,
    removeLine,
    updateLineQuantity,
    openCheckout,
  } = useCart();

  const displayPrice = (amount) => formatPrice(amount ?? 0, currencyCode);

  const lineImage = (line) =>
    line.merchandise?.image?.url ||
    line.merchandise?.product?.featuredImage?.url ||
    '/placeholder.png';

  const lineTitle = (line) =>
    line.merchandise?.product?.title || 'Item';

  const lineVariant = (line) => {
    const opts = line.merchandise?.selectedOptions || [];
    return opts.map((o) => o.value).join(' / ');
  };

  const handleCheckout = () => {
    openCheckout();
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="font-display text-xl tracking-wider">
            YOUR CART ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
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
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex gap-4 p-3 bg-secondary/30 rounded-sm"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
                      <img
                        src={lineImage(line)}
                        alt={lineTitle(line)}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm truncate pr-2">
                            {lineTitle(line)}
                          </h4>
                          {lineVariant(line) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {lineVariant(line)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeLine(line.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() =>
                              updateLineQuantity(line.id, line.quantity - 1)
                            }
                            className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors"
                            disabled={line.quantity <= 1 || isLoading}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateLineQuantity(line.id, line.quantity + 1)
                            }
                            className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors"
                            disabled={isLoading}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-medium text-sm">
                          {displayPrice(line.cost?.totalAmount?.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Footer */}
            <div className="border-t border-border pt-4 space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl">
                  {displayPrice(subtotal)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Shipping & taxes calculated at checkout
              </p>

              <Button
                className="w-full h-12 font-display text-lg tracking-wider btn-animate"
                onClick={handleCheckout}
                disabled={isLoading || !checkoutUrl}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  'CHECKOUT'
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                {isShopifyConfigured()
                  ? 'Razorpay • UPI • Cards • COD • Delhivery Shipping'
                  : 'Configure Shopify to enable checkout'}
              </p>

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
