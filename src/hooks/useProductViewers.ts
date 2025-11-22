import { useEffect, useState, useRef } from 'react';

/**
 * Hook pour tracker les viewers actifs d'un produit en temps réel
 */
export function useProductViewers(productId: string | undefined) {
  const [viewersCount, setViewersCount] = useState(0);
  const sessionIdRef = useRef<string>(`${Date.now()}-${Math.random()}`);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef(false);

  // Fonction pour générer un ID de session unique
  const getSessionId = () => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `${Date.now()}-${Math.random()}`;
    }
    return sessionIdRef.current;
  };

  // Enregistrer qu'on regarde le produit
  const startTracking = async () => {
    if (!productId || isTrackingRef.current) return;

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/products/${productId}/viewers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setViewersCount(data.viewersCount || 0);
        isTrackingRef.current = true;
      }
    } catch (error) {
      console.error('Erreur démarrage tracking viewers:', error);
    }
  };

  // Arrêter le tracking
  const stopTracking = async () => {
    if (!productId || !isTrackingRef.current) return;

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      await fetch(`${apiUrl}/products/${productId}/viewers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Erreur arrêt tracking viewers:', error);
    } finally {
      isTrackingRef.current = false;
    }
  };

  // Récupérer le nombre de viewers
  const fetchViewersCount = async () => {
    if (!productId) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/products/${productId}/viewers`);
      if (response.ok) {
        const data = await response.json();
        setViewersCount(data.viewersCount || 0);
      }
    } catch (error) {
      console.error('Erreur récupération viewers:', error);
    }
  };

  // Démarrer le tracking quand le composant monte
  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    // Démarrer le tracking
    startTracking().then(() => {
      if (!mounted) return;

      // Envoyer un heartbeat toutes les 15 secondes pour rester actif
      heartbeatIntervalRef.current = setInterval(() => {
        if (mounted) {
          startTracking(); // Ré-enregistrer pour rester actif
        }
      }, 15000);

      // Mettre à jour le compteur toutes les 5 secondes
      fetchIntervalRef.current = setInterval(() => {
        if (mounted) {
          fetchViewersCount();
        }
      }, 5000);
    });

    // Nettoyage à la destruction du composant
    return () => {
      mounted = false;
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
      stopTracking();
    };
  }, [productId]);

  return { viewersCount };
}

