
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, RefreshCw, Phone, MapPin, Package } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { OrderWithItems, UpdateOrderStatusInput, OrderStatus } from '../../../server/src/schema';

interface AdminOrdersProps {
  onBack: () => void;
}

export function AdminOrders({ onBack }: AdminOrdersProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getOrders.query();
      setOrders(result);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Initialize empty orders when backend is not ready
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const updateData: UpdateOrderStatusInput = {
        id: orderId,
        status: newStatus
      };

      await trpc.updateOrderStatus.mutate(updateData);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date() }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Gagal memperbarui status pesanan. Backend masih menggunakan stub.');
    }
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 text-green-600 hover:text-green-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Dashboard
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Kelola Pesanan
          </h1>
          <p className="text-gray-600">Lihat dan kelola semua pesanan yang masuk</p>
        </div>

        <div className="flex items-center gap-2">
          {orders.length === 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Data dari server masih stub
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={loadOrders}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{orderCounts.all}</div>
            <div className="text-sm text-gray-600">Semua</div>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setStatusFilter('pending')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{orderCounts.pending}</div>
            <div className="text-sm text-gray-600">Menunggu</div>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'processing' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setStatusFilter('processing')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{orderCounts.processing}</div>
            <div className="text-sm text-gray-600">Diproses</div>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'delivered' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setStatusFilter('delivered')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{orderCounts.delivered}</div>
            <div className="text-sm text-gray-600">Diantar</div>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-colors ${statusFilter === 'completed' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setStatusFilter('completed')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{orderCounts.completed}</div>
            <div className="text-sm text-gray-600">Selesai</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {orders.length === 0 ? 'Belum Ada Pesanan' : 'Tidak Ada Pesanan Sesuai Filter'}
            </h3>
            <p className="text-gray-500">
              {orders.length === 0 
                ? 'Pesanan dari pelanggan akan muncul di sini atau backend masih menggunakan data stub'
                : 'Coba ubah filter untuk melihat pesanan lainnya'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: OrderWithItems) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      Pesanan #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Select
                      value={order.status}
                      onValueChange={(value: OrderStatus) => handleStatusUpdate(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="processing">Diproses</SelectItem>
                        <SelectItem value="delivered">Diantar</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Informasi Pelanggan
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Nama:</span> {order.customer_name}
                      </div>
                      <div>
                        <span className="font-medium">HP:</span> {order.customer_phone}
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-400" />
                        <div>
                          <span className="font-medium">Alamat:</span>
                          <p className="text-gray-600 mt-1">{order.customer_address}</p>
                        </div>
                      </div>
                      {order.notes && (
                        <div>
                          <span className="font-medium">Catatan:</span>
                          <p className="text-gray-600 mt-1">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Detail Pesanan
                    </h4>
                    <div className="space-y-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Detail item tidak tersedia</p>
                      )}
                      <div className="border-t pt-2 mt-3 flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = `Halo ${order.customer_name}, pesanan Anda #${order.id} sedang diproses. Total: ${formatPrice(order.total_amount)}. Terima kasih!`;
                      const whatsappUrl = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    💬 Hubungi via WhatsApp
                  </Button>
                  
                  {order.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✅ Tandai Selesai
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
