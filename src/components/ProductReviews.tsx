'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiClient } from '../lib/api';
import ProductReviewsModal from './ProductReviewsModal';

interface CJReview {
  commentId: number | string;
  pid: string;
  comment: string;
  score: string;
  commentUser: string;
  commentUrls?: string[];
  countryCode?: string;
  flagIconUrl?: string;
  commentDate: string;
  id?: string;
  rating?: number;
  userName?: string;
  images?: string[];
  createdAt?: string;
  verified?: boolean;
}

interface ProductReviewsProps {
  cjProductId?: string | null;
  productId: string;
  currentRating?: number;
  currentReviewsCount?: number;
}

export default function ProductReviews({ 
  cjProductId, 
  productId,
  currentRating,
  currentReviewsCount 
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<CJReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      if (!cjProductId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getCJProductReviews(cjProductId);
        
        if (response.data && response.data.reviews) {
          setReviews(response.data.reviews);
        }
      } catch (err: any) {
        console.error('Erreur chargement avis:', err);
        setError('Impossible de charger les avis');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [cjProductId]);

  // Calculer les statistiques
  const stats = {
    total: reviews.length,
    average: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || parseInt(r.score) || 0), 0) / reviews.length
      : currentRating || 0,
  };

  // Limiter à 5 avis pour l'affichage
  const displayedReviews = reviews.slice(0, 5);
  const hasMoreReviews = reviews.length > 5;

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (!cjProductId) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-4">⭐</p>
        <p className="text-lg mb-2">Aucun avis disponible</p>
        <p className="text-sm">Ce produit n'a pas encore d'avis clients.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-4">⭐</p>
        <p className="text-lg mb-2">Aucun avis pour le moment</p>
        <p className="text-sm">Soyez le premier à laisser un avis !</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Note moyenne */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#424242] mb-1">
            {stats.average.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < Math.floor(stats.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-xs text-gray-600">{stats.total} avis</p>
        </div>

        {/* Liste des 5 premiers avis */}
        <div className="space-y-2">
          {displayedReviews.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-xs">Aucun avis disponible.</p>
            </div>
          ) : (
            displayedReviews.map((review) => {
            const rating = review.rating || parseInt(review.score) || 0;
            return (
              <div key={review.commentId || review.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-[#4CAF50] rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
                      {review.commentUser?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-semibold text-[#424242]">{review.commentUser || review.userName || 'Anonyme'}</p>
                        {review.verified && (
                          <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-2.5 w-2.5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {formatDate(review.commentDate || review.createdAt || '')}
                        </span>
                        {review.countryCode && (
                          <span className="text-[10px] text-gray-500">
                            {review.flagIconUrl && (
                              <img src={review.flagIconUrl} alt={review.countryCode} className="inline w-2.5 h-2.5 mr-0.5" />
                            )}
                            {review.countryCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#424242] mb-2 leading-relaxed">{review.comment}</p>

                {/* Images du review */}
                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={img}
                          alt={`Photo avis ${idx + 1}`}
                          fill
                          className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>

        {/* Bouton Voir plus */}
        {hasMoreReviews && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 px-4 bg-[#4CAF50] text-white rounded-lg text-sm font-semibold hover:bg-[#2E7D32] transition-colors"
          >
            Voir tous les avis ({stats.total})
          </button>
        )}
      </div>

      {/* Modale pour tous les avis */}
      <ProductReviewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cjProductId={cjProductId}
        productId={productId}
        currentRating={currentRating}
        currentReviewsCount={currentReviewsCount}
      />
    </>
  );
}

