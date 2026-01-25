import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOGO_URL, PRODUCT_IMAGES } from '@/data/products';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={PRODUCT_IMAGES.editorial2}
            alt="About Swan Tee"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wider mb-4">
            OUR STORY
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Building the perfect t-shirt, one thread at a time.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <img 
              src={LOGO_URL} 
              alt="Swan Tee" 
              className="h-20 w-auto mx-auto mb-8"
            />
            <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-8">
              THE PURSUIT OF PERFECTION
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Swan Tee was born from a simple frustration: finding a t-shirt that truly 
              delivers on quality. After years of disappointment with t-shirts that shrink, 
              fade, or lose their shape, we decided to create our own.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We spent three years developing the perfect tee. Testing over 50 cotton blends, 
              refining our construction techniques, and obsessing over every detail—from the 
              weight of the fabric to the invisible stitching that gives our shirts their 
              clean aesthetic.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl sm:text-4xl tracking-wider text-center mb-16">
            WHAT WE BELIEVE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-foreground rounded-full flex items-center justify-center">
                <span className="font-display text-2xl">01</span>
              </div>
              <h3 className="font-display text-xl tracking-wider mb-4">QUALITY FIRST</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We never compromise on materials or construction. Every shirt is made with 
                100% Supima cotton—the finest cotton grown in America—and built to last 
                through hundreds of washes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-foreground rounded-full flex items-center justify-center">
                <span className="font-display text-2xl">02</span>
              </div>
              <h3 className="font-display text-xl tracking-wider mb-4">TIMELESS DESIGN</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We design for longevity, not trends. Our classic silhouettes and clean 
                aesthetics ensure your Swan Tee will look just as good years from now 
                as it does today.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-foreground rounded-full flex items-center justify-center">
                <span className="font-display text-2xl">03</span>
              </div>
              <h3 className="font-display text-xl tracking-wider mb-4">HONEST PRICING</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                By selling directly to you, we offer premium quality at fair prices. 
                No middlemen, no excessive markups—just exceptional value for 
                exceptional products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-xs tracking-widest text-muted-foreground mb-4 block">
                THE PROCESS
              </span>
              <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-6">
                CRAFTED WITH INTENTION
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every Swan Tee begins with premium Supima cotton, sourced from family 
                farms in California's San Joaquin Valley. This cotton is known for its 
                extra-long fibers, which create a softer, stronger, and more durable fabric.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Our shirts are then constructed using proprietary invisible stitching 
                techniques, ensuring clean lines and eliminating the bulk and discomfort 
                of traditional seams. The result is a t-shirt that looks as refined on 
                the inside as it does on the outside.
              </p>
              <ul className="space-y-3">
                {[
                  'Sourced from California family farms',
                  'Pre-shrunk for consistent sizing',
                  'Reinforced shoulder seams',
                  'Tagless for comfort',
                  'Designed for 500+ washes'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 aspect-square bg-secondary overflow-hidden">
              <img
                src={PRODUCT_IMAGES.product1}
                alt="Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collections Overview */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-4">
              THREE COLLECTIONS
            </h2>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">
              Each collection serves a different purpose, but all share our commitment 
              to exceptional quality.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="font-display text-2xl tracking-wider mb-3">BASIC</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
                Timeless essentials for everyday wear. No logos, no prints—just 
                perfectly constructed basics.
              </p>
              <span className="font-display text-lg">From $39</span>
            </div>
            <div className="text-center">
              <h3 className="font-display text-2xl tracking-wider mb-3">VOTED DESIGNS</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
                Community favorites. Designs chosen by our customers for those who 
                want something more expressive.
              </p>
              <span className="font-display text-lg">From $49</span>
            </div>
            <div className="text-center">
              <h3 className="font-display text-2xl tracking-wider mb-3">AI</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
                Where technology meets artistry. Unique patterns generated by AI, 
                each batch one-of-a-kind.
              </p>
              <span className="font-display text-lg">From $59</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl tracking-wider mb-6">
            EXPERIENCE THE DIFFERENCE
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Join thousands of customers who've upgraded their wardrobe with Swan Tee. 
            Once you try it, you'll understand why we call it the perfect t-shirt.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="h-14 px-10 font-display text-lg tracking-wider btn-animate"
          >
            <Link to="/shop">
              SHOP NOW
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
