'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Category {
  id: number;
  name: string;
  image: string;
  count: number;
  color: string;
  icon: string;
}

interface PopularCategoriesSliderProps {
  categories: Category[];
}

export default function PopularCategoriesSlider({ categories }: PopularCategoriesSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 320; // Largeur d'une carte + gap
      const scrollPosition = index * cardWidth;
      
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    const totalPages = Math.ceil(categories.length / 2); // 2 catégories par page
    const nextIndex = (currentIndex + 1) % totalPages;
    scrollToIndex(nextIndex);
  };

  const prevSlide = () => {
    const totalPages = Math.ceil(categories.length / 2); // 2 catégories par page
    const prevIndex = currentIndex === 0 ? totalPages - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  // Auto-scroll effect - adaptatif selon le nombre de catégories
  useEffect(() => {
    if (isAutoScrolling && categories.length > 0) {
      autoScrollRef.current = setInterval(() => {
        nextSlide();
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [currentIndex, isAutoScrolling, categories.length]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoScrolling(true);
  };

  // Fonctions de navigation
  const handleCategoryClick = (category: Category) => {
    const slug = category.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/categories/${slug}`);
  };

  const handleExploreClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation(); // Empêcher le clic sur la carte parent
    const slug = category.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/categories/${slug}/products`);
  };

  return (
    <div className="relative">
      {/* Boutons de navigation */}
      <div className="flex justify-between items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevSlide}
          className="bg-white text-[#4CAF50] p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <div className="flex space-x-2">
          {Array.from({ length: Math.ceil(categories.length / 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-[#4CAF50] scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextSlide}
          className="bg-white text-[#4CAF50] p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Slider */}
      <div 
        className="overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={scrollRef}
          className="flex space-x-6 transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${categories.length * 320}px`
          }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-80"
            >
              <div 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                {/* Image de la catégorie */}
                <div className="relative h-40 overflow-hidden">
                  <div 
                    className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <div className="text-5xl opacity-80">
                      {category.icon}
                    </div>
                  </div>
                  
                  {/* Badge populaire */}
                  <div className="absolute top-4 right-4 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-xs font-bold text-white">
                    Populaire
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#424242] mb-2 group-hover:text-[#4CAF50] transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.count} produits
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleExploreClick(e, category)}
                      className="bg-[#4CAF50] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#45a049] transition-colors duration-300"
                    >
                      Explorer
                    </motion.button>
                  </div>
                </div>

                {/* Indicateur de couleur */}
                <div 
                  className="h-1 w-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
