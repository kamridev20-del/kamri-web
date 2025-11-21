'use client';

import { Share2, Facebook, Twitter, Mail, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface ProductShareButtonsProps {
  productName: string;
  productUrl: string;
}

export default function ProductShareButtons({ productName, productUrl }: ProductShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(productName)}&url=${encodeURIComponent(productUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(productUrl)}`,
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" />
        Partager:
      </span>
      
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        aria-label="Partager sur Facebook"
      >
        <Facebook className="w-3.5 h-3.5" />
      </a>
      
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
        aria-label="Partager sur Twitter"
      >
        <Twitter className="w-3.5 h-3.5" />
      </a>
      
      <a
        href={shareLinks.email}
        className="p-1.5 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
        aria-label="Partager par email"
      >
        <Mail className="w-3.5 h-3.5" />
      </a>
      
      <button
        onClick={handleCopyLink}
        className={`p-1.5 rounded-full transition-colors ${
          copied 
            ? 'bg-[#4CAF50] text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Copier le lien"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
      
      {copied && (
        <span className="text-xs text-[#4CAF50] font-medium">Lien copié !</span>
      )}
    </div>
  );
}

