import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Filter, X, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth, PROTECTED_CATEGORIES } from '@/context/AuthContext';
import { fetchProducts, fetchProductsByCollection, isShopifyConfigured } from '@/lib/shopify';
import { PRODUCTS, CATEGORIES, COLORS, SIZES } from '@/data/products';

// Filter Content Component (moved outside to prevent re-render issues)
const FilterContent = ({ 
  selectedCategory, 
  selectedColors, 
  selectedSizes, 
  hasActiveFilters,
  updateFilters,
  toggleArrayFilter,
  clearFilters,
  isAuthenticated,
  onProtectedClick
}) => (
  <div className="space-y-8">
    {/* Categories */}
    <div>
      <h4 className="font-display text-sm tracking-wider mb-4">CATEGORIES</h4>
      <div className="space-y-3">
        <button
          onClick={() => updateFilters('category', '')}
          className={`block text-sm transition-colors ${
            !selectedCategory ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Products
        </button>
        {CATEGORIES.map((cat) => {
          const isProtected = PROTECTED_CATEGORIES.includes(cat.id);
          const needsAuth = isProtected && !isAuthenticated;
          
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (needsAuth) {
                  onProtectedClick(cat.id);
                } else {
                  updateFilters('category', cat.id);
                }
              }}
              className={`flex items-center gap-2 text-sm transition-colors ${
                selectedCategory === cat.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
              {needsAuth && <Lock className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>

    <Separator />

    {/* Colors */}
    <div>
      <h4 className="font-display text-sm tracking-wider mb-4">COLORS</h4>
      <div className="space-y-3">
        {COLORS.map((color) => (
          <label key={color.id} className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={selectedColors.includes(color.id)}
              onCheckedChange={() => toggleArrayFilter('colors', color.id)}
            />
            <span
              className="w-5 h-5 rounded-full border border-border"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {color.name}
            </span>
          </label>
        ))}
      </div>
    </div>

    <Separator />

    {/* Sizes */}
    <div>
      <h4 className="font-display text-sm tracking-wider mb-4">SIZES</h4>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => toggleArrayFilter('sizes', size)}
            className={`h-10 min-w-[2.5rem] px-3 border text-sm font-medium transition-colors ${
              selectedSizes.includes(size)
                ? 'border-foreground bg-foreground text-background'
                : 'border-border hover:border-foreground'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>

    {hasActiveFilters && (
      <>
        <Separator />
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      </>
    )}
  </div>
);

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { isAuthenticated, requestAuth } = useAuth();
  const navigate = useNavigate();
  
  // Get filter values from URL - memoized to prevent unnecessary re-renders
  const selectedCategory = searchParams.get('category') || '';
  const colorsParam = searchParams.get('colors');
  const sizesParam = searchParams.get('sizes');
  const sortBy = searchParams.get('sort') || 'featured';
  
  // Check if current category requires auth
  useEffect(() => {
    if (selectedCategory && PROTECTED_CATEGORIES.includes(selectedCategory) && !isAuthenticated) {
      // Redirect to shop and show auth modal
      setSearchParams({});
      requestAuth(`/shop?category=${selectedCategory}`);
    }
  }, [selectedCategory, isAuthenticated, requestAuth, setSearchParams]);
  
  const selectedColors = useMemo(() => 
    colorsParam?.split(',').filter(Boolean) || [], 
    [colorsParam]
  );
  
  const selectedSizes = useMemo(() => 
    sizesParam?.split(',').filter(Boolean) || [], 
    [sizesParam]
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by colors
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        p.colors.some(c => selectedColors.includes(c))
      );
    }

    // Filter by sizes
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizes.some(s => selectedSizes.includes(s))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order for 'featured'
        break;
    }

    return result;
  }, [selectedCategory, selectedColors, selectedSizes, sortBy]);

  // Update URL params
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const toggleArrayFilter = (key, value) => {
    const currentValues = searchParams.get(key)?.split(',').filter(Boolean) || [];
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    updateFilters(key, newValues.join(','));
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory || selectedColors.length > 0 || selectedSizes.length > 0;

  const currentCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Products';

  // Handle protected category click
  const handleProtectedClick = (categoryId) => {
    requestAuth(`/shop?category=${categoryId}`);
  };

  // Common filter props
  const filterProps = {
    selectedCategory,
    selectedColors,
    selectedSizes,
    hasActiveFilters,
    updateFilters,
    toggleArrayFilter,
    clearFilters,
    isAuthenticated,
    onProtectedClick: handleProtectedClick
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-2xl">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Shop</span>
              {selectedCategory && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-foreground">{currentCategoryName}</span>
                </>
              )}
            </nav>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-4">
              {currentCategoryName.toUpperCase()}
            </h1>
            <p className="text-muted-foreground">
              {selectedCategory 
                ? CATEGORIES.find(c => c.id === selectedCategory)?.description
                : 'Browse our complete collection of premium t-shirts.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 lg:gap-12">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-display text-lg tracking-wider mb-6">FILTERS</h3>
              <FilterContent {...filterProps} />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-1 h-5 w-5 rounded-full bg-foreground text-background text-xs flex items-center justify-center">
                          {(selectedCategory ? 1 : 0) + selectedColors.length + selectedSizes.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="font-display text-lg tracking-wider">
                        FILTERS
                      </SheetTitle>
                    </SheetHeader>
                    <FilterContent {...filterProps} />
                  </SheetContent>
                </Sheet>

                {/* Results Count */}
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilters('sort', e.target.value)}
                  className="h-9 px-3 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory && (
                  <button
                    onClick={() => updateFilters('category', '')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {currentCategoryName}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedColors.map((colorId) => {
                  const color = COLORS.find(c => c.id === colorId);
                  return (
                    <button
                      key={colorId}
                      onClick={() => toggleArrayFilter('colors', colorId)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: color?.hex }}
                      />
                      {color?.name}
                      <X className="h-3 w-3" />
                    </button>
                  );
                })}
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleArrayFilter('sizes', size)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                  >
                    Size: {size}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">
                  No products found matching your filters.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
