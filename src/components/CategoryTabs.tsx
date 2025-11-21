interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
}

// Mapping des icônes pour les catégories
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Mode': '👕',
    'Technologie': '💻',
    'Maison': '🏠',
    'Beauté': '💅',
    'Accessoires': '🎒',
    'Sport': '⚽',
    'Enfants': '🧸',
  };
  return iconMap[categoryName] || '🛍️';
};

export default function CategoryTabs({ selectedCategory, setSelectedCategory, categories }: CategoryTabsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex flex-wrap gap-2">
        {/* Bouton "Tous" */}
        <button
          onClick={() => setSelectedCategory('tous')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
            selectedCategory === 'tous'
              ? 'bg-[#4CAF50] text-white shadow-lg transform scale-105'
              : 'bg-[#E8F5E8] text-[#424242] hover:bg-[#4CAF50] hover:text-white hover:scale-105'
          }`}
        >
          <span className="mr-2">🛍️</span>
          Tous
        </button>

        {/* Catégories dynamiques */}
        {categories && categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              selectedCategory === category.id
                ? 'bg-[#4CAF50] text-white shadow-lg transform scale-105'
                : 'bg-[#E8F5E8] text-[#424242] hover:bg-[#4CAF50] hover:text-white hover:scale-105'
            }`}
          >
            <span className="mr-2">{getCategoryIcon(category.name)}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
