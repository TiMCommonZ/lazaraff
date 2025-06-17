import Image from 'next/image';
import Link from 'next/link';

interface ArticleCardProps {
  id: string;
  title: string;
  coverMedia: { url: string; altText: string | null };
  createdAt: string;
  description?: string | null;
}

export default function ArticleCard({ id, title, coverMedia, createdAt, description }: ArticleCardProps) {
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
        <h3 className="text-xl font-bold mb-2 text-gray-800 flex-grow">ผลิตภันต์: {title}</h3>
        {description && (
          <p className="text-gray-700 text-base mb-4">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
        )}
        <Link href={`/articles/${id}`} className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-center transition duration-300 mt-auto">
            เปิดอ่าน
        </Link>
      </div>
    </div>
  );
} 