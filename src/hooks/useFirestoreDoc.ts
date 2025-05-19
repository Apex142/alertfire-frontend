import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
  DocumentData,
  FirestoreDataConverter,
  getDocs,
  query,
  where,
  collection as firestoreCollection
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCacheStore } from '@/stores/cacheStore';

interface UseFirestoreDocOptions<T> {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
  converter?: FirestoreDataConverter<T>;
  prefetch?: {
    related?: {
      collection: string;
      field: string;
      value: any;
    }[];
    fields?: string[];
  };
}

interface UseFirestoreDocResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  prefetchRelated: (collections: string[]) => Promise<void>;
}

// Fonction utilitaire pour précharger des documents liés
async function prefetchRelatedDocs<T>(
  collections: { collection: string; field: string; value: any }[],
  cacheTTL?: number,
  setDocument?: (collection: string, id: string, data: any, ttl?: number) => void
) {
  try {
    const fetchPromises = collections.map(async ({ collection, field, value }) => {
      const q = query(
        firestoreCollection(db, collection),
        where(field, '==', value)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        if (setDocument) {
          setDocument(collection, doc.id, doc.data(), cacheTTL);
        }
      });
    });

    await Promise.all(fetchPromises);
  } catch (error) {
    console.error('Erreur lors du préchargement:', error);
  }
}

export function useFirestoreDoc<T extends DocumentData>(
  collection: string,
  id: string,
  options: UseFirestoreDocOptions<T> = {}
): UseFirestoreDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { getDocument, setDocument, startCleanup, stopCleanup } = useCacheStore();

  // Démarrer le nettoyage du cache au montage
  useEffect(() => {
    if (options.cache) {
      startCleanup();
      return () => stopCleanup();
    }
  }, [options.cache, startCleanup, stopCleanup]);

  // Fonction de préchargement des documents liés
  const prefetchRelated = async (collections: string[]) => {
    if (!data) return;

    const relatedQueries = collections.map(collectionName => ({
      collection: collectionName,
      field: `${collection}Id`,
      value: id
    }));

    await prefetchRelatedDocs(
      relatedQueries,
      options.cacheTTL,
      setDocument
    );
  };

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache si activé
      if (options.cache) {
        const cachedData = getDocument(collection, id);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);

          // Précharger les documents liés en arrière-plan si spécifié
          if (options.prefetch?.related) {
            prefetchRelatedDocs(
              options.prefetch.related,
              options.cacheTTL,
              setDocument
            );
          }
          return;
        }
      }

      // Créer la référence avec le converter si fourni
      const docRef = options.converter
        ? doc(db, collection, id).withConverter(options.converter)
        : doc(db, collection, id);

      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Document ${collection}/${id} non trouvé`);
      }

      const docData = docSnap.data() as T;

      // Mettre en cache si activé
      if (options.cache) {
        setDocument(collection, id, docData, options.cacheTTL);
      }

      setData(docData);
      setError(null);

      // Précharger les documents liés si spécifié
      if (options.prefetch?.related) {
        prefetchRelatedDocs(
          options.prefetch.related,
          options.cacheTTL,
          setDocument
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    if (options.realtime) {
      // Mode temps réel avec onSnapshot
      const docRef = options.converter
        ? doc(db, collection, id).withConverter(options.converter)
        : doc(db, collection, id);

      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (!doc.exists()) {
            setError(new Error(`Document ${collection}/${id} non trouvé`));
            setData(null);
          } else {
            const docData = doc.data() as T;
            setData(docData);
            setError(null);

            // Mettre en cache si activé
            if (options.cache) {
              setDocument(collection, id, docData, options.cacheTTL);
            }

            // Précharger les documents liés si spécifié
            if (options.prefetch?.related) {
              prefetchRelatedDocs(
                options.prefetch.related,
                options.cacheTTL,
                setDocument
              );
            }
          }
          setLoading(false);
        },
        (err) => {
          setError(err);
          setData(null);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Mode one-shot avec getDoc
      fetchDocument();
    }
  }, [collection, id, options.realtime]);

  return {
    data,
    loading,
    error,
    refresh: fetchDocument,
    prefetchRelated,
  };
} 