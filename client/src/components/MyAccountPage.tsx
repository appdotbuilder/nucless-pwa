
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Package, Phone, Mail, RefreshCw } from 'lucide-react';
import type { User as UserType, OrderWithItems } from '../../../server/src/schema';

interface MyAccountPageProps {
  user: UserType | null;
  orders: OrderWithItems[];
  onBack: () => void;
  onRefreshOrders: () => void;
}

export function MyAccountPage({ user, orders, onBack, onRefreshOrders }: MyAccountPageProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Diproses', className: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Diantar', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Selesai', className: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              Akses Terbatas
            </h2>
            <p className="text-gray-500 mb-6">
              Silakan login untuk melihat informasi akun Anda
            </p>
            <Button 
              onClick={onBack}
              className="bg-green-600 hover:bg-green-700"
            >
              Kembali ke Beranda
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

      <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 Akun Saya</h1>

      <div className="space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profil Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Nomor HP</label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="font-medium">{user.phone || 'Belum diisi'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Bergabung Sejak</label>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Riwayat Pemesanan
              </CardTitle>
              <div className="flex items-center gap-2">
                {orders.length === 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Data dari server masih stub
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshOrders}
                  className="text-green-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Belum Ada Pesanan
                </h3>
                <p className="text-gray-500 mb-4">
                  Anda belum pernah melakukan pemesanan atau data masih loading
                </p>
                <Button 
                  onClick={onBack}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mulai Berbelanja
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: OrderWithItems) => (
                  <Card key={order.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">Pesanan #{order.id}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <span className="font-medium">Penerima:</span> {order.customer_name}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">HP:</span> {order.customer_phone}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Alamat:</span> {order.customer_address}
                        </div>
                        {order.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Catatan:</span> {order.notes}
                          </div>
                        )}
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="border-t pt-3">
                          <h5 className="font-medium mb-2">Item Pesanan:</h5>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product_name} x {item.quantity}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-3 mt-3 flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-green-600">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.length}
              </div>
              <p className="text-sm text-gray-600">Total Pesanan</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">Pesanan Selesai</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(orders.reduce((sum, order) => sum + order.total_amount, 0))}
              </div>
              <p className="text-sm text-gray-600">Total Belanja</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
