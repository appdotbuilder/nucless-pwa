
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Product, CreateProductInput, UpdateProductInput } from '../../../server/src/schema';

interface AdminProductsProps {
  products: Product[];
  onProductsChange: () => void;
  onBack: () => void;
}

export function AdminProducts({ products, onProductsChange, onBack }: AdminProductsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    description: null,
    price: 0,
    image_url: null,
    is_active: true
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: null,
      price: 0,
      image_url: null,
      is_active: true
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await trpc.createProduct.mutate(formData);
      setShowCreateDialog(false);
      resetForm();
      onProductsChange();
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Gagal membuat produk. Backend masih menggunakan stub.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsLoading(true);

    try {
      const updateData: UpdateProductInput = {
        id: editingProduct.id,
        name: formData.name || undefined,
        description: formData.description,
        price: formData.price || undefined,
        image_url: formData.image_url,
        is_active: formData.is_active
      };

      await trpc.updateProduct.mutate(updateData);
      setShowEditDialog(false);
      setEditingProduct(null);
      resetForm();
      onProductsChange();
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Gagal memperbarui produk. Backend masih menggunakan stub.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    setIsLoading(true);

    try {
      await trpc.deleteProduct.mutate(productId);
      onProductsChange();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Gagal menghapus produk. Backend masih menggunakan stub.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      is_active: product.is_active
    });
    setShowEditDialog(true);
  };

  const ProductForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={isEdit ? handleEdit : handleCreate} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Produk</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData(prev => ({ ...prev, name: e.target.value }))
          }
          placeholder="Contoh: Nucless Galon 19L"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData(prev => ({ ...prev, description: e.target.value || null }))
          }
          placeholder="Deskripsi produk (opsional)"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="price">Harga (Rp)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
          }
          placeholder="15000"
          min="0"
          step="1000"
          required
        />
      </div>

      <div>
        <Label htmlFor="image_url">URL Gambar</Label>
        <Input
          id="image_url"
          value={formData.image_url || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData(prev => ({ ...prev, image_url: e.target.value || null }))
          }
          placeholder="https://example.com/image.jpg (opsional)"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked: boolean) =>
            setFormData(prev => ({ ...prev, is_active: checked }))
          }
        />
        <Label htmlFor="is_active">Produk Aktif</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setShowEditDialog(false);
              setEditingProduct(null);
            } else {
              setShowCreateDialog(false);
            }
            resetForm();
          }}
          className="flex-1"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Buat Produk')}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
            <Package className="h-6 w-6 mr-2 text-green-600" />
            Kelola Produk
          </h1>
          <p className="text-gray-600">Tambah, edit, atau hapus produk air galon</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.is_active ? (
                  <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                ) : (
                  <Badge variant="destructive">Tidak Aktif</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description || 'Tidak ada deskripsi'}
              </p>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-gray-500 ml-1">/galon</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(product)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Dibuat: {product.created_at.toLocaleDateString('id-ID')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Belum Ada Produk
            </h3>
            <p className="text-gray-500 mb-6">
              Mulai dengan menambahkan produk air galon pertama Anda
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <ProductForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
