'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronRight, 
  LogOut, 
  User, 
  Battery, 
  Zap, 
  Sun, 
  Package, 
  Home
} from 'lucide-react';
import { useAuth } from './AuthProvider';

const categories = [
  { name: 'Panel', path: '/products/Panel', icon: Sun },
  { name: 'Inverter', path: '/products/Inverter', icon: Zap },
  { name: 'Battery', path: '/products/Battery', icon: Battery },
];

export default function Sidebar({ selected, setSelected, isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [username, setUsername] = useState('Admin');

  // Get the username from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you would decode the JWT token or fetch user details
      // For simplicity, we're using a hardcoded value
      setUsername('admin');
    }
  }, []);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]);

  const handleCategorySelect = (categoryName, path) => {
    setSelected(categoryName);
    router.push(path);
    
    // Close sidebar on mobile when selecting a category
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger Button - Only visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 text-white bg-gray-900/90 border border-gray-700 p-2.5 rounded-lg hover:border-orange-500 hover:bg-gray-800 transition-all shadow-lg backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-40 transform transition-all duration-300 ease-in-out shadow-xl
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header with Logo and Close Button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-orange-500 rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-lg">SP</span>
            </div>
            <h2 className="text-white text-lg font-bold">Solar Products</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800/70 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-65px)]">
          <div className="overflow-y-auto py-2">
            {/* Dashboard Link */}
            <div className="px-3 mb-2">
              <button
                onClick={() => router.push('/dashboard')}
                className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all
                  ${pathname === '/dashboard' ? 'bg-orange-500 text-black' : 'text-white hover:bg-gray-800/70'}`}
              >
                <Home size={18} className={pathname === '/dashboard' ? 'text-black' : 'text-gray-400'} />
                <span>Dashboard</span>
                {pathname === '/dashboard' && <ChevronRight size={16} className="ml-auto" />}
              </button>
            </div>
            
            {/* Divider */}
            <div className="mx-3 h-px bg-gray-800 my-2"></div>
            
            {/* Category List */}
            <div className="px-3 mb-4">
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider px-3 mb-2">Categories</h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const isActive = selected === category.name;
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.name}
                      onClick={() => handleCategorySelect(category.name, category.path)}
                      className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all
                                ${isActive 
                                  ? 'bg-orange-500 text-black' 
                                  : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'}`}
                    >
                      <Icon size={18} className={isActive ? 'text-black' : 'text-gray-400'} />
                      <span>{category.name}</span>
                      {isActive && <ChevronRight size={16} className="ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Admin Links */}
            <div className="px-3">
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider px-3 mb-2">Management</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => router.push('/products/list')}
                  className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all
                              ${pathname.includes('/products/list') 
                                ? 'bg-orange-500 text-black' 
                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'}`}
                >
                  <Package size={18} className={pathname.includes('/products/list') ? 'text-black' : 'text-gray-400'} />
                  <span>All Products</span>
                  {pathname.includes('/products/list') && <ChevronRight size={16} className="ml-auto" />}
                </button>
                <button
                  onClick={() => router.push('/products/barcodes')}
                  className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all
                              ${pathname.includes('/products/barcodes') 
                                ? 'bg-orange-500 text-black' 
                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'}`}
                >
                  <Package size={18} className={pathname.includes('/products/barcodes') ? 'text-black' : 'text-gray-400'} />
                  <span>Barcodes</span>
                  {pathname.includes('/products/barcodes') && <ChevronRight size={16} className="ml-auto" />}
                </button>
              </nav>
            </div>
          </div>
          
          {/* User Section with Logout */}
          <div className="p-3 border-t border-gray-800">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                  <User size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{username}</p>
                  <p className="text-gray-500 text-xs">Administrator</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700/50 hover:bg-orange-500 text-gray-300 hover:text-black rounded-lg transition-all font-medium"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page overlay when sidebar is open on mobile */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
