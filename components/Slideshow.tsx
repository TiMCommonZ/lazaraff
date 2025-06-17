'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Slide {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  media: { url: string; altText: string | null };
}

export default function Slideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/slides');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Slide[] = await response.json();
        setSlides(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  if (loading) return <div className="text-center text-gray-600">Loading slideshow...</div>;
  if (error) return <div className="text-center text-red-600">Error: {error}</div>;
  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-96 rounded-lg shadow-lg overflow-hidden">
      <Image
        src={currentSlide.media.url}
        alt={currentSlide.media.altText || currentSlide.title}
        layout="fill"
        objectFit="cover"
        className="transition-opacity duration-1000 ease-in-out"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <h3 className="text-4xl font-bold mb-2 text-center">{currentSlide.title}</h3>
        {currentSlide.description && (
          <p className="text-lg text-center mb-4">{currentSlide.description}</p>
        )}
        {currentSlide.link && (
          <a
            href={currentSlide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            Learn More
          </a>
        )}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
} 