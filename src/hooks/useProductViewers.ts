import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hook pour tracker les viewers actifs d'un produit en temps réel
 */
export function useProductViewers(productId: string | undefined) {
  const [viewersCount, setViewersCount] = useState(0);
  const sessionIdRef = useRef<string>(`${Date.now()}-${Math.random()}`);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef(false);
  const endpointExistsRef = useRef<boolean | null>(null); // null = pas encore vérifié, true = existe, false = n'existe pas

  // Fonction pour générer un ID de session unique
  const getSessionId = () => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `${Date.now()}-${Math.random()}`;
    }
    return sessionIdRef.current;
  };

  // Enregistrer qu'on regarde le produit
  const startTracking = useCallback(async () => {
    if (!productId || isTrackingRef.current) return;
    
    // Si on sait que l'endpoint n'existe pas, ne pas faire de requête
    if (endpointExistsRef.current === false) return;

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
        endpointExistsRef.current = true;
      } else if (response.status === 404) {
        // Endpoint n'existe pas encore, désactiver toutes les futures requêtes
        endpointExistsRef.current = false;
        // Arrêter les intervalles
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        if (fetchIntervalRef.current) {
          clearInterval(fetchIntervalRef.current);
          fetchIntervalRef.current = null;
        }
        return;
      }
    } catch (error) {
      // Ne pas logger les erreurs pour éviter le spam dans la console
      // console.error('Erreur démarrage tracking viewers:', error);
    }
  }, [productId]);

  // Arrêter le tracking
  const stopTracking = useCallback(async () => {
    if (!productId || !isTrackingRef.current) return;

    try {
      const sessionId = getSessionId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/products/${productId}/viewers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (response.status === 404) {
        // Endpoint n'existe pas encore, ne pas logger d'erreur
        return;
      }
    } catch (error) {
      // Ne pas logger les erreurs pour éviter le spam dans la console
      // console.error('Erreur arrêt tracking viewers:', error);
    } finally {
      isTrackingRef.current = false;
    }
  }, [productId]);

  // Récupérer le nombre de viewers
  const fetchViewersCount = useCallback(async () => {
    if (!productId) return;
    
    // Si on sait que l'endpoint n'existe pas, ne pas faire de requête
    if (endpointExistsRef.current === false) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/products/${productId}/viewers`);
      if (response.ok) {
        const data = await response.json();
        setViewersCount(data.viewersCount || 0);
        endpointExistsRef.current = true;
      } else if (response.status === 404) {
        // Endpoint n'existe pas encore, désactiver toutes les futures requêtes
        endpointExistsRef.current = false;
        // Arrêter les intervalles
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        if (fetchIntervalRef.current) {
          clearInterval(fetchIntervalRef.current);
          fetchIntervalRef.current = null;
        }
        return;
      }
    } catch (error) {
      // Ne pas logger les erreurs pour éviter le spam dans la console
      // console.error('Erreur récupération viewers:', error);
    }
  }, [productId]);

  // Démarrer le tracking quand le composant monte
  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    // Démarrer le tracking
    startTracking().then(() => {
      if (!mounted) return;

      // Envoyer un heartbeat toutes les 15 secondes pour rester actif
      heartbeatIntervalRef.current = setInterval(() => {
        if (mounted && endpointExistsRef.current !== false) {
          startTracking(); // Ré-enregistrer pour rester actif
        } else if (mounted && endpointExistsRef.current === false) {
          // Arrêter l'intervalle si l'endpoint n'existe pas
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
        }
      }, 15000);

      // Mettre à jour le compteur toutes les 5 secondes
      fetchIntervalRef.current = setInterval(() => {
        if (mounted && endpointExistsRef.current !== false) {
          fetchViewersCount();
        } else if (mounted && endpointExistsRef.current === false) {
          // Arrêter l'intervalle si l'endpoint n'existe pas
          if (fetchIntervalRef.current) {
            clearInterval(fetchIntervalRef.current);
            fetchIntervalRef.current = null;
          }
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
  }, [productId, startTracking, stopTracking, fetchViewersCount]);

  return { viewersCount };
}

