import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  createdAt: string;
  coverMedia: { url: string; altText: string | null };
  bannerMedia: { url: string; altText: string | null };
  contents: ArticleContent[];
}

interface ArticleContent {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'PRODUCT';
  order: number;
  text: string | null;
  media?: { url: string; altText: string | null } | null;
  product?: {
    id: string;
    title: string;
    normalPrice: number;
    specialPrice?: number | null;
    mainRating: number;
    productLink: string;
    comparePriceLink: string;
    coverMedia: { url: string; altText: string | null };
    qualityRating?: number;
    performanceRating?: number;
    valueRating?: number;
    qualityRatingLabel?: string | null;
    performanceRatingLabel?: string | null;
    valueRatingLabel?: string | null;
    description?: string | null;
  } | null;
  productTag?: string | null;
}

interface RelatedArticle {
  id: string;
  title: string;
  coverMedia: { url: string; altText: string | null };
  createdAt: string;
  description?: string | null;
}

async function getArticle(id: string): Promise<Article> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/articles/${id}`, {
    next: { revalidate: 3600 } // Revalidate data every hour
  });
  if (!res.ok) {
    notFound();
  }
  return res.json();
}

async function getRelatedArticles(currentArticleId: string): Promise<RelatedArticle[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/articles?limit=4`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    return [];
  }
  const allArticles: RelatedArticle[] = await res.json();
  return allArticles.filter(article => article.id !== currentArticleId).slice(0, 4);
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  const relatedArticles = await getRelatedArticles(params.id);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      {/* Banner Section */}
      {article.bannerMedia && (
        <section className="w-full max-w-6xl mb-8 relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={article.bannerMedia.url}
            alt={article.bannerMedia.altText || article.title}
            layout="fill"
            objectFit="cover"
          />
        </section>
      )}

      <div className="w-full max-w-6xl mb-8">
        {/* Article Content Section */}
        <article className="w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-4xl font-bold py-4 mb-4 text-purple-700 text-center">{article.title}</h2>
          
          {article.contents.length === 0 ? (
            <p className="text-gray-600">No content available for this article.</p>
          ) : (
            article.contents.map((content) => {
              return (
                <div key={content.id} className="mb-6">
                  {content.type === 'TEXT' && content.text && (
                    <p className="text-gray-700 leading-relaxed">{content.text}</p>
                  )}
                  {content.type === 'IMAGE' && content.media && (
                    <div className="relative w-full my-4">
                      <Image
                        src={content.media.url}
                        alt={content.media.altText || 'Article Image'}
                        layout="responsive"
                        width={1600}
                        height={900}
                        objectFit="contain"
                      />
                    </div>
                  )}
                  {content.type === 'PRODUCT' && content.product && (() => {
                    const product = content.product;
                    return (
                      <div className="border border-gray-200 rounded-lg p-4 my-4 flex flex-col gap-4">
                        {content.productTag && (
                          <div className="w-full flex justify-start items-center pb-3 mb-2 border-b border-gray-300">
                            <p className="text-blue-800 text-2xl font-semibold">{content.productTag}</p>
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          {/* Left Side: Product Image (1:1 Ratio) */}
                          {product.coverMedia?.url && (
                            <div className="relative w-full md:w-1/3 aspect-square rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={product.coverMedia.url}
                                alt={product.coverMedia.altText || product.title || 'Product Image'}
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                          )}
                          {/* Right Side: Product Details */}
                          <div className="flex-1 flex flex-col gap-2">
                            <h4 className="text-2xl font-semibold text-gray-800">{product.title}</h4>
                            <div className="flex items-baseline">
                              {product.specialPrice !== null && product.specialPrice !== undefined && product.specialPrice < product.normalPrice ? (
                                <span className="text-red-600 text-xl font-bold mr-2">฿{product.specialPrice.toLocaleString('en-US')}</span>
                              ) : null}
                              <span className={`${product.specialPrice !== null && product.specialPrice !== undefined && product.specialPrice < product.normalPrice ? 'line-through text-gray-500 text-sm' : 'text-green-600 text-2xl font-bold'}`}>
                                ฿{product.normalPrice.toLocaleString('en-US')}
                              </span>
                            </div>
                            {/* Main Rating */}
                            <div className="flex items-center mb-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-5 h-5 ${i < (product.mainRating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                                </svg>
                              ))}
                              <span className="ml-2 text-gray-600 text-sm">({product.mainRating ?? 0} / 5)</span>
                            </div>
                            {/* Sub-Ratings */}
                            <div className="flex flex-col md:flex-row md:flex-wrap md:gap-x-8 lg:flex-row lg:flex-nowrap lg:gap-x-12 text-sm">
                              {product.qualityRatingLabel && (
                                <div className="text-gray-700 flex items-center flex-nowrap gap-1">
                                  <span className="text-gray-700 flex-shrink-0">{product.qualityRatingLabel}:</span>
                                  <div className="flex flex-nowrap w-24 space-x-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-4 h-4 ${i < (product.qualityRating ?? 0) ? 'text-blue-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {product.performanceRatingLabel && (
                                <div className="text-gray-700 flex items-center flex-nowrap gap-1">
                                  <span className="text-gray-700 flex-shrink-0">{product.performanceRatingLabel}:</span>
                                  <div className="flex flex-nowrap w-24 space-x-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-4 h-4 ${i < (product.performanceRating ?? 0) ? 'text-blue-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {product.valueRatingLabel && (
                                <div className="text-gray-700 flex items-center flex-nowrap gap-1">
                                  <span className="text-gray-700 flex-shrink-0">{product.valueRatingLabel}:</span>
                                  <div className="flex flex-nowrap w-24 space-x-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-4 h-4 ${i < (product.valueRating ?? 0) ? 'text-blue-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.96a1 1 0 01-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446a1 1 0 01-1.54-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.052 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {product.description && (
                              <p className="text-gray-700 leading-relaxed text-sm mt-2">{product.description}</p>
                            )}

                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-200">
                              <a
                                href={product.productLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-center transition duration-300 min-w-[120px]"
                              >
                                ไปที่สินค้า
                              </a>
                              <a
                                href={product.comparePriceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full text-center transition duration-300 min-w-[120px]"
                              >
                                เทียบราคา
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })
          )}
        </article>
      </div>

      {/* Recommended Articles Section */}
      <aside className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">บทความแนะนำ</h3>
          {relatedArticles.length === 0 ? (
            <p className="text-gray-600">No related articles available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link key={relatedArticle.id} href={`/articles/${relatedArticle.id}`} className="block group">
                  <div className="flex flex-col">
                    <div className="relative w-full aspect-square mb-4 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={relatedArticle.coverMedia.url}
                        alt={relatedArticle.coverMedia.altText || relatedArticle.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{relatedArticle.title}</h4>
                      {relatedArticle.description && (
                        <p className="text-gray-700 text-sm mt-1">
                          {relatedArticle.description.length > 100 ? `${relatedArticle.description.substring(0, 100)}...` : relatedArticle.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
    </div>
  );
} 