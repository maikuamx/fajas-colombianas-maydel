'use client';

import { useState, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, Search, X, Check } from 'lucide-react';
import Link from 'next/link';
import { Combobox, Transition } from '@headlessui/react';

interface Product {
  id: string;
  name: string;
  description: string;
  prince: number;
  category: string;
  size: string;
  image_url: string;
  product_colors: Array<{
    id: string;
    color_name: string;
    color_code: string;
  }>;
}

interface ProductCatalogProps {
  products: Product[];
}

const ITEMS_PER_PAGE = 16;

const CATEGORIES = [
  { id: 'ropa', label: 'Ropa' },
  { id: 'zapatos', label: 'Zapatos' },
  { id: 'accesorios', label: 'Accesorios' },
  { id: 'otros', label: 'Otros' },
];

export default function ProductCatalog({ products }: ProductCatalogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [sizeQuery, setSizeQuery] = useState('');
  const [colorQuery, setColorQuery] = useState('');

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

  // Get unique sizes from products
  const sizes = useMemo(() => {
    const allSizes = products.map(p => p.size);
    return Array.from(new Set(allSizes)).filter(Boolean);
  }, [products]);

  // Get unique colors from product_colors
  const colors = useMemo(() => {
    const allColors = products.flatMap(p => p.product_colors.map(c => ({
      name: c.color_name,
      code: c.color_code
    })));
    
    // Remove duplicates by color name
    return Array.from(
      new Map(allColors.map(color => [color.name, color]))
    ).map(([_, color]) => color);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSize = !selectedSize || product.size === selectedSize;
      const matchesColor = !selectedColor || product.product_colors.some(c => c.color_name === selectedColor);
      const matchesSearch = !query || 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSize && matchesColor && matchesSearch;
    });
  }, [products, selectedCategory, selectedSize, selectedColor, query]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCategories = categoryQuery === ''
    ? CATEGORIES
    : CATEGORIES.filter((category) =>
        category.label
          .toLowerCase()
          .includes(categoryQuery.toLowerCase())
      );

  const filteredSizes = sizeQuery === ''
    ? sizes
    : sizes.filter((size) =>
        size.toLowerCase().includes(sizeQuery.toLowerCase())
      );

  const filteredColors = colorQuery === ''
    ? colors
    : colors.filter((color) =>
        color.name.toLowerCase().includes(colorQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-xl shadow-sm p-6">
            {/* Search */}
            <div className="relative mb-8">
              <h3 className="font-semibold mb-3">Buscar</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Category Combobox */}
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Categoría</h3>
              <Combobox value={selectedCategory} onChange={setSelectedCategory}>
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                    <Combobox.Input
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      displayValue={(category: string) => 
                        CATEGORIES.find(c => c.id === category)?.label || ''
                      }
                      onChange={(event) => setCategoryQuery(event.target.value)}
                      placeholder="Seleccionar categoría"
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setCategoryQuery('')}
                  >
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      {filteredCategories.length === 0 && categoryQuery !== '' ? (
                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                          No se encontraron resultados.
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <Combobox.Option
                            key={category.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-primary text-white' : 'text-gray-900'
                              }`
                            }
                            value={category.id}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? 'font-medium' : 'font-normal'
                                  }`}
                                >
                                  {category.label}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? 'text-white' : 'text-primary'
                                    }`}
                                  >
                                    <Check className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>

            {/* Size Combobox */}
            {sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-3">Talla</h3>
                <Combobox value={selectedSize} onChange={setSelectedSize}>
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(size: string) => size}
                        onChange={(event) => setSizeQuery(event.target.value)}
                        placeholder="Seleccionar talla"
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setSizeQuery('')}
                    >
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {filteredSizes.length === 0 && sizeQuery !== '' ? (
                          <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                            No se encontraron resultados.
                          </div>
                        ) : (
                          filteredSizes.map((size) => (
                            <Combobox.Option
                              key={size}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-primary text-white' : 'text-gray-900'
                                }`
                              }
                              value={size}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {size}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-primary'
                                      }`}
                                    >
                                      <Check className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>
            )}

            {/* Color Combobox */}
            {colors.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-3">Color</h3>
                <Combobox value={selectedColor} onChange={setSelectedColor}>
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(colorName: string) => colorName}
                        onChange={(event) => setColorQuery(event.target.value)}
                        placeholder="Seleccionar color"
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setColorQuery('')}
                    >
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {filteredColors.length === 0 && colorQuery !== '' ? (
                          <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                            No se encontraron resultados.
                          </div>
                        ) : (
                          filteredColors.map((color) => (
                            <Combobox.Option
                              key={color.name}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-primary text-white' : 'text-gray-900'
                                }`
                              }
                              value={color.name}
                            >
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <div
                                      className="w-4 h-4 rounded-full mr-2 border border-gray-200"
                                      style={{ backgroundColor: color.code }}
                                    />
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {color.name}
                                    </span>
                                  </div>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-primary'
                                      }`}
                                    >
                                      <Check className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product, index) => {
              const imageUrls = parseImageUrls(product.image_url);
              const firstImage = imageUrls[0] || '';

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link
                        href={`/productos/${product.id}`}
                        className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-600 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-primary">
                        ${product.prince}
                      </span>
                      <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                    {product.product_colors.length > 0 && (
                      <div className="flex gap-1 pt-2">
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
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}