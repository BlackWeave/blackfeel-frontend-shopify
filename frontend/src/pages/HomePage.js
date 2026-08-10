import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Truck, RefreshCw, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth, PROTECTED_CATEGORIES } from '@/context/AuthContext';
import { fetchProducts, isShopifyConfigured } from '@/lib/shopify';
import { CATEGORIES, HERO_IMAGE, LOGO_URL } from '@/data/site';
import { PRODUCTS } from '@/data/products';

export default function HomePage() {
  const { isAuthenticated, requestAuth } = useAuth();
  const navigate = useNavigate();

  // Featured products are loaded from Shopify when configured, otherwise
  // fall back to the first mock product per category.
  const [featuredProducts, setFeaturedProducts] = useState(() =>
    CATEGORIES.map((cat) => PRODUCTS.find((p) => p.category === cat.id)).filter(Boolean)
  );

  useEffect(() => {
    let cancelled = false;
    async function loadFeatured() {
      if (!isShopifyConfigured()) return;
      try {
        const products = await fetchProducts(50);
        if (cancelled || products.length === 0) return;
        // Pick one product per category in CATEGORIES order.
        const byCategory = CATEGORIES.map((cat) =>
          products.find((p) => {
            const productType = (p.raw?.productType || '').toLowerCase();
            return productType === cat.id;
          })
        ).filter(Boolean);
        if (byCategory.length > 0) {
          setFeaturedProducts(byCategory);
        }
      } catch (err) {
        console.error('Failed to load featured products from Shopify:', err);
      }
    }
    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle category click with auth check
  const handleCategoryClick = (e, category) => {
    if (PROTECTED_CATEGORIES.includes(category.id) && !isAuthenticated) {
      e.preventDefault();
      requestAuth(`/shop?category=${category.id}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Swan Tee Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in-up max-w-3xl mx-auto">
            <img 
              src={LOGO_URL} 
              alt="Swan Tee" 
              className="h-24 w-auto mx-auto mb-8 drop-shadow-lg"
            />
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wider mb-6 text-foreground">
              THE PERFECT TEE
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Premium Supima cotton. Invisible stitching. 
              No compromise on quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-10 font-display text-lg tracking-wider btn-animate"
              >
                <Link to="/shop">SHOP NOW</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="h-14 px-10 font-display text-lg tracking-wider bg-background/50 backdrop-blur-sm border-foreground/20 hover:bg-background/80"
              >
                <Link to="/about">OUR STORY</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-center justify-center gap-3 text-center sm:text-left sm:justify-start">
              <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">Free shipping over $100</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-center">
              <RefreshCw className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">30-day easy returns</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-center sm:text-right sm:justify-end">
              <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">2-year quality guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-4">
              COLLECTIONS
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three distinct collections, one commitment to quality. Find your perfect tee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                onClick={(e) => handleCategoryClick(e, category)}
                className="group relative aspect-[3/4] overflow-hidden bg-secondary"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                
                {/* Lock overlay for protected categories */}
                {PROTECTED_CATEGORIES.includes(category.id) && !isAuthenticated && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Sign in to access
                  </div>
                )}
                
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="text-xs tracking-widest text-muted-foreground mb-2">
                    FROM ${category.price}
                  </span>
                  <h3 className="font-display text-3xl tracking-wider mb-2">
                    {category.name.toUpperCase()}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                    <span>Shop Collection</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                FEATURED
              </h2>
              <p className="text-muted-foreground">
                Our most popular pieces, chosen by you.
              </p>
            </div>
            <Link 
              to="/shop" 
              className="flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Quality Story Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="aspect-square lg:aspect-[4/5] bg-secondary overflow-hidden">
              <img
                src={featuredProducts[0]?.images?.[0] || PRODUCTS[0].images[0]}
                alt="Quality craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="max-w-lg">
              <span className="text-xs tracking-widest text-muted-foreground mb-4 block">
                THE DIFFERENCE
              </span>
              <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-6">
                BUILT THE
                <br />
                HARD WAY
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We spent three years obsessing over every detail. From sourcing the finest 
                Supima cotton to perfecting our invisible stitching technique, every decision 
                was made with one goal: creating the perfect t-shirt.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  '100% Supima cotton from California',
                  'Pre-shrunk to maintain perfect fit',
                  'Invisible reinforced stitching',
                  'Designed for 500+ washes'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="h-12 px-8 font-display tracking-wider">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
              WHAT PEOPLE SAY
            </h2>
            <p className="text-primary-foreground/70">
              Join thousands of satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                quote: "The best t-shirt I have ever owned. The fit is perfect and it has held up amazingly after dozens of washes.",
                author: "Alex M.",
                title: "Verified Buyer"
              },
              {
                quote: "Finally, a brand that delivers on its promises. The quality is exceptional and the attention to detail is remarkable.",
                author: "Sarah K.",
                title: "Verified Buyer"
              },
              {
                quote: "I've replaced my entire wardrobe with Swan Tee basics. Worth every penny for the quality and comfort.",
                author: "Michael R.",
                title: "Verified Buyer"
              }
            ].map((review, i) => (
              <div key={i} className="text-center">
                <p className="text-lg leading-relaxed mb-6 text-primary-foreground/90">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div>
                  <span className="font-medium">{review.author}</span>
                  <span className="text-primary-foreground/60 text-sm block">
                    {review.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-4">
              JOIN THE FLOCK
            </h2>
            <p className="text-muted-foreground mb-8">
              Be the first to know about new releases, exclusive offers, and more.
            </p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert('Newsletter signup would connect to backend');
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 bg-transparent border border-border focus:border-foreground outline-none text-sm transition-colors"
                required
              />
              <Button type="submit" className="h-12 px-8 font-display tracking-wider">
                SUBSCRIBE
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
