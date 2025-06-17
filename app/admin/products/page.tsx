'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Image from 'next/image';

interface MediaItem {
  id: string;
  url: string;
  altText: string | null;
}

interface ProductItem {
  id: string;
  title: string;
  normalPrice: number;
  specialPrice: number | null;
  mainRating: number;
  qualityRating: number;
  performanceRating: number;
  valueRating: number;
  qualityRatingLabel: string;
  performanceRatingLabel: string;
  valueRatingLabel: string;
  description: string | null;
  productLink: string;
  comparePriceLink: string;
  coverMediaId: string | null;
  coverMedia: MediaItem | null;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);

  const [title, setTitle] = useState('');
  const [normalPrice, setNormalPrice] = useState<number>(0);
  const [specialPrice, setSpecialPrice] = useState<number | null>(null);
  const [mainRating, setMainRating] = useState<number>(0);
  const [qualityRating, setQualityRating] = useState<number>(0);
  const [performanceRating, setPerformanceRating] = useState<number>(0);
  const [valueRating, setValueRating] = useState<number>(0);
  const [qualityRatingLabel, setQualityRatingLabel] = useState('คุณภาพ');
  const [performanceRatingLabel, setPerformanceRatingLabel] = useState('ประสิทธิภาพ');
  const [valueRatingLabel, setValueRatingLabel] = useState('ความคุ้มค่า');
  const [description, setDescription] = useState('');
  const [productLink, setProductLink] = useState('');
  const [comparePriceLink, setComparePriceLink] = useState('');
  const [selectedCoverMediaId, setSelectedCoverMediaId] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ProductItem[] = await response.json();
      setProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/media');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MediaItem[] = await response.json();
      setMediaItems(data);
    } catch (e: any) {
      console.error("Failed to fetch media items:", e);
      setError("Failed to load media items.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMediaItems();
  }, []);

  const handleOpenModal = (product?: ProductItem) => {
    setCurrentProduct(product || null);
    setTitle(product?.title || '');
    setNormalPrice(product?.normalPrice || 0);
    setSpecialPrice(product?.specialPrice || null);
    setMainRating(product?.mainRating || 0);
    setQualityRating(product?.qualityRating || 0);
    setPerformanceRating(product?.performanceRating || 0);
    setValueRating(product?.valueRating || 0);
    setQualityRatingLabel(product?.qualityRatingLabel || 'คุณภาพ');
    setPerformanceRatingLabel(product?.performanceRatingLabel || 'ประสิทธิภาพ');
    setValueRatingLabel(product?.valueRatingLabel || 'ความคุ้มค่า');
    setDescription(product?.description || '');
    setProductLink(product?.productLink || '');
    setComparePriceLink(product?.comparePriceLink || '');
    setSelectedCoverMediaId(product?.coverMediaId || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
    setTitle('');
    setNormalPrice(0);
    setSpecialPrice(null);
    setMainRating(0);
    setQualityRating(0);
    setPerformanceRating(0);
    setValueRating(0);
    setQualityRatingLabel('คุณภาพ');
    setPerformanceRatingLabel('ประสิทธิภาพ');
    setValueRatingLabel('ความคุ้มค่า');
    setDescription('');
    setProductLink('');
    setComparePriceLink('');
    setSelectedCoverMediaId('');
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title || !normalPrice || !productLink || !comparePriceLink || !selectedCoverMediaId) {
      setError('Title, Normal Price, Product Link, Compare Price Link, and Cover Image are required.');
      return;
    }

    const method = currentProduct ? 'PUT' : 'POST';
    const url = currentProduct ? `/api/products/${currentProduct.id}` : '/api/products';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          normalPrice: parseFloat(normalPrice.toString()),
          specialPrice: specialPrice !== null ? parseFloat(specialPrice.toString()) : null,
          mainRating: parseInt(mainRating.toString()),
          qualityRating: parseInt(qualityRating.toString()),
          performanceRating: parseInt(performanceRating.toString()),
          valueRating: parseInt(valueRating.toString()),
          qualityRatingLabel,
          performanceRatingLabel,
          valueRatingLabel,
          description,
          productLink,
          comparePriceLink,
          coverMediaId: selectedCoverMediaId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${currentProduct ? 'update' : 'create'} product`);
      }

      handleCloseModal();
      fetchProducts();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      fetchProducts();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Manage Products</h1>
        
        <button
          onClick={() => handleOpenModal()}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Product
        </button>

        {error && <p className="text-red-600 mb-4">Error: {error}</p>}

        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">No products found. Add some!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Rating</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-20 w-20 relative">
                        {product.coverMedia ? (
                          <Image
                            className="rounded-md"
                            src={product.coverMedia.url}
                            alt={product.coverMedia.altText || product.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">฿{product.normalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.specialPrice !== null ? `฿${product.specialPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderRatingStars(product.mainRating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Add/Edit Product */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 bg-white w-full max-w-xl mx-auto rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="normalPrice" className="block text-sm font-medium text-gray-700">Normal Price</label>
                    <input
                      type="number"
                      id="normalPrice"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                      value={normalPrice}
                      onChange={(e) => setNormalPrice(parseFloat(e.target.value))}
                      required
                      step="0.01"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="specialPrice" className="block text-sm font-medium text-gray-700">Special Price (Optional)</label>
                    <input
                      type="number"
                      id="specialPrice"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                      value={specialPrice === null ? '' : specialPrice}
                      onChange={(e) => setSpecialPrice(parseFloat(e.target.value) || null)}
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="mainRating" className="block text-sm font-medium text-gray-700 text-center font-bold">Main Rating (1-5)</label>
                  <div className="flex items-center space-x-1 mt-1 justify-center py-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-8 h-8 cursor-pointer ${i < mainRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        onClick={() => setMainRating(i + 1)}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="qualityRatingLabel" className="block text-sm font-medium text-gray-700">Quality Rating Label</label>
                    <input
                      type="text"
                      id="qualityRatingLabel"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                      value={qualityRatingLabel}
                      onChange={(e) => setQualityRatingLabel(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="qualityRating" className="block text-sm font-medium text-gray-700 text-center font-bold">Quality Rating (1-5)</label>
                    <div className="flex items-center space-x-1 mt-1 justify-center py-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-8 h-8 cursor-pointer ${i < qualityRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          onClick={() => setQualityRating(i + 1)}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="performanceRatingLabel" className="block text-sm font-medium text-gray-700">Performance Rating Label</label>
                    <input
                      type="text"
                      id="performanceRatingLabel"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                      value={performanceRatingLabel}
                      onChange={(e) => setPerformanceRatingLabel(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="performanceRating" className="block text-sm font-medium text-gray-700 text-center font-bold">Performance Rating (1-5)</label>
                    <div className="flex items-center space-x-1 mt-1 justify-center py-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-8 h-8 cursor-pointer ${i < performanceRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          onClick={() => setPerformanceRating(i + 1)}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="valueRatingLabel" className="block text-sm font-medium text-gray-700">Value Rating Label</label>
                    <input
                      type="text"
                      id="valueRatingLabel"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                      value={valueRatingLabel}
                      onChange={(e) => setValueRatingLabel(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="valueRating" className="block text-sm font-medium text-gray-700 text-center font-bold">Value Rating (1-5)</label>
                    <div className="flex items-center space-x-1 mt-1 justify-center py-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-8 h-8 cursor-pointer ${i < valueRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          onClick={() => setValueRating(i + 1)}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="productLink" className="block text-sm font-medium text-gray-700">Product Link</label>
                  <input
                    type="url"
                    id="productLink"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                    value={productLink}
                    onChange={(e) => setProductLink(e.target.value)}
                    required
                    placeholder="https://product.com"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="comparePriceLink" className="block text-sm font-medium text-gray-700">Compare Price Link</label>
                  <input
                    type="url"
                    id="comparePriceLink"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                    value={comparePriceLink}
                    onChange={(e) => setComparePriceLink(e.target.value)}
                    required
                    placeholder="https://compare.com"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="coverMedia" className="block text-sm font-medium text-gray-700 mb-2">Select Cover Image</label>
                  <select
                    id="coverMedia"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                    value={selectedCoverMediaId}
                    onChange={(e) => setSelectedCoverMediaId(e.target.value)}
                    required
                  >
                    <option value="">-- Select an image --</option>
                    {mediaItems.map((mediaItem) => (
                      <option key={mediaItem.id} value={mediaItem.id}>
                        {mediaItem.altText || mediaItem.url.substring(0, 50) + '...'}
                      </option>
                    ))}
                  </select>
                  {selectedCoverMediaId && mediaItems.find(m => m.id === selectedCoverMediaId) && (
                    <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={mediaItems.find(m => m.id === selectedCoverMediaId)!.url}
                        alt={mediaItems.find(m => m.id === selectedCoverMediaId)!.altText || 'Selected Image'}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                </div>

                {error && <p className="text-red-600 text-sm mb-4">Error: {error}</p>}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {currentProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 