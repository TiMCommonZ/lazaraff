'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Image from 'next/image';

interface MediaItem {
  id: string;
  url: string;
  altText: string | null;
}

interface SlideItem {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  mediaId: string | null;
  media: MediaItem | null;
  createdAt: string;
}

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<SlideItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState('');

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/slides');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SlideItem[] = await response.json();
      setSlides(data);
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
    fetchSlides();
    fetchMediaItems();
  }, []);

  const handleOpenModal = (slide?: SlideItem) => {
    setCurrentSlide(slide || null);
    setTitle(slide?.title || '');
    setDescription(slide?.description || '');
    setLink(slide?.link || '');
    setSelectedMediaId(slide?.mediaId || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentSlide(null);
    setTitle('');
    setDescription('');
    setLink('');
    setSelectedMediaId('');
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title || !selectedMediaId) {
      setError('Title and Media are required.');
      return;
    }

    const method = currentSlide ? 'PUT' : 'POST';
    const url = currentSlide ? `/api/slides/${currentSlide.id}` : '/api/slides';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, link, mediaId: selectedMediaId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${currentSlide ? 'update' : 'create'} slide`);
      }

      handleCloseModal();
      fetchSlides();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete slide');
      }
      fetchSlides();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Manage Slides</h1>
        
        <button
          onClick={() => handleOpenModal()}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Slide
        </button>

        {error && <p className="text-red-600 mb-4">Error: {error}</p>}

        {loading ? (
          <p className="text-gray-600">Loading slides...</p>
        ) : slides.length === 0 ? (
          <p className="text-gray-600">No slides found. Add some!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slides.map((slide) => (
                  <tr key={slide.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-20 w-20 relative">
                        {slide.media ? (
                          <Image
                            className="rounded-md"
                            src={slide.media.url}
                            alt={slide.media.altText || slide.title}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slide.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-lg break-words">
                      {slide.description ? (
                        slide.description.length > 200
                          ? slide.description.substring(0, 200) + '...'
                          : slide.description
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline"><a href={slide.link || '#'} target="_blank" rel="noopener noreferrer">{slide.link ? 'View Link' : '-'}</a></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(slide.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(slide)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
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

        {/* Modal for Add/Edit Slide */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 bg-white w-full max-w-lg mx-auto rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{currentSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-700"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-700"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link (Optional)</label>
                  <input
                    type="url"
                    id="link"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-700"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
                  <select
                    id="media"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-700"
                    value={selectedMediaId}
                    onChange={(e) => setSelectedMediaId(e.target.value)}
                    required
                  >
                    <option value="">-- Select an image --</option>
                    {mediaItems.map((mediaItem) => (
                      <option key={mediaItem.id} value={mediaItem.id}>
                        {mediaItem.altText || mediaItem.url.substring(0, 50) + '...'}
                      </option>
                    ))}
                  </select>
                  {selectedMediaId && mediaItems.find(m => m.id === selectedMediaId) && (
                    <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={mediaItems.find(m => m.id === selectedMediaId)!.url}
                        alt={mediaItems.find(m => m.id === selectedMediaId)!.altText || 'Selected Image'}
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
                    {currentSlide ? 'Update Slide' : 'Add Slide'}
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