
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Product, User, CreateOrderInput } from '../../../server/src/schema';

interface Cart {
  productId: number;
  quantity: number;
}

interface CheckoutPageProps {
  cart: Cart[];
  products: Product[];
  user: User | null;
  onOrderComplete: () => void;
  onBack: () => void;
  updateQuantity: (productId: number, quantity: number) => void;
}

export function CheckoutPage({ 
  cart, 
  products, 
  user, 
  onOrderComplete, 
  onBack, 
  updateQuantity 
}: CheckoutPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    notes: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const cartItems = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    return product ? { ...product, quantity: cartItem.quantity } : null;
  }).filter(Boolean);

  const totalAmount = cartItems.reduce((sum, item) => 
    sum + (item!.price * item!.quantity), 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Silakan login terlebih dahulu untuk melakukan pemesanan.');
      return;
    }

    if (cart.length === 0) {
      alert('Keranjang kosong. Tambahkan produk terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Siapkan data pesanan
      const orderData: CreateOrderInput = {
        user_id: user.id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        notes: customerInfo.notes || null,
        items: cart.map(item => ({
          product_id: item.productId,
          quantity: item.quantity
        }))
      };

      // Simpan pesanan ke database
      await trpc.createOrder.mutate(orderData);

      // Buat pesan WhatsApp
      const whatsappMessage = createWhatsAppMessage();
      
      // Redirect ke WhatsApp
      const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      // Selesaikan checkout
      onOrderComplete();
      
    } catch (error) {
      console.error('Failed to create order:', error);
      
      // Jika gagal simpan ke database, tetap lanjut ke WhatsApp dengan peringatan
      const whatsappMessage = createWhatsAppMessage();
      const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      alert('Pesanan telah dikirim ke WhatsApp, namun gagal tersimpan di sistem. Admin akan memproses pesanan Anda.');
      onOrderComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const createWhatsAppMessage = () => {
    const itemsText = cartItems.map(item => 
      `- ${item!.name} x ${item!.quantity} = ${formatPrice(item!.price * item!.quantity)}`
    ).join('\n');

    return `🛒 *PESANAN NUCLESS*

📦 *Detail Pesanan:*
${itemsText}

💰 *Total: ${formatPrice(totalAmount)}*

👤 *Data Pemesan:*
Nama: ${customerInfo.name}
HP: ${customerInfo.phone}
Alamat: ${customerInfo.address}
${customerInfo.notes ? `Catatan: ${customerInfo.notes}` : ''}

Mohon konfirmasi pesanan ini. Terima kasih! 🙏`;
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Button>

        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              Keranjang Kosong
            </h2>
            <p className="text-gray-500 mb-6">
              Belum ada produk dalam keranjang Anda
            </p>
            <Button 
              onClick={onBack}
              className="bg-green-600 hover:bg-green-700"
            >
              Mulai Belanja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 text-green-600 hover:text-green-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Beranda
      </Button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 Checkout Pesanan</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Pesanan Anda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item!.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
                    <div className="text-2xl">💧</div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{item!.name}</h3>
                    <p className="text-sm text-gray-500">{formatPrice(item!.price)}/galon</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item!.id, item!.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item!.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item!.id, item!.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item!.id, 0)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {formatPrice(item!.price * item!.quantity)}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pemesan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    💡 Silakan login untuk mempermudah pengisian data
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  type="text"
                  value={customerInfo.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomerInfo(prev => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor HP/WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))
                  }
                  required
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div>
                <Label htmlFor="address">Alamat Lengkap *</Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCustomerInfo(prev => ({ ...prev, address: e.target.value }))
                  }
                  required
                  placeholder="Masukkan alamat lengkap termasuk patokan"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Catatan Tambahan</Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Catatan khusus untuk pengiriman (opsional)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Submit */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-green-800">
                📱 Konfirmasi Pesanan via WhatsApp
              </h3>
              <p className="text-green-700">
                Setelah mengklik tombol di bawah, pesanan akan disimpan dan Anda akan 
                diarahkan ke WhatsApp admin untuk konfirmasi final.
              </p>
              
              <div className="bg-white rounded-lg p-4 text-left">
                <h4 className="font-semibold mb-2">Ringkasan Pesanan:</h4>
                <ul className="text-sm space-y-1">
                  {cartItems.map((item) => (
                    <li key={item!.id} className="flex justify-between">
                      <span>{item!.name} x {item!.quantity}</span>
                      <span>{formatPrice(item!.price * item!.quantity)}</span>
                    </li>
                  ))}
                  <li className="border-t pt-1 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(totalAmount)}</span>
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {isLoading ? 'Memproses...' : 'Kirim Pesanan via WhatsApp'}
              </Button>
              
              <p className="text-xs text-green-600">
                * Pesanan akan tersimpan dan admin akan menghubungi Anda via WhatsApp
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
