
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Phone, Save, RefreshCw } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { UpdateSettingInput } from '../../../server/src/schema';

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getSetting.query('admin_whatsapp');
      setWhatsappNumber((result && result.value) ? result.value : '6281234567890');
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Keep default value since backend is stub
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData: UpdateSettingInput = {
        key: 'admin_whatsapp',
        value: whatsappNumber
      };

      await trpc.updateSetting.mutate(updateData);
      alert('Pengaturan WhatsApp berhasil disimpan!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Gagal menyimpan pengaturan. Backend masih menggunakan stub.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
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
            <Settings className="h-6 w-6 mr-2 text-purple-600" />
            Pengaturan Sistem
          </h1>
          <p className="text-gray-600">Kelola konfigurasi aplikasi Nucless</p>
        </div>

        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Backend menggunakan data stub
        </Badge>
      </div>

      <div className="space-y-6">
        {/* WhatsApp Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-green-600" />
              Pengaturan WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveWhatsApp} className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">Nomor WhatsApp Admin</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setWhatsappNumber(e.target.value)
                    }
                    placeholder="6281234567890"
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadSettings}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Format: 62xxxxxxxxxx (tanpa tanda + atau 0 di depan)</p>
                  <p>Contoh: 6281234567890 untuk nomor 081234567890</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Nomor ini akan digunakan untuk redirect checkout pelanggan</li>
                  <li>• Pastikan nomor WhatsApp aktif dan dapat menerima pesan</li>
                  <li>• Ubah nomor jika berganti admin atau nomor WhatsApp bisnis</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Aplikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Aplikasi</label>
                  <p className="font-medium">Nucless PWA</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Versi</label>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-700 font-medium">Aktif</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Backend</label>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-yellow-700 font-medium">Stub Mode</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Database</label>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-700 font-medium">Terhubung</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">PWA</label>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-700 font-medium">Siap Install</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Status Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <p className="text-sm font-medium text-green-800">Frontend</p>
                <p className="text-xs text-green-600">Berjalan Normal</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">⚠️</div>
                <p className="text-sm font-medium text-yellow-800">Backend</p>
                <p className="text-xs text-yellow-600">Mode Stub</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">🔗</div>
                <p className="text-sm font-medium text-green-800">API</p>
                <p className="text-xs text-green-600">Terhubung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Note */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-amber-800 mb-2">🚧 Catatan Pengembangan</h4>
            <p className="text-sm text-amber-700">
              Aplikasi saat ini berjalan dengan backend stub. Beberapa fitur mungkin menggunakan 
              data demo. Implementasi database lengkap akan mengaktifkan semua fungsi secara penuh.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
