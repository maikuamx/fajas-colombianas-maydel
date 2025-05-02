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

interface ColorVariant {
  color_name: string;
  color_code: string;
}

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
    size: '',
    image_url: [] as string[],
    colors: [] as ColorVariant[],
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

  const handleImageUpload = async () => {
    try {
      setIsUploading(true);
      setError('');

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          maxFiles: 5,
          sources: ['local', 'url', 'camera'],
          showAdvancedOptions: false,
          cropping: false,
          multiple: true,
          defaultSource: 'local',
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1'
            },
            fonts: {
              default: null,
              "'Montserrat', sans-serif": {
                url: 'https://fonts.googleapis.com/css?family=Montserrat',
                active: true
              }
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            setFormData(prev => ({
              ...prev,
              image_url: [...prev.image_url, result.info.secure_url],
            }));
          }
          if (result.event === 'close') {
            setIsUploading(false);
          }
        }
      );

      widget.open();
    } catch (error) {
      toast.error('Error al subir las imágenes');
      setError('Error al subir las imágenes. Por favor, intenta de nuevo.');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_url: prev.image_url.filter((_, i) => i !== index),
    }));
  };

  const handleAddColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { color_name: '', color_code: '' }],
    }));
  };

  const handleRemoveColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleColorChange = (index: number, field: keyof ColorVariant, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      ),
    }));
  };

  const handleEdit = async (product: any) => {
    const imageUrls = parseImageUrls(product.image_url);
    
    // Fetch color variants
    const { data: colors } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', product.id);

    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      prince: product.prince.toString(),
      category: product.category,
      size: product.size || '',
      image_url: imageUrls,
      colors: colors || [],
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
        name: formData.name,
        description: formData.description,
        prince: parseFloat(formData.prince),
        category: formData.category,
        size: formData.size,
        image_url: JSON.stringify(formData.image_url),
      };
      
      if (editingProduct) {
        const { data: updatedProduct, error: productError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single();

        if (productError) throw productError;

        // Update color variants
        await supabase
          .from('product_colors')
          .delete()
          .eq('product_id', editingProduct.id);

        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(
            formData.colors.map(color => ({
              product_id: editingProduct.id,
              ...color,
            }))
          );

        if (colorsError) throw colorsError;

        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        toast.success('Producto actualizado exitosamente');
      } else {
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (productError) throw productError;

        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(
            formData.colors.map(color => ({
              product_id: newProduct.id,
              ...color,
            }))
          );

        if (colorsError) throw colorsError;

        setProducts(prev => [...prev, newProduct]);
        toast.success('Producto agregado exitosamente');
      }

      setFormData({
        name: '',
        description: '',
        prince: '',
        category: '',
        size: '',
        image_url: [],
        colors: [],
      });
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error(editingProduct ? 'Error al actualizar el producto' : 'Error al crear el producto');
      setError('Error al procesar el producto. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="space-y-8 px-4 md:px-0">
      {/* Stats Grid - Responsive layout */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4 md:p-6"
          >
            <div className="flex items-center">
              <div className={`p-2 md:p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-4 h-4 md:w-6 md:h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-base md:text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
                  size: '',
                  image_url: [],
                  colors: [],
                });
                setShowForm(true);
              }}
              className="btn-primary inline-flex items-center justify-center"
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
                    size: '',
                    image_url: [],
                    colors: [],
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colores Disponibles
                  </label>
                  <div className="space-y-4">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <input
                          type="text"
                          value={color.color_name}
                          onChange={e => handleColorChange(index, 'color_name', e.target.value)}
                          placeholder="Nombre del color"
                          className="input-field flex-1"
                          required
                        />
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <input
                            type="color"
                            value={color.color_code}
                            onChange={e => handleColorChange(index, 'color_code', e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="btn-secondary w-full md:w-auto"
                    >
                      Agregar Color
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
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
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          className="text-center p-4 w-full h-full"
                        >
                          <Upload className="mx-auto h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                          <span className="mt-2 block text-xs md:text-sm text-gray-600">
                            {isUploading ? 'Subiendo...' : 'Agregar imágenes'}
                          </span>
                        </button>
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

              <div className="flex flex-col md:flex-row justify-end gap-4">
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
                      size: '',
                      image_url: [],
                      colors: [],
                    });
                  }}
                  className="btn-secondary w-full md:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary w-full md:w-auto"
                  disabled={isUploading || formData.image_url.length === 0 || formData.colors.length === 0}
                >
                  {editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid - Responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  </div>
                  {product.size && (
                    <p className="text-sm text-gray-500 mt-1">
                      Talla: {product.size}
                    </p>
                  )}
                  {/* Color variants */}
                  {product.product_colors && product.product_colors.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {product.product_colors.map(color => (
                        <div
                          key={color.id}
                          className="group/color relative w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color.color_code }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap">
                            {color.color_name}
                          </div>
                        </div>
                      ))}
                    </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col md:flex-row justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary w-full md:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full md:w-auto"
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