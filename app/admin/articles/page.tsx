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
  coverMedia: MediaItem | null;
}

interface ArticleContentItem {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'PRODUCT';
  value: string; // For TEXT, it's the text; for IMAGE/PRODUCT, it's ID
  order: number;
  text?: string | null; // Added: For TEXT type, to store original text from API
  media?: MediaItem | null; // Populated if type is IMAGE, now allows null
  mediaId?: string | null; // Added: ID for linked Media, can be null
  product?: ProductItem | null; // Populated if type is PRODUCT, now allows null
  productId?: string | null; // Added: ID for linked Product, can be null
  productTag?: string | null; // New: For PRODUCT type, to add a label/tag
}

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  coverMediaId: string | null;
  bannerMediaId: string | null;
  coverMedia: MediaItem | null;
  bannerMedia: MediaItem | null;
  createdAt: string;
  updatedAt: string;
  contents: ArticleContentItem[];
  description: string | null;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<ArticleItem | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverMediaId, setCoverMediaId] = useState('');
  const [bannerMediaId, setBannerMediaId] = useState('');
  const [description, setDescription] = useState('');
  const [contents, setContents] = useState<ArticleContentItem[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMediaSelectionType, setCurrentMediaSelectionType] = useState<'cover' | 'banner' | 'content' | null>(null);
  const [currentContentBlockIndex, setCurrentContentBlockIndex] = useState<number | null>(null);
  const [selectedCoverMedia, setSelectedCoverMedia] = useState<MediaItem | null>(null); // New state for cover image preview
  const [selectedBannerMedia, setSelectedBannerMedia] = useState<MediaItem | null>(null); // New state for banner image preview

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ArticleItem[] = await response.json();
      setArticles(data);
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
    }
  };

  const fetchProductItems = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ProductItem[] = await response.json();
      setProductItems(data);
      console.log("Fetched product items:", data); // Add this line for debugging
    } catch (e: any) {
      console.error("Failed to fetch product items:", e);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchMediaItems();
    fetchProductItems();
  }, []);

  const handleOpenModal = async (article?: ArticleItem) => {
    // console.log("handleOpenModal: Initial article object:", article);

    setCurrentArticle(article || null);
    setTitle(article?.title || '');
    setSlug(article?.slug || '');
    setCoverMediaId(article?.coverMediaId || '');
    setBannerMediaId(article?.bannerMediaId || '');
    setDescription(article?.description || '');

    let articleToEdit: ArticleItem | null = article || null;

    if (article && article.id) {
      // console.log("handleOpenModal: Fetching full article details for ID:", article.id);
      try {
        const response = await fetch(`/api/articles/${article.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch article details: ${response.status}`);
        }
        articleToEdit = await response.json();
        console.log("handleOpenModal: Fetched full article details:", articleToEdit); // Add this line for debugging
      } catch (e: any) {
        console.error("handleOpenModal: Error fetching full article details:", e);
        setError(e.message || "Failed to load article details.");
        setShowModal(false); // Close modal on error
        return;
      }
    }

    // console.log("handleOpenModal: Article contents before hydration:", articleToEdit?.contents);

    // Hydrate contents with full media/product objects and ensure 'value' is correctly set for TEXT blocks
    const hydratedContents: ArticleContentItem[] = (articleToEdit?.contents || []).map(contentBlock => {
      const newContentBlock: ArticleContentItem = { ...contentBlock };

      if (newContentBlock.type === 'TEXT') {
        newContentBlock.value = newContentBlock.text || '';
      } else if (newContentBlock.type === 'IMAGE') {
        newContentBlock.value = newContentBlock.mediaId || ''; // Use mediaId from backend
        if (!newContentBlock.media && newContentBlock.mediaId) { // Only try to find if media object is missing and mediaId exists
          const foundMedia = mediaItems.find(m => m.id === newContentBlock.mediaId);
          newContentBlock.media = foundMedia || null; // Set to null if not found
        }
      } else if (newContentBlock.type === 'PRODUCT') {
        newContentBlock.value = newContentBlock.productId || ''; // Use productId from backend
        if (!newContentBlock.product && newContentBlock.productId) { // Only try to find if product object is missing and productId exists
          const foundProduct = productItems.find(p => p.id === newContentBlock.productId);
          newContentBlock.product = foundProduct || null; // Set to null if not found
        }
      }

      // Ensure productTag is carried over for product blocks, and initialize if not present
      if (newContentBlock.type === 'PRODUCT' && newContentBlock.productTag === undefined) {
        newContentBlock.productTag = '';
      }
      return newContentBlock;
    });

    console.log("handleOpenModal: Hydrated contents:", hydratedContents); // Uncommented for debugging

    setContents(hydratedContents); // Set existing contents
    setSelectedCoverMedia(articleToEdit?.coverMedia || null); // Set initial cover media for preview
    setSelectedBannerMedia(articleToEdit?.bannerMedia || null); // Set initial banner media for preview
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentArticle(null);
    setTitle('');
    setSlug('');
    setCoverMediaId('');
    setBannerMediaId('');
    setDescription('');
    setContents([]); // Clear contents
    setSelectedCoverMedia(null); // Clear cover media preview
    setSelectedBannerMedia(null); // Clear banner media preview
    setError(null);
  };

  const handleAddContent = (type: 'TEXT' | 'IMAGE' | 'PRODUCT') => {
    const newId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newContentBlock: ArticleContentItem = {
      id: newId,
      type,
      value: '',
      order: contents.length + 1,
      media: undefined,
      product: undefined,
      productTag: type === 'PRODUCT' ? '' : undefined, // Initialize productTag for PRODUCT type
    };
    setContents([...contents, newContentBlock]);
  };

  const handleContentChange = (index: number, field: keyof ArticleContentItem, value: any, extraFieldUpdates?: Partial<ArticleContentItem>) => {
    console.log("handleContentChange called with:", { index, field, value, extraFieldUpdates });
    const updatedContents = [...contents];
    // Ensure the content block at the given index exists before updating
    if (updatedContents[index]) {
        // Create a new object for the updated content block to ensure React detects the change
        updatedContents[index] = {
            ...updatedContents[index],
            [field]: value,
            ...(extraFieldUpdates || {}), // Apply extra updates if provided
        };
    }
    setContents(updatedContents);
  };

  const handleRemoveContent = (index: number) => {
    const updatedContents = contents.filter((_, i) => i !== index);
    // Reorder remaining items
    setContents(updatedContents.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const handleMoveContent = (dragIndex: number, hoverIndex: number) => {
    const dragItem = contents[dragIndex];
    const updatedContents = [...contents];
    updatedContents.splice(dragIndex, 1);
    updatedContents.splice(hoverIndex, 0, dragItem);
    // Reorder based on new position
    setContents(updatedContents.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const handleSelectMediaForContent = (index: number) => {
    setCurrentMediaSelectionType('content');
    setCurrentContentBlockIndex(index);
    setShowMediaModal(true);
  };

  const handleMediaSelected = (media: MediaItem) => {
    if (currentMediaSelectionType === 'cover') {
      setCoverMediaId(media.id);
      setSelectedCoverMedia(media); // Update state for preview
      if (currentArticle) {
        setCurrentArticle({ ...currentArticle, coverMedia: media, coverMediaId: media.id });
      }
    } else if (currentMediaSelectionType === 'banner') {
      setBannerMediaId(media.id);
      setSelectedBannerMedia(media); // Update state for preview
      if (currentArticle) {
        setCurrentArticle({ ...currentArticle, bannerMedia: media, bannerMediaId: media.id });
      }
    } else if (currentMediaSelectionType === 'content' && currentContentBlockIndex !== null) {
      console.log("handleMediaSelected: Calling handleContentChange with:", { index: currentContentBlockIndex, value: media.id, media: media });
      handleContentChange(currentContentBlockIndex, 'value', media.id, { media: media });
    }
    setShowMediaModal(false);
    setCurrentMediaSelectionType(null);
    setCurrentContentBlockIndex(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title || !slug || !coverMediaId) {
      setError('Title, Slug, and Cover Image are required.');
      return;
    }

    const method = currentArticle ? 'PUT' : 'POST';
    const url = currentArticle ? `/api/articles/${currentArticle.id}` : '/api/articles';

    // Send structured contents to the API
    const articleContentsToSend = contents.map(contentBlock => ({
      type: contentBlock.type,
      value: contentBlock.value, // This will be the ID for IMAGE/PRODUCT, text for TEXT
      order: contentBlock.order,
      productTag: contentBlock.productTag, // Include productTag
    }));

    console.log("Submitting article with contents:", articleContentsToSend); // Add this line for debugging

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          coverMediaId,
          bannerMediaId: bannerMediaId === '' ? null : bannerMediaId,
          description,
          contents: articleContentsToSend, // Send structured contents
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${currentArticle ? 'update' : 'create'} article`);
      }

      handleCloseModal();
      fetchArticles();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete article');
      }
      fetchArticles();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Manage Articles</h1>
        
        <button
          onClick={() => handleOpenModal()}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Article
        </button>

        {error && <p className="text-red-600 mb-4">Error: {error}</p>}

        {loading ? (
          <p className="text-gray-600">Loading articles...</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-600">No articles found. Add some!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banner Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-16 w-16 relative">
                        {article.coverMedia ? (
                          <Image
                            className="rounded-md"
                            src={article.coverMedia.url}
                            alt={article.coverMedia.altText || 'Cover'}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-16 w-16 relative">
                        {article.bannerMedia ? (
                          <Image
                            className="rounded-md"
                            src={article.bannerMedia.url}
                            alt={article.bannerMedia.altText || 'Banner'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{article.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(article)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
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

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="relative p-8 bg-white w-full max-w-4xl mx-auto rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{currentArticle ? 'Edit Article' : 'Add New Article'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                  <input
                    type="text"
                    id="title"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="slug" className="block text-gray-700 text-sm font-bold mb-2">Slug:</label>
                  <input
                    type="text"
                    id="slug"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                  <textarea
                    id="description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  ></textarea>
                </div>

                {/* Cover Image Selection */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Cover Image:</label>
                  <div className="flex items-center space-x-4">
                    {(selectedCoverMedia && selectedCoverMedia.url) ? (
                      <div className="relative w-24 h-24 rounded-md overflow-hidden">
                        <Image
                          src={selectedCoverMedia.url}
                          alt={selectedCoverMedia.altText || 'Cover Image'}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                        No Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentMediaSelectionType('cover');
                        setShowMediaModal(true);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Select Cover Image
                    </button>
                  </div>
                </div>

                {/* Banner Image Selection */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Banner Image:</label>
                  <div className="flex items-center space-x-4">
                    {(selectedBannerMedia && selectedBannerMedia.url) ? (
                      <div className="relative w-24 h-24 rounded-md overflow-hidden">
                        <Image
                          src={selectedBannerMedia.url}
                          alt={selectedBannerMedia.altText || 'Banner Image'}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                        No Banner
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentMediaSelectionType('banner');
                        setShowMediaModal(true);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Select Banner Image
                    </button>
                    {selectedBannerMedia && (
                      <button
                        type="button"
                        onClick={() => {
                          setBannerMediaId('');
                          setSelectedBannerMedia(null);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Remove Banner
                      </button>
                    )}
                  </div>
                </div>

                {/* Article Contents Section */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Article Contents:</label>
                  <div className="space-y-4 border p-4 rounded-md">
                    {contents.sort((a, b) => a.order - b.order).map((contentBlock, index) => (
                      <div key={contentBlock.id} className="border p-3 rounded-md bg-gray-50 flex items-center justify-between">
                        <div className="flex-grow">
                          {contentBlock.type === 'TEXT' && (
                            <textarea
                              key={contentBlock.id}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              placeholder="Enter text content"
                              value={contentBlock.value}
                              onChange={(e) => handleContentChange(index, 'value', e.target.value)}
                              rows={3}
                            ></textarea>
                          )}
                          {contentBlock.type === 'IMAGE' && (
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-700">Image:</span>
                              {contentBlock.media ? (
                                <div className="relative w-24 h-24 rounded-md overflow-hidden">
                                  <Image
                                    src={contentBlock.media.url}
                                    alt={contentBlock.media.altText || 'Content Image'}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                  />
                                </div>
                              ) : (
                                <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                  No Image
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSelectMediaForContent(index)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-sm"
                              >
                                Select Image
                              </button>
                            </div>
                          )}
                          {contentBlock.type === 'PRODUCT' && (
                            <div className="flex flex-col space-y-2 w-full">
                              <div className="flex items-center space-x-3">
                                <span className="text-gray-700">Product:</span>
                                {contentBlock.product ? (
                                  <span className="font-semibold">{contentBlock.product.title}</span>
                                ) : (
                                  <span className="text-gray-500">No Product Selected</span>
                                )}
                                <select
                                  className="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm flex-grow"
                                  onChange={(e) => {
                                    const selectedProductId = e.target.value;
                                    const selectedProduct = productItems.find(p => p.id === selectedProductId);
                                    if (selectedProduct) {
                                      // Update both 'value' (product ID) and 'product' object
                                      handleContentChange(index, 'value', selectedProductId, { product: selectedProduct });
                                    } else {
                                      // If selection is cleared, set value to empty string and product to null
                                      handleContentChange(index, 'value', '', { product: null });
                                    }
                                  }}
                                  value={contentBlock.value || ''}
                                >
                                  <option value="">Select Product</option>
                                  {productItems.map(product => (
                                    <option key={product.id} value={product.id}>{product.title}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center space-x-3">
                                <label htmlFor={`product-tag-${index}`} className="text-gray-700 text-sm">Tag/Headline:</label>
                                <input
                                  type="text"
                                  id={`product-tag-${index}`}
                                  className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm flex-grow"
                                  placeholder="e.g., อันดับ 1, น่าสนใจ, โดดเด่น"
                                  value={contentBlock.productTag || ''}
                                  onChange={(e) => handleContentChange(index, 'productTag', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1 ml-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveContent(index)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Remove
                          </button>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveContent(index, index - 1)}
                              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs"
                            >
                              Up
                            </button>
                          )}
                          {index < contents.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveContent(index, index + 1)}
                              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs"
                            >
                              Down
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleAddContent('TEXT')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        Add Text Block
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddContent('IMAGE')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        Add Image Block
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddContent('PRODUCT')}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        Add Product Block
                      </button>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  >
                    {currentArticle ? 'Update Article' : 'Create Article'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMediaModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="relative p-8 bg-white w-full max-w-3xl mx-auto rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Media</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {mediaItems.length === 0 ? (
                  <p className="col-span-3 text-center text-gray-600">No media items available.</p>
                ) : (
                  mediaItems.map((media) => (
                    <div
                      key={media.id}
                      className="cursor-pointer border rounded-lg p-2 hover:shadow-md transition-shadow"
                      onClick={() => handleMediaSelected(media)}
                    >
                      <div className="relative w-full h-32 mb-2">
                        <Image
                          src={media.url}
                          alt={media.altText || 'Media Thumbnail'}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-md"
                        />
                      </div>
                      <p className="text-sm text-gray-700 truncate">{media.altText || media.url.split('/').pop()}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaModal(false);
                    setCurrentMediaSelectionType(null);
                    setCurrentContentBlockIndex(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}