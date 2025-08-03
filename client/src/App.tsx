
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import type { User, Product, OrderWithItems, AuthResponse } from '../../server/src/schema';

// Components
import { HomePage } from '@/components/HomePage';
import { ProductDetails } from '@/components/ProductDetails';
import { CheckoutPage } from '@/components/CheckoutPage';
import { LoginPage } from '@/components/LoginPage';
import { RegisterPage } from '@/components/RegisterPage';
import { ProfilePage } from '@/components/ProfilePage';
import { MyAccountPage } from '@/components/MyAccountPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminProducts } from '@/components/AdminProducts';
import { AdminOrders } from '@/components/AdminOrders';
import { AdminSettings } from '@/components/AdminSettings';
import { Navigation } from '@/components/Navigation';

type Page = 'home' | 'product' | 'checkout' | 'login' | 'register' | 'profile' | 'myaccount' | 
            'admin-dashboard' | 'admin-products' | 'admin-orders' | 'admin-settings';

interface Cart {
  productId: number;
  quantity: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [cart, setCart] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load products on app start
  const loadProducts = useCallback(async () => {
    try {
      const result = await trpc.getProducts.query();
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Fallback data when backend is not fully implemented
      setProducts([
        {
          id: 1,
          name: 'Nucless Galon 19L',
          description: 'Air mineral berkualitas tinggi dalam kemasan galon 19 liter',
          price: 15000,
          image_url: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Nucless Galon 12L',
          description: 'Air mineral berkualitas tinggi dalam kemasan galon 12 liter',
          price: 12000,
          image_url: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    }
  }, []);

  // Load user orders
  const loadUserOrders = useCallback(async () => {
    if (!user) return;
    try {
      const result = await trpc.getUserOrders.query(user.id);
      setOrders(result);
    } catch (error) {
      console.error('Failed to load user orders:', error);
      // Initialize empty orders when backend is not ready
      setOrders([]);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
    
    // Check for stored auth token
    const storedUser = localStorage.getItem('nucless_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [loadProducts]);

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user, loadUserOrders]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result: AuthResponse = await trpc.login.mutate({ email, password });
      setUser(result.user);
      localStorage.setItem('nucless_user', JSON.stringify(result.user));
      localStorage.setItem('nucless_token', result.token);
      
      // Redirect based on role
      if (result.user.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('home');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login gagal. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string, phone: string | null) => {
    setIsLoading(true);
    try {
      const result: AuthResponse = await trpc.register.mutate({ 
        name, 
        email, 
        password, 
        phone,
        role: 'customer' 
      });
      setUser(result.user);
      localStorage.setItem('nucless_user', JSON.stringify(result.user));
      localStorage.setItem('nucless_token', result.token);
      setCurrentPage('home');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registrasi gagal. Periksa data Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nucless_user');
    localStorage.removeItem('nucless_token');
    setCurrentPage('home');
    setCart([]);
  };

  const addToCart = (productId: number, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCart(prev => 
        prev.map(item => 
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const navigateTo = (page: Page, productId?: number) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            products={products}
            onProductClick={(id) => navigateTo('product', id)}
            onAddToCart={addToCart}
          />
        );
      case 'product': {
        const selectedProduct = products.find(p => p.id === selectedProductId);
        return selectedProduct ? (
          <ProductDetails 
            product={selectedProduct}
            onAddToCart={addToCart}
            onBack={() => navigateTo('home')}
          />
        ) : (
          <div className="p-4">Product not found</div>
        );
      }
      case 'checkout':
        return (
          <CheckoutPage 
            cart={cart}
            products={products}
            user={user}
            onOrderComplete={() => {
              clearCart();
              navigateTo('myaccount');
            }}
            onBack={() => navigateTo('home')}
            updateQuantity={updateCartQuantity}
          />
        );
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin}
            onSwitchToRegister={() => navigateTo('register')}
            isLoading={isLoading}
          />
        );
      case 'register':
        return (
          <RegisterPage 
            onRegister={handleRegister}
            onSwitchToLogin={() => navigateTo('login')}
            isLoading={isLoading}
          />
        );
      case 'profile':
        return <ProfilePage onBack={() => navigateTo('home')} />;
      case 'myaccount':
        return (
          <MyAccountPage 
            user={user}
            orders={orders}
            onBack={() => navigateTo('home')}
            onRefreshOrders={loadUserOrders}
          />
        );
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigateTo} />;
      case 'admin-products':
        return (
          <AdminProducts 
            products={products}
            onProductsChange={loadProducts}
            onBack={() => navigateTo('admin-dashboard')}
          />
        );
      case 'admin-orders':
        return (
          <AdminOrders 
            onBack={() => navigateTo('admin-dashboard')}
          />
        );
      case 'admin-settings':
        return (
          <AdminSettings 
            onBack={() => navigateTo('admin-dashboard')}
          />
        );
      default:
        return <HomePage products={products} onProductClick={(id) => navigateTo('product', id)} onAddToCart={addToCart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation 
        user={user}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="pb-16">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;
