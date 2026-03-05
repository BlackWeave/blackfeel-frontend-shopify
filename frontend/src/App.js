import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/layout";
import { AuthModal } from "@/components/auth";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import AboutPage from "@/pages/AboutPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Placeholder routes for footer links */}
              <Route path="/size-guide" element={<ShopPage />} />
              <Route path="/shipping" element={<AboutPage />} />
              <Route path="/returns" element={<AboutPage />} />
              <Route path="/contact" element={<AboutPage />} />
              <Route path="/sustainability" element={<AboutPage />} />
              <Route path="/privacy" element={<AboutPage />} />
              <Route path="/terms" element={<AboutPage />} />
              <Route path="/account" element={<AboutPage />} />
            </Route>
          </Routes>
          <AuthModal />
          <Toaster />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
