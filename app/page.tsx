import Image from "next/image";
import Slideshow from '../components/Slideshow';
import ArticleCard from '../components/ArticleCard';
import ProductCard from '../components/ProductCard';

interface Article {
  id: string;
  title: string;
  createdAt: string;
  coverMedia: { url: string; altText: string | null };
  description: string | null;
}

interface Product {
  id: string;
  title: string;
  normalPrice: number;
  specialPrice?: number | null;
  mainRating: number;
  coverMedia: { url: string; altText: string | null };
  productLink: string;
  comparePriceLink: string;
  description: string | null;
}

async function getArticles(): Promise<Article[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/articles?limit=3`, {
    next: { revalidate: 3600 } // Revalidate data every hour
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch articles');
  }
  return res.json();
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/products?limit=3`, {
    next: { revalidate: 3600 } // Revalidate data every hour
  });
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export default async function Home() {
  const articles = await getArticles();
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      {/* Slideshow Section */}
      <section className="w-full max-w-6xl mb-12">
        <Slideshow />
      </section>

      {/* Article Cards Section */}
      <section className="w-full max-w-6xl mb-12">
        <div className="relative flex items-center justify-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <h2 className="text-3xl font-bold text-center mx-4">บทความ</h2>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">No articles available.</p>
          ) : (
            articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                coverMedia={article.coverMedia}
                createdAt={article.createdAt}
                description={article.description}
              />
            ))
          )}
        </div>
      </section>

      {/* Product Cards Section */}
      <section className="w-full max-w-6xl">
        <div className="relative flex items-center justify-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <h2 className="text-3xl font-bold text-center mx-4">สินค้า</h2>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">No products available.</p>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                normalPrice={product.normalPrice}
                specialPrice={product.specialPrice}
                mainRating={product.mainRating}
                coverMedia={product.coverMedia}
                productLink={product.productLink}
                comparePriceLink={product.comparePriceLink}
                description={product.description}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
