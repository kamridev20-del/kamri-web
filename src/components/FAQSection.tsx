'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Search, ChevronDown, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../contexts/LanguageContext';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  helpful?: number;
  notHelpful?: number;
}

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [helpfulCounts, setHelpfulCounts] = useState<Record<number, { helpful: number; notHelpful: number }>>({});

  const faqs: FAQ[] = [
    {
      question: t('faq.questions.where_is_order.question'),
      answer: t('faq.questions.where_is_order.answer'),
      category: t('faq.categories.orders')
    },
    {
      question: t('faq.questions.how_to_return.question'),
      answer: t('faq.questions.how_to_return.answer'),
      category: t('faq.categories.returns')
    },
    {
      question: t('faq.questions.delivery_times.question'),
      answer: t('faq.questions.delivery_times.answer'),
      category: t('faq.categories.shipping')
    },
    {
      question: t('faq.questions.payment_methods.question'),
      answer: t('faq.questions.payment_methods.answer'),
      category: t('faq.categories.payment')
    },
    {
      question: t('faq.questions.modify_cancel_order.question'),
      answer: t('faq.questions.modify_cancel_order.answer'),
      category: t('faq.categories.orders')
    },
    {
      question: t('faq.questions.create_account.question'),
      answer: t('faq.questions.create_account.answer'),
      category: t('faq.categories.account')
    },
    {
      question: t('faq.questions.reset_password.question'),
      answer: t('faq.questions.reset_password.answer'),
      category: t('faq.categories.account')
    },
    {
      question: t('faq.questions.warranty.question'),
      answer: t('faq.questions.warranty.answer'),
      category: t('faq.categories.warranty')
    },
    {
      question: t('faq.questions.international_delivery.question'),
      answer: t('faq.questions.international_delivery.answer'),
      category: t('faq.categories.shipping')
    },
    {
      question: t('faq.questions.contact_support.question'),
      answer: t('faq.questions.contact_support.answer'),
      category: t('faq.categories.contact')
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = useMemo(() => {
    let filtered = faqs;

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleHelpful = (index: number, isHelpful: boolean) => {
    setHelpfulCounts(prev => ({
      ...prev,
      [index]: {
        helpful: isHelpful ? (prev[index]?.helpful || 0) + 1 : (prev[index]?.helpful || 0),
        notHelpful: !isHelpful ? (prev[index]?.notHelpful || 0) + 1 : (prev[index]?.notHelpful || 0)
      }
    }));
  };

  // Questions les plus populaires (simulé)
  const popularFAQs = faqs.slice(0, 3);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#4CAF50] mb-2 sm:mb-4">
          {t('faq.title')}
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-[#424242] mb-6 sm:mb-8">
          {t('faq.subtitle')}
        </p>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('faq.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm sm:text-base"
              aria-label={t('faq.search_label')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={t('faq.clear_search')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Catégories */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#4CAF50] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? t('faq.all_categories') : category}
            </button>
          ))}
        </div>
      </div>

      {/* Questions populaires */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-[#424242] mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#4CAF50]" />
            {t('faq.popular_questions')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {popularFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  const faqIndex = faqs.findIndex(f => f.question === faq.question);
                  if (faqIndex !== -1) {
                    setOpenIndex(faqIndex);
                    document.getElementById('faq-list')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-[#4CAF50]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#4CAF50] font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-[#424242] line-clamp-2">
                    {faq.question}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des FAQ */}
      <div id="faq-list" className="space-y-3 sm:space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-[#424242] mb-2">
              {t('faq.no_results')}
            </p>
            <p className="text-sm text-gray-500">
              {t('common.no_results')}
            </p>
          </div>
        ) : (
          filteredFAQs.map((faq, index) => {
            const originalIndex = faqs.findIndex(f => f.question === faq.question);
            const isOpen = openIndex === originalIndex;
            const helpfulData = helpfulCounts[originalIndex] || { helpful: 0, notHelpful: 0 };

            return (
              <motion.div
                key={originalIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(originalIndex)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-[10px] sm:text-xs font-medium">
                        {faq.category}
                      </span>
                    </div>
                    <span className="font-semibold text-[#424242] text-sm sm:text-base lg:text-lg block">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-[#4CAF50]" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4">
                        <p className="text-[#424242] leading-relaxed text-sm sm:text-base mb-4">
                          {faq.answer}
                        </p>
                        
                        {/* Feedback utile */}
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                          <span className="text-xs sm:text-sm text-gray-600">{t('faq.was_helpful')}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHelpful(originalIndex, true);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-gray-600 hover:text-[#4CAF50] hover:bg-[#E8F5E8] rounded transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              {helpfulData.helpful > 0 && <span>{helpfulData.helpful}</span>}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHelpful(originalIndex, false);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              {helpfulData.notHelpful > 0 && <span>{helpfulData.notHelpful}</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Statistiques */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="mt-8 p-4 sm:p-6 bg-[#E8F5E8] rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#4CAF50]">{faqs.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Questions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#4CAF50]">{categories.length - 1}</div>
              <div className="text-xs sm:text-sm text-gray-600">Catégories</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#4CAF50]">98%</div>
              <div className="text-xs sm:text-sm text-gray-600">Satisfaction</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#4CAF50]">24h</div>
              <div className="text-xs sm:text-sm text-gray-600">Réponse</div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 sm:mt-12 text-center"
      >
        <p className="text-[#424242] mb-4 text-sm sm:text-base">
          Vous ne trouvez pas la réponse à votre question ?
        </p>
        <Link href="#contact-form">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#4CAF50] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#2E7D32] transition-colors duration-300 text-sm sm:text-base"
          >
            Contactez notre support
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
