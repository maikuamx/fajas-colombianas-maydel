'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, TrendingUp, Upload, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface DashboardProps {
  products: any[];
  orders: any[];
  profiles: any[];
}

const CATEGORIES = [
  { id: 'ropa', label: 'Ropa' },
  { id: 'zapatos', label: 'Zapatos' },
  { id: 'accesorios', label: 'Accesorios' },
  { id: 'otros', label: 'Otros' },
];

export default function AdminDashboard({ products: initialProducts, orders, profiles }: DashboardProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prince: '',
    category: '',
    stock: '',
    size: '',
    image_url: [] as string[],
  });
  const [error, setError] = useState('');
  
  const supabase = createClientComponentClient();

  const stats = [
    {
      label: 'Productos',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Órdenes',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      label: 'Usuarios',
      value: profiles.length,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Ingresos',
      value: `$${orders.reduce((acc, order) => acc + order.total_amount, 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
  ];

  const parseImageUrls = (imageUrl: string | string[]): string[] => {
    if (!imageUrl) return [];
    
    if (typeof imageUrl === 'string') {
      try {
        return JSON.parse(imageUrl);
      } catch {
        return [imageUrl];
      }
    }
    
    return imageUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      setError('');

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        image_url: [...prev.image_url, ...uploadedUrls],
      }));
      
      toast.success('Imágenes subidas exitosamente');
    } catch (error: any) {
      toast.error('Error al subir las imágenes');
      setError('Error al subir las imágenes. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_url: prev.image_url.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (product: any) => {
    const imageUrls = parseImageUrls(product.image_url);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      prince: product.prince.toString(),
      category: product.category,
      stock: product.stock,
      size: product.size || '',
      image_url: imageUrls,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== id));
      setShowDeleteConfirm(null);
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      
      const productData = {
        ...formData,
        prince: parseFloat(formData.prince),
        image_url: JSON.stringify(formData.image_url),
      };
      
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();

        if (error) throw error;

        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data[0] : p));
        toast.success('Producto actualizado exitosamente');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select();

        if (error) throw error;

        setProducts(prev => [...prev, data[0]]);
        toast.success('Producto agregado exitosamente');
      }

      setFormData({
        name: '',
        description: '',
        prince: '',
        category: '',
        stock: '',
        size: '',
        image_url: [],
      });
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error(editingProduct ? 'Error al actualizar el producto' : 'Error al crear el producto');
      setError('Error al procesar el producto. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Gestión de Productos</h3>
          {!showForm && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '',
                  description: '',
                  prince: '',
                  category: '',
                  stock: '',
                  size: '',
                  image_url: [],
                });
                setShowForm(true);
              }}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Producto
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h4>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    description: '',
                    prince: '',
                    category: '',
                    stock: '',
                    size: '',
                    image_url: [],
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    value={formData.prince}
                    onChange={e => setFormData(prev => ({ ...prev, prince: e.target.value }))}
                    className="input-field"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Talla
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={e => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="input-field"
                    placeholder="Ej: S, M, L, XL, 42, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes del Producto (Máximo 5)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.image_url.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.image_url.length < 5 && (
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer text-center p-4"
                        >
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-600">
                            {isUploading ? 'Subiendo...' : 'Agregar imágenes'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      description: '',
                      prince: '',
                      category: '',
                      stock: '',
                      size: '',
                      image_url: [],
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUploading || formData.image_url.length === 0}
                >
                  {editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageUrls = parseImageUrls(product.image_url);
            const firstImage = imageUrls[0] || '';
            
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <div className="aspect-square relative">
                  <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {imageUrls.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {imageUrls.map((_, index) => (
                        <div
                          key={index}
                          className="w-2 h-2 rounded-full bg-white opacity-75"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-primary font-semibold">
                      ${product.prince}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  {product.size && (
                    <p className="text-sm text-gray-500 mt-1">
                      Talla: {product.size}
                    </p>
                  )}
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(product.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}