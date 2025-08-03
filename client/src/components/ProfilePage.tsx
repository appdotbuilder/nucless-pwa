
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Award, Clock, Star, Shield, Droplets, Phone } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
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

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💧</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Nucless</h1>
        <p className="text-xl text-gray-600">
          Layanan Distribusi Air Mineral Terpercaya
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-6 w-6 mr-2 text-green-600" />
              Tentang Nucless
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nucless adalah layanan distribusi air mineral isi ulang terpercaya yang melayani 
              kawasan rumah, kantor, dan bisnis lokal. Kami berkomitmen menghadirkan kualitas 
              terbaik dengan harga terjangkau, serta pengiriman cepat langsung ke pintu Anda.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Dengan pengalaman bertahun-tahun dalam industri distribusi air mineral, kami 
              memahami pentingnya kualitas air untuk kesehatan keluarga dan produktivitas 
              bisnis Anda. Setiap tetes air yang kami distribusikan telah melalui proses 
              penyaringan berlapis dan memenuhi standar SNI.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Kualitas Terjamin</h3>
              <p className="text-sm text-gray-600">
                Air mineral berkualitas tinggi dengan standar SNI dan sertifikat BPOM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Pengiriman Cepat</h3>
              <p className="text-sm text-gray-600">
                Layanan antar dalam 2-4 jam dengan coverage area yang luas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="font-semibold mb-2">Layanan Terpercaya</h3>
              <p className="text-sm text-gray-600">
                Ribuan pelanggan puas dengan layanan konsisten dan ramah
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Higienis & Aman</h3>
              <p className="text-sm text-gray-600">
                Proses distribusi yang higienis dengan kemasan yang steril
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">Harga Terjangkau</h3>
              <p className="text-sm text-gray-600">
                Harga kompetitif dengan promo menarik setiap bulannya
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Phone className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Customer Service</h3>
              <p className="text-sm text-gray-600">
                Tim customer service yang responsif via WhatsApp
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Komitmen Kami</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">🌟 Kualitas</h4>
                <p className="text-sm text-green-700">
                  Setiap produk melalui quality control ketat untuk memastikan 
                  kualitas terbaik sampai ke tangan konsumen.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">🤝 Kepercayaan</h4>
                <p className="text-sm text-green-700">
                  Membangun hubungan jangka panjang dengan pelanggan melalui 
                  layanan yang konsisten dan dapat diandalkan.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">🚀 Inovasi</h4>
                <p className="text-sm text-green-700">
                  Terus berinovasi dalam layanan digital untuk kemudahan 
                  pemesanan dan tracking pengiriman.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Hubungi Kami</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📍 Area Layanan</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Jakarta Pusat dan sekitarnya</li>
                  <li>• Jakarta Selatan dan sekitarnya</li>
                  <li>• Tangerang dan sekitarnya</li>
                  <li>• Bekasi dan sekitarnya</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">📞 Kontak</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <span>WhatsApp: +62 812-3456-7890</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Operasional: 08:00 - 20:00 WIB</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
