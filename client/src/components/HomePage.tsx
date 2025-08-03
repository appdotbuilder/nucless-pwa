
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Droplets, Star, Award, Clock } from 'lucide-react';
import type { Product } from '../../../server/src/schema';

interface HomePageProps {
  products: Product[];
  onProductClick: (id: number) => void;
  onAddToCart: (productId: number, quantity: number) => void;
}

export function HomePage({ products, onProductClick, onAddToCart }: HomePageProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              💧 Air Mineral Berkualitas
            </h1>
            <p className="text-lg opacity-90 mb-4">
              Galon isi ulang terpercaya untuk keluarga Indonesia
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2" />
                Kualitas Terjamin
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2" />
                Pengiriman Cepat
              </div>
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 mr-2" />
                Terpercaya
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">💧</div>
            <p className="text-sm opacity-75">Promo Hari Ini!</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-semibold mb-2">Pengiriman Gratis</h3>
            <p className="text-sm text-gray-600">
              Gratis ongkir untuk pembelian minimal 2 galon
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Layanan Cepat</h3>
            <p className="text-sm text-gray-600">
              Pesanan diantar dalam waktu 2-4 jam
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">💯</div>
            <h3 className="font-semibold mb-2">Kualitas Terbaik</h3>
            <p className="text-sm text-gray-600">
              Air mineral murni dengan standar SNI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Droplets className="h-6 w-6 mr-2 text-green-600" />
            Produk Kami
          </h2>
          {products.length === 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Data dari server masih stub
            </Badge>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: Product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center mb-4">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-6xl">💧</div>
                  )}
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description || 'Deskripsi produk belum tersedia'}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">/galon</span>
                  </div>
                  {product.is_active && (
                    <Badge className="bg-green-100 text-green-800">Tersedia</Badge>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={() => onProductClick(product.id)}
                    variant="outline" 
                    className="w-full"
                  >
                    Lihat Detail
                  </Button>
                  <Button 
                    onClick={() => onAddToCart(product.id, 1)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!product.is_active}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah ke Keranjang
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💧</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Produk Sedang Dimuat
            </h3>
            <p className="text-gray-500">
              Backend masih menggunakan data stub. Akan diperbarui dengan data real.
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Mulai Pesan Sekarang!
          </h3>
          <p className="text-green-700 mb-4">
            Dapatkan air mineral berkualitas langsung ke rumah Anda
          </p>
          <Button className="bg-green-600 hover:bg-green-700" size="lg">
            📱 Pesan via WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
