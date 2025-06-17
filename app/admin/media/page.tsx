'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '../../../components/AdminLayout';

interface MediaItem {
  id: string;
  url: string;
  altText: string | null;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MediaItem[] = await response.json();
      setMedia(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (altText) {
      formData.append('altText', altText);
    }

    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        // No Content-Type header needed for FormData; browser sets it automatically
        // 'Authorization': `Bearer ${token}` // You would add authorization here
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload media');
      }

      setFile(null);
      setAltText('');
      fetchMedia(); // Refresh media list
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': `Bearer ${token}` // You would add authorization here
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete media');
      }
      fetchMedia(); // Refresh media list
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Manage Media</h1>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="mb-8 p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Upload New Media</h2>
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Choose Image</label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="alt-text" className="block text-sm font-medium text-gray-700 mb-2">Alt Text (Optional)</label>
            <input
              id="alt-text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
              placeholder="Descriptive text for the image"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
          {error && <p className="mt-4 text-red-600 text-sm">Error: {error}</p>}
        </form>

        {/* Media List */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Existing Media</h2>
        {loading ? (
          <p className="text-gray-600">Loading media...</p>
        ) : media.length === 0 ? (
          <p className="text-gray-600">No media found. Upload some!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {media.map((item) => (
              <div key={item.id} className="relative bg-white rounded-lg shadow-lg overflow-hidden group">
                <div className="relative w-full h-48">
                  <Image
                    src={item.url}
                    alt={item.altText || 'Media image'}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 truncate mb-2">ID: {item.id}</p>
                  <p className="text-sm text-gray-800 break-words mb-2">{item.altText || 'No alt text'}</p>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 