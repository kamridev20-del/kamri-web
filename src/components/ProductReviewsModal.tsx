'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/api';

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

interface ProductReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cjProductId?: string | null;
  productId: string;
  currentRating?: number;
  currentReviewsCount?: number;
}

export default function ProductReviewsModal({
  isOpen,
  onClose,
  cjProductId,
  productId,
  currentRating,
  currentReviewsCount
}: ProductReviewsModalProps) {
  const [reviews, setReviews] = useState<CJReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1' | 'withPhotos'>('all');

  useEffect(() => {
    if (isOpen && cjProductId) {
      loadReviews();
    }
  }, [isOpen, cjProductId]);

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

  // Calculer les statistiques
  const stats = {
    total: reviews.length,
    average: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || parseInt(r.score) || 0), 0) / reviews.length
      : currentRating || 0,
    distribution: {
      5: reviews.filter(r => (r.rating || parseInt(r.score) || 0) === 5).length,
      4: reviews.filter(r => (r.rating || parseInt(r.score) || 0) === 4).length,
      3: reviews.filter(r => (r.rating || parseInt(r.score) || 0) === 3).length,
      2: reviews.filter(r => (r.rating || parseInt(r.score) || 0) === 2).length,
      1: reviews.filter(r => (r.rating || parseInt(r.score) || 0) === 1).length,
    },
    withPhotos: reviews.filter(r => r.images && r.images.length > 0).length,
  };

  // Filtrer les avis
  const filteredReviews = reviews.filter(review => {
    const rating = review.rating || parseInt(review.score) || 0;
    
    if (filter === 'all') return true;
    if (filter === 'withPhotos') return review.images && review.images.length > 0;
    return rating === parseInt(filter);
  });

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-[#424242]">Tous les avis</h2>
                <p className="text-xs text-gray-600">{stats.total} avis au total</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : stats.total === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-4">⭐</p>
                  <p className="text-lg mb-2">Aucun avis pour le moment</p>
                  <p className="text-sm">Soyez le premier à laisser un avis !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Statistiques et filtres */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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

                    {/* Répartition des notes */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-[#424242] mb-1.5">Répartition</h4>
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = stats.distribution[rating as keyof typeof stats.distribution];
                          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-1.5">
                              <span className="text-[10px] w-5">{rating} ⭐</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#4CAF50] transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-600 w-5 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filtres */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-[#424242] mb-1.5">Filtrer</h4>
                      <div className="space-y-1">
                        <button
                          onClick={() => setFilter('all')}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] transition-colors ${
                            filter === 'all'
                              ? 'bg-[#4CAF50] text-white'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          Tous ({stats.total})
                        </button>
                        <button
                          onClick={() => setFilter('withPhotos')}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] transition-colors ${
                            filter === 'withPhotos'
                              ? 'bg-[#4CAF50] text-white'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          Avec photos ({stats.withPhotos})
                        </button>
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = stats.distribution[rating as keyof typeof stats.distribution];
                          if (count === 0) return null;
                          return (
                            <button
                              key={rating}
                              onClick={() => setFilter(rating.toString() as any)}
                              className={`w-full text-left px-2 py-1 rounded text-[10px] transition-colors ${
                                filter === rating.toString()
                                  ? 'bg-[#4CAF50] text-white'
                                  : 'bg-white hover:bg-gray-100'
                              }`}
                            >
                              {rating} ⭐ ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Liste des avis */}
                  <div className="space-y-2">
                    {filteredReviews.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-xs">Aucun avis ne correspond à ce filtre.</p>
                      </div>
                    ) : (
                      filteredReviews.map((review) => {
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
                              <div className="grid grid-cols-3 gap-1.5 mt-2">
                                {review.images.map((img, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
                                    <Image
                                      src={img}
                                      alt={`Photo avis ${idx + 1}`}
                                      fill
                                      className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                      sizes="(max-width: 640px) 33vw, 20vw"
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
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

