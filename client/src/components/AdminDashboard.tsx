
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Package, FileText, Settings, Users, TrendingUp } from 'lucide-react';

type Page = 'admin-dashboard' | 'admin-products' | 'admin-orders' | 'admin-settings';

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Dashboard Admin</h1>
        <p className="text-gray-600">Kelola bisnis Nucless Anda</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-green-600">2</p>
              </div>
              <Package className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pesanan Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pelanggan</p>
                <p className="text-2xl font-bold text-purple-600">0</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendapatan</p>
                <p className="text-2xl font-bold text-yellow-600">Rp 0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => onNavigate('admin-products')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 mr-2 text-green-600" />
              Kelola Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Tambah, edit, atau hapus produk air galon. Atur harga dan deskripsi produk.
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Kelola Produk
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate('admin-orders')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Pesanan Masuk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Lihat dan kelola semua pesanan yang masuk. Update status pengiriman.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Lihat Pesanan
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate('admin-settings')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-6 w-6 mr-2 text-purple-600" />
              Pengaturan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Atur nomor WhatsApp admin dan konfigurasi sistem lainnya.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Pengaturan
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-gray-600" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Belum Ada Aktivitas
              </h3>
              <p className="text-gray-500">
                Data aktivitas akan muncul setelah ada transaksi dan interaksi sistem
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="mt-6 bg-green-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-green-800 mb-2">✅ Status Sistem</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-700">Database: Aktif</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-700">API: Berjalan</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-yellow-700">Backend: Stub Mode</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
