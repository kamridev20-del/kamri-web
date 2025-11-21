'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mail, Clock, Phone, MapPin, ExternalLink, Download, Copy, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../lib/api';

interface CompanyInfo {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
}

export default function ContactInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Vérifier la disponibilité
  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      setIsOnline(day >= 1 && day <= 5 && hour >= 9 && hour < 18);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const response = await apiClient.getCompanyInfo();
        if (response.data) {
          setCompanyInfo(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations de l\'entreprise:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyInfo();
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  };

  const contactMethods = [
    {
      icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Email',
      content: companyInfo?.companyEmail || 'support@kamri.com',
      description: 'Réponse sous 24h',
      action: 'mailto',
      actionLabel: 'Envoyer un email'
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Horaires',
      content: 'Lun-Ven, 9h-18h (CET)',
      description: isOnline ? `En ligne maintenant (${getCurrentTime()})` : 'Hors ligne',
      status: isOnline ? 'online' : 'offline',
      action: null,
      actionLabel: null
    },
    {
      icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Téléphone',
      content: companyInfo?.companyPhone || '+33 1 23 45 67 89',
      description: 'Appel gratuit',
      action: 'tel',
      actionLabel: 'Appeler maintenant'
    },
    {
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Adresse',
      content: companyInfo?.companyAddress || '123 Rue de la Paix, 75001 Paris',
      description: 'Siège social',
      action: 'map',
      actionLabel: 'Voir sur la carte'
    }
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      url: 'https://instagram.com/kamri',
      color: 'hover:text-pink-500'
    },
    {
      name: 'TikTok',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
      url: 'https://tiktok.com/@kamri',
      color: 'hover:text-black'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: 'https://facebook.com/kamri',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: 'https://twitter.com/kamri',
      color: 'hover:text-sky-500'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: 'https://linkedin.com/company/kamri',
      color: 'hover:text-blue-700'
    },
    {
      name: 'YouTube',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      url: 'https://youtube.com/@kamri',
      color: 'hover:text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Informations de contact */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#424242] mb-4 sm:mb-6">
          Informations de contact
        </h2>
        
        <div className="space-y-4 sm:space-y-6">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center text-[#4CAF50] ${
                method.status === 'online' ? 'ring-2 ring-green-400' : ''
              }`}>
                {method.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-[#424242] text-base sm:text-lg">
                    {method.title}
                  </h3>
                  {method.status && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                      method.status === 'online' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.status === 'online' ? 'En ligne' : 'Hors ligne'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#4CAF50] font-medium text-sm sm:text-base break-all">
                    {method.content}
                  </p>
                  {method.action && (
                    <>
                      {method.action === 'mailto' && (
                        <a
                          href={`mailto:${method.content}`}
                          className="p-1.5 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded transition-colors"
                          title="Envoyer un email"
                          aria-label={`Envoyer un email à ${method.content}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {method.action === 'tel' && (
                        <a
                          href={`tel:${method.content.replace(/\s/g, '')}`}
                          className="p-1.5 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded transition-colors"
                          title="Appeler"
                          aria-label={`Appeler ${method.content}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {method.action === 'map' && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(method.content)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded transition-colors"
                          title="Voir sur la carte"
                          aria-label="Voir l'adresse sur la carte"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => copyToClipboard(method.content, method.title)}
                        className="p-1.5 text-gray-400 hover:text-[#4CAF50] hover:bg-gray-100 rounded transition-colors"
                        title="Copier"
                        aria-label={`Copier ${method.content}`}
                      >
                        {copiedField === method.title ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  {method.description}
                </p>
                {method.actionLabel && (
                  <a
                    href={
                      method.action === 'mailto' ? `mailto:${method.content}` :
                      method.action === 'tel' ? `tel:${method.content.replace(/\s/g, '')}` :
                      method.action === 'map' ? `https://maps.google.com/?q=${encodeURIComponent(method.content)}` : '#'
                    }
                    target={method.action === 'map' ? '_blank' : undefined}
                    rel={method.action === 'map' ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 mt-2 text-xs sm:text-sm text-[#4CAF50] hover:text-[#2E7D32] font-medium transition-colors"
                  >
                    {method.actionLabel}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Télécharger vCard */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              const vcard = `BEGIN:VCARD
VERSION:3.0
FN:KAMRI Support
ORG:KAMRI
EMAIL:${companyInfo?.companyEmail || 'support@kamri.com'}
TEL:${companyInfo?.companyPhone || '+33123456789'}
ADR:;;${companyInfo?.companyAddress || '123 Rue de la Paix, 75001 Paris'};;;
END:VCARD`;
              const blob = new Blob([vcard], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'kamri-contact.vcf';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 text-sm text-[#4CAF50] hover:text-[#2E7D32] font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Télécharger les coordonnées (vCard)
          </button>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#424242] mb-4 sm:mb-6">
          Suivez-nous
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-600 transition-all duration-300 ${social.color} hover:shadow-md group`}
              title={social.name}
              aria-label={`Suivez-nous sur ${social.name}`}
            >
              {social.icon}
              <span className="text-[10px] sm:text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {social.name}
              </span>
            </motion.a>
          ))}
        </div>
        
        <p className="text-gray-500 text-xs sm:text-sm mt-4 text-center">
          Restez informé de nos dernières nouveautés et offres exclusives
        </p>
      </div>
    </div>
  );
}
