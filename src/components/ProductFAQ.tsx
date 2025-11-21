'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'Quels sont les délais de livraison ?',
    answer: 'Les délais de livraison varient selon votre localisation. En général, comptez entre 7 et 15 jours ouvrés pour la livraison standard. Les commandes sont expédiées sous 24-48h après confirmation du paiement.',
  },
  {
    question: 'Quelle est votre politique de retour ?',
    answer: 'Nous acceptons les retours sous 30 jours après réception. Les articles doivent être dans leur état d\'origine, non portés et avec leurs étiquettes. Les retours sont gratuits pour les commandes de plus de 50$.',
  },
  {
    question: 'Comment puis-je suivre ma commande ?',
    answer: 'Une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pourrez suivre votre colis en temps réel sur notre site ou via le transporteur.',
  },
  {
    question: 'Quels modes de paiement acceptez-vous ?',
    answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, et les virements bancaires. Tous les paiements sont sécurisés et cryptés.',
  },
  {
    question: 'Offrez-vous la livraison gratuite ?',
    answer: 'Oui ! La livraison est gratuite pour toutes les commandes de plus de 50$. Pour les commandes inférieures, des frais de livraison standard s\'appliquent.',
  },
  {
    question: 'Que faire si mon produit est défectueux ?',
    answer: 'Si vous recevez un produit défectueux, contactez-nous immédiatement. Nous vous enverrons un produit de remplacement gratuitement ou procéderons à un remboursement complet selon votre préférence.',
  },
];

interface ProductFAQProps {
  customFAQs?: FAQItem[];
}

export default function ProductFAQ({ customFAQs }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = customFAQs || defaultFAQs;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-[#424242] mb-4">Questions fréquentes</h2>
      
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

