'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  image: string;
  count: number;
  color: string;
  icon: string;
}

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleCategoryClick = () => {
    const slug = category.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/categories/${slug}`);
  };

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = category.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/categories/${slug}/products`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCategoryClick}
      className="group cursor-pointer"
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Image de la catégorie */}
        <div className="relative h-48 overflow-hidden">
          <div 
            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
            style={{ backgroundColor: category.color + '20' }}
          >
            <div className="text-6xl opacity-80">
              {category.icon}
            </div>
          </div>
          
          {/* Overlay au survol */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              className="bg-white text-[#4CAF50] px-4 py-2 rounded-full font-semibold"
            >
              Explorer
            </motion.div>
          </motion.div>
        </div>

        {/* Contenu de la carte */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#424242] mb-2 group-hover:text-[#4CAF50] transition-colors duration-300">
            {category.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {category.count} produits
            </span>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewAllClick}
              className="bg-[#4CAF50] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#45a049] transition-colors duration-300"
            >
              Voir tout
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
  );
}
