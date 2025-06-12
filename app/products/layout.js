'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/sidebar';

export default function ProductsLayout({ children }) {
  const [selectedCategory, setSelectedCategory] = useState('Panel');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Get category from URL path for initial state and direct navigation
  useEffect(() => {
    // Handle category mapping between URL and display names
    if (pathname.includes('/products/Panel')) {
      setSelectedCategory('Panel');
    } else if (pathname.includes('/products/Inverter')) {
      setSelectedCategory('Inverter');
    } else if (pathname.includes('/products/Battery')) {
      setSelectedCategory('Battery');
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Include Sidebar for all pages */}
      <Sidebar 
        selected={selectedCategory} 
        setSelected={setSelectedCategory}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main Content - Adjusts based on sidebar state */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-72' : ''
        } p-4`}
      >
        {children}
      </div>
    </div>
  );
} 