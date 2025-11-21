'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const trendingItems = [
  {
    id: 1,
    title: 'Mode Éthique',
    subtitle: 'Vêtements durables',
    icon: '🌱',
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    count: 89
  },
  {
    id: 2,
    title: 'Tech Éco',
    subtitle: 'Électronique verte',
    icon: '🔋',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    count: 156
  },
  {
    id: 3,
    title: 'Maison Bio',
    subtitle: 'Déco naturelle',
    icon: '🏡',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    count: 234
  },
  {
    id: 4,
    title: 'Sport Vert',
    subtitle: 'Équipement éco',
    icon: '🌿',
    color: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    count: 67
  }
];

export default function TrendingSection() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-br from-[#F0F8F0] to-[#E8F5E8] rounded-3xl p-8 shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-[#4CAF50] mb-4">
          🌟 Tendances du moment
        </h2>
        <p className="text-lg text-[#424242] max-w-2xl mx-auto">
          Découvrez les catégories qui font sensation en ce moment
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onHoverStart={() => setHoveredItem(item.id)}
            onHoverEnd={() => setHoveredItem(null)}
            className="group cursor-pointer"
          >
            <div className={`${item.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-white relative overflow-hidden`}>
              {/* Fond dégradé animé */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                animate={{ 
                  opacity: hoveredItem === item.id ? 0.1 : 0 
                }}
              />
              
              {/* Contenu */}
              <div className="relative z-10">
                {/* Icône */}
                <motion.div
                  animate={{ 
                    scale: hoveredItem === item.id ? 1.2 : 1,
                    rotate: hoveredItem === item.id ? 5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl mb-4"
                >
                  {item.icon}
                </motion.div>

                {/* Titre */}
                <h3 className={`text-xl font-bold ${item.textColor} mb-2 group-hover:text-[#4CAF50] transition-colors duration-300`}>
                  {item.title}
                </h3>

                {/* Sous-titre */}
                <p className="text-sm text-gray-600 mb-4">
                  {item.subtitle}
                </p>

                {/* Compteur */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {item.count} produits
                  </span>
                  
                  <motion.div
                    animate={{ 
                      x: hoveredItem === item.id ? 5 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-[#4CAF50]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Effet de brillance au survol */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ 
                  x: hoveredItem === item.id ? ['0%', '100%'] : '0%',
                  opacity: hoveredItem === item.id ? [0, 0.2, 0] : 0
                }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center mt-12"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#4CAF50] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#45a049] transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          Découvrir toutes les tendances
        </motion.button>
      </motion.div>
    </div>
  );
}
