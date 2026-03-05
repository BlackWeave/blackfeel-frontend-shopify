import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/context/CartContext';
import { useAuth, PROTECTED_CATEGORIES } from '@/context/AuthContext';
import { CartDrawer } from './CartDrawer';
import { LOGO_URL } from '@/data/products';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, signOut, requestAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;

  // Check if a nav link requires auth and handle accordingly
  const handleNavClick = (e, href, category) => {
    if (category && PROTECTED_CATEGORIES.includes(category) && !isAuthenticated) {
      e.preventDefault();
      requestAuth(href);
      return false;
    }
    return true;
  };

  const navLinks = [
    { href: '/shop', label: 'Shop', category: null },
    { href: '/shop?category=basic', label: 'Basic', category: 'basic' },
    { href: '/shop?category=voted', label: 'Voted Designs', category: 'voted' },
    { href: '/shop?category=ai', label: 'AI', category: 'ai' },
    { href: '/about', label: 'About', category: null },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2 text-center text-xs font-medium tracking-wide">
          FREE SHIPPING ON ORDERS OVER $100
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-4 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => {
                      if (handleNavClick(e, link.href, link.category)) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="text-lg font-medium tracking-wide hover:text-muted-foreground transition-colors flex items-center gap-2"
                  >
                    {link.label}
                    {link.category && PROTECTED_CATEGORIES.includes(link.category) && !isAuthenticated && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        Sign in
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation - Left */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.category)}
                className={`text-sm font-medium tracking-wide link-underline transition-colors ${
                  isActive(link.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label.toUpperCase()}
                {link.category && PROTECTED_CATEGORIES.includes(link.category) && !isAuthenticated && (
                  <span className="ml-1 text-[10px] align-super">●</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logo - Center */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <img 
              src={LOGO_URL} 
              alt="Swan Tee" 
              className="h-10 w-auto"
            />
            <span className="font-display text-2xl tracking-wider hidden sm:block">SWAN TEE</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop About Link */}
            <Link
              to="/about"
              className="hidden lg:block text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground link-underline transition-colors"
            >
              ABOUT
            </Link>
            
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* User Menu / Sign In */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="font-medium text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="h-4 w-4 mr-2" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10"
                onClick={() => requestAuth()}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Sign In</span>
              </Button>
            )}

            {/* Cart Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
};
