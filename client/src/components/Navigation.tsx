
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  User, 
  Home, 
  LogOut, 
  Settings,
  Package,
  FileText,
  BarChart3
} from 'lucide-react';
import type { User as UserType } from '../../../server/src/schema';

type Page = 'home' | 'product' | 'checkout' | 'login' | 'register' | 'profile' | 'myaccount' | 
            'admin-dashboard' | 'admin-products' | 'admin-orders' | 'admin-settings';

interface NavigationProps {
  user: UserType | null;
  cartCount: number;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Navigation({ user, cartCount, onNavigate, onLogout }: NavigationProps) {
  if (user?.role === 'admin') {
    return (
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 
                className="text-2xl font-bold text-green-600 cursor-pointer"
                onClick={() => onNavigate('admin-dashboard')}
              >
                Nucless Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-dashboard')}
                className="text-gray-600"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-products')}
                className="text-gray-600"
              >
                <Package className="h-4 w-4 mr-2" />
                Produk
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-orders')}
                className="text-gray-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Pesanan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-settings')}
                className="text-gray-600"
              >
                <Settings className="h-4 w-4 mr-2" />
                Pengaturan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 
                className="text-2xl font-bold text-green-600 cursor-pointer"
                onClick={() => onNavigate('home')}
              >
                💧 Nucless
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">Halo, {user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('myaccount')}
                    className="text-gray-600"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Akun Saya
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('login')}
                  className="text-green-600"
                >
                  <User className="h-4 w-4 mr-2" />
                  Masuk
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center p-2 text-xs"
          >
            <Home className="h-5 w-5 mb-1" />
            Beranda
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center p-2 text-xs"
          >
            <User className="h-5 w-5 mb-1" />
            Profil
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('checkout')}
            className="flex flex-col items-center p-2 text-xs relative"
          >
            <ShoppingCart className="h-5 w-5 mb-1" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-green-600">
                {cartCount}
              </Badge>
            )}
            Keranjang
          </Button>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('myaccount')}
              className="flex flex-col items-center p-2 text-xs"
            >
              <User className="h-5 w-5 mb-1" />
              Akun
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
