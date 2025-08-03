
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Award, Shield } from 'lucide-react';
import type { Product } from '../../../server/src/schema';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (productId: number, quantity: number) => void;
  onBack: () => void;
}

export function ProductDetails({ product, onAddToCart, onBack }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
    setQuantity(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 text-green-600 hover:text-green-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Beranda
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-8xl">💧</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <Award className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-medium">Kualitas SNI</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">Higienis</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-xs font-medium">Terpercaya</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              {product.is_active ? (
                <Badge className="bg-green-100 text-green-800">Tersedia</Badge>
              ) : (
                <Badge variant="destructive">Tidak Tersedia</Badge>
              )}
              <Badge variant="outline">Galon Isi Ulang</Badge>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-4">
              {formatPrice(product.price)}
              <span className="text-lg text-gray-500 font-normal ml-2">/galon</span>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deskripsi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {product.description || 
                  'Air mineral berkualitas tinggi yang telah melalui proses penyaringan berlapis untuk memastikan kemurnian dan kesegaran. Dikemas dalam galon yang steril dan aman untuk konsumsi keluarga.'}
              </p>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spesifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Volume:</span>
                <span className="font-medium">
                  {product.name.includes('19L') ? '19 Liter' : '12 Liter'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jenis:</span>
                <span className="font-medium">Air Mineral</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kemasan:</span>
                <span className="font-medium">Galon Plastik</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Standar:</span>
                <span className="font-medium">SNI 01-3553-2015</span>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jumlah Pes

</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={!product.is_active}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Tambah {quantity} Galon ke Keranjang
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi Pengiriman</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Pengiriman gratis untuk pembelian minimal 2 galon</li>
                <li>• Estimasi tiba: 2-4 jam setelah pemesanan</li>
                <li>• Area layanan: dalam kota dan sekitarnya</li>
                <li>• Pembayaran: tunai saat pengiriman</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
