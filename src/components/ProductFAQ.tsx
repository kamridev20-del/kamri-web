'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
}

// Les FAQs par défaut seront créées dynamiquement avec les traductions
const getDefaultFAQs = (t: (key: string) => string): FAQItem[] => [
  {
    question: t('faq.questions.delivery_times.question'),
    answer: t('faq.questions.delivery_times.answer'),
  },
  {
    question: t('faq.questions.return_policy.question'),
    answer: t('faq.questions.return_policy.answer'),
  },
  {
    question: t('faq.questions.track_order.question'),
    answer: t('faq.questions.track_order.answer'),
  },
  {
    question: t('faq.questions.payment_methods.question'),
    answer: t('faq.questions.payment_methods.answer'),
  },
  {
    question: t('faq.questions.free_shipping.question'),
    answer: t('faq.questions.free_shipping.answer'),
  },
  {
    question: t('faq.questions.defective_product.question'),
    answer: t('faq.questions.defective_product.answer'),
  },
];

interface ProductFAQProps {
  customFAQs?: FAQItem[];
}

export default function ProductFAQ({ customFAQs }: ProductFAQProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = customFAQs || getDefaultFAQs(t);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-[#424242] mb-4">{t('faq.title')}</h2>
      
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-[#4CAF50]"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold text-[#424242] pr-3">{faq.question}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#81C784] flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 py-3 bg-gray-50 text-sm text-gray-700 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

