import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(undefined);

// Protected categories that require authentication
export const PROTECTED_CATEGORIES = ['voted', 'ai'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectPath, setAuthRedirectPath] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('swantee_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('swantee_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('swantee_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('swantee_user');
    }
  }, [user]);

  // Sign in with Google (mock implementation - replace with real Google OAuth)
  const signInWithGoogle = useCallback(async () => {
    try {
      // MOCK: Simulate Google OAuth response
      // In production, this would be replaced with actual Google OAuth flow
      // using @react-oauth/google or similar library
      
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        name: 'Demo User',
        email: 'demo@example.com',
        picture: 'https://ui-avatars.com/api/?name=Demo+User&background=0a0a0a&color=fff',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(mockGoogleUser);
      setShowAuthModal(false);
      
      return { success: true, user: mockGoogleUser };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Sign out
  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('swantee_user');
  }, []);

  // Check if a category requires authentication
  const requiresAuth = useCallback((category) => {
    return PROTECTED_CATEGORIES.includes(category);
  }, []);

  // Request authentication (opens modal)
  const requestAuth = useCallback((redirectPath = null) => {
    setAuthRedirectPath(redirectPath);
    setShowAuthModal(true);
  }, []);

  // Check if user can access a protected resource
  const canAccess = useCallback((category) => {
    if (!requiresAuth(category)) return true;
    return !!user;
  }, [user, requiresAuth]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    showAuthModal,
    setShowAuthModal,
    authRedirectPath,
    setAuthRedirectPath,
    signInWithGoogle,
    signOut,
    requiresAuth,
    requestAuth,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
