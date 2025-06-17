import Image from 'next/image';

interface ProductCardProps {
  id: string;
  title: string;
  normalPrice: number;
  specialPrice?: number | null;
  mainRating: number;
  coverMedia: { url: string; altText: string | null };
  productLink: string;
  comparePriceLink: string;
  description?: string | null;
  // Add sub-ratings here when the data structure is clearer from backend
  // qualityRating?: number;
  // performanceRating?: number;
  // valueRating?: number;
}

export default function ProductCard({
  id,
  title,
  normalPrice,
  specialPrice,
  mainRating,
  coverMedia,
  productLink,
  comparePriceLink,
  description,
}: ProductCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          src={coverMedia.url}
          alt={coverMedia.altText || title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex flex-col flex-grow mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <div className="flex items-baseline">
            {specialPrice !== null && specialPrice !== undefined && specialPrice < normalPrice ? (
              <>
                <span className="text-green-600 font-bold text-lg mr-2">฿{specialPrice.toLocaleString()}</span>
                <span className="text-red-600 line-through text-sm">฿{normalPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-blue-600 font-bold text-lg">฿{normalPrice.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center">
            {renderStars(mainRating)}
            <span className="ml-2 text-gray-600 text-sm">({mainRating.toFixed(1)})</span>
          </div>
          {description && (
            <p className="text-gray-700 text-base">
              {description.length > 100 ? `${description.substring(0, 100)}...` : description}
            </p>
          )}
        </div>

        {/* Placeholder for sub-ratings - will be developed when backend data is available */}
        {/*
        <div className="mb-4">
          <p className="text-gray-700 text-sm">คุณภาพ: {renderStars(qualityRating || 0)}</p>
          <p className="text-gray-700 text-sm">ประสิทธิภาพ: {renderStars(performanceRating || 0)}</p>
          <p className="text-gray-700 text-sm">ความคุ้มค่า: {renderStars(valueRating || 0)}</p>
        </div>
        */}

        <div className="mt-auto flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
          <a
            href={productLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            ไปที่สินค้า
          </a>
          <a
            href={comparePriceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            เทียบราคา
          </a>
        </div>
      </div>
    </div>
  );
} 