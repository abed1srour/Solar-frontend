'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Create auth context
export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        
        // If not on login page, redirect to login
        if (pathname !== '/login') {
          router.push('/login');
        }
        return;
      }
      
      try {
        // Verify token with backend (optional but recommended for real apps)
        // For simplicity, we're just checking if the token exists
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        
        // Redirect to login
        if (pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  // Handle logout
  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Auth values to provide
  const authValues = {
    isAuthenticated,
    isLoading,
    logout
  };

  // Don't render children until we've checked authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If we're on the login page, render it
  if (pathname === '/login') {
    return children;
  }

  // If authenticated, render the children
  if (isAuthenticated) {
    return (
      <AuthContext.Provider value={authValues}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Otherwise show nothing (redirect handled in useEffect)
  return null;
} 