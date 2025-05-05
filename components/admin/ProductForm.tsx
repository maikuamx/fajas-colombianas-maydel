'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, X } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { uploadToCloudinary, getCloudinaryUploadWidget } from '../../lib/cloudinary';

interface Product {
  id: string;
  name: string;
  description: string;
  prince: number;
  category: string;
  stock: string;
  size: string;
  image_url: string;
}

interface ProductFormProps {
  initialProducts: Product[];
}

export default function ProductForm({ initialProducts }: ProductFormProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prince: '',
    category: '',
    stock: '',
    size: '',
    image_url: '',
  });
  const [error, setError] = useState('');
  
  const supabase = createClientComponentClient();

  const handleImageUpload = async () => {
    try {
      setIsUploading(true);
      setError('');
      
      const imageUrl = await getCloudinaryUploadWidget();
      
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl,
      }));

      setIsUploading(false);
    } catch (error) {
      setError('Error al subir la imagen. Por favor, intenta de nuevo.');
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...formData,
          prince: parseFloat(formData.prince),
        }])
        .select();

      if (error) throw error;

      setProducts(prev => [...prev, data[0]]);
      setFormData({
        name: '',
        description: '',
        prince: '',
        category: '',
        stock: '',
        size: '',
        image_url: '',
      });
    } catch (error) {
      setError('Error al crear el producto. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4 sm:mb-6">Agregar Nuevo Producto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field text-base sm:text-sm"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                value={formData.prince}
                onChange={e => setFormData(prev => ({ ...prev, prince: e.target.value }))}
                className="input-field text-base sm:text-sm"
                step="0.01"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input-field text-base sm:text-sm"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="text"
                value={formData.stock}
                onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className="input-field text-base sm:text-sm"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talla
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={e => setFormData(prev => ({ ...prev, size: e.target.value }))}
                className="input-field text-base sm:text-sm"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  className={`input-field flex items-center justify-center cursor-pointer min-h-[2.75rem] ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {formData.image_url ? (
                    <div className="relative w-full h-32">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Upload className="w-5 h-5 mr-2" />
                      <span className="text-base sm:text-sm">
                        {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                      </span>
                    </div>
                  )}
                </button>
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
              className="input-field text-base sm:text-sm"
              rows={3}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto text-base sm:text-sm"
              disabled={isUploading || !formData.image_url}
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Producto
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="aspect-square relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600 mt-1">{product.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-primary font-semibold">
                  ${product.prince}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}