'use client';

import { create } from 'zustand';

interface CacheData {
  [collectionName: string]: {
    [documentId: string]: {
      data: any;
      timestamp: number;
      expiresAt?: number;
      lastAccessed?: number;
      accessCount: number;
    };
  };
}

interface CacheConfig {
  maxSize?: number;        // Taille maximale du cache (nombre d'éléments)
  defaultTTL?: number;     // TTL par défaut en ms
  cleanupInterval?: number; // Intervalle de nettoyage en ms
}

interface CacheStore {
  cache: CacheData;
  config: CacheConfig;
  cleanupIntervalId: number | null;
  setDocument: (collection: string, id: string, data: any, ttl?: number) => void;
  getDocument: (collection: string, id: string) => any | null;
  isExpired: (collection: string, id: string) => boolean;
  clearCollection: (collection: string) => void;
  clearCache: () => void;
  prefetchDocuments: (collection: string, ids: string[], ttl?: number) => Promise<void>;
  invalidateDocument: (collection: string, id: string) => void;
  invalidateCollection: (collection: string, filter?: (id: string, data: any) => boolean) => void;
  setConfig: (config: Partial<CacheConfig>) => void;
  startCleanup: () => void;
  stopCleanup: () => void;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
};

export const useCacheStore = create<CacheStore>((set, get) => ({
  cache: {},
  config: DEFAULT_CONFIG,
  cleanupIntervalId: null,

  startCleanup: () => {
    // Arrêter l'ancien intervalle s'il existe
    const currentId = get().cleanupIntervalId;
    if (currentId) {
      clearInterval(currentId);
    }

    // Démarrer un nouvel intervalle
    const intervalId = window.setInterval(() => {
      const state = get();
      const now = Date.now();
      let hasChanges = false;
      const newCache = { ...state.cache };

      Object.keys(newCache).forEach(collection => {
        Object.keys(newCache[collection]).forEach(id => {
          const doc = newCache[collection][id];
          if (
            (doc.expiresAt && now > doc.expiresAt) ||
            (doc.lastAccessed && now - doc.lastAccessed > state.config.defaultTTL!)
          ) {
            delete newCache[collection][id];
            hasChanges = true;
          }
        });

        if (Object.keys(newCache[collection]).length === 0) {
          delete newCache[collection];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        set({ cache: newCache });
      }
    }, get().config.cleanupInterval);

    set({ cleanupIntervalId: intervalId });
  },

  stopCleanup: () => {
    const currentId = get().cleanupIntervalId;
    if (currentId) {
      clearInterval(currentId);
      set({ cleanupIntervalId: null });
    }
  },

  setDocument: (collection: string, id: string, data: any, ttl?: number) => {
    set((state) => {
      const newCache = { ...state.cache };
      if (!newCache[collection]) {
        newCache[collection] = {};
      }

      newCache[collection][id] = {
        data,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        expiresAt: ttl ? Date.now() + ttl : Date.now() + state.config.defaultTTL!,
      };

      const totalItems = Object.values(newCache)
        .reduce((sum, col) => sum + Object.keys(col).length, 0);

      if (totalItems > state.config.maxSize!) {
        let itemsToRemove = totalItems - state.config.maxSize!;
        const items = Object.entries(newCache)
          .flatMap(([col, docs]) =>
            Object.entries(docs).map(([docId, doc]) => ({
              collection: col,
              id: docId,
              lastAccessed: doc.lastAccessed,
              accessCount: doc.accessCount,
            }))
          )
          .sort((a, b) =>
            (a.accessCount / (Date.now() - a.lastAccessed!)) -
            (b.accessCount / (Date.now() - b.lastAccessed!))
          );

        while (itemsToRemove > 0 && items.length > 0) {
          const item = items.shift()!;
          delete newCache[item.collection][item.id];
          itemsToRemove--;
        }
      }

      return { cache: newCache };
    });
  },

  getDocument: (collection: string, id: string) => {
    const state = get();
    const doc = state.cache[collection]?.[id];

    if (!doc || state.isExpired(collection, id)) {
      return null;
    }

    set(state => {
      const newCache = { ...state.cache };
      if (newCache[collection]?.[id]) {
        newCache[collection][id] = {
          ...newCache[collection][id],
          lastAccessed: Date.now(),
          accessCount: (newCache[collection][id].accessCount || 0) + 1,
        };
      }
      return { cache: newCache };
    });

    return doc.data;
  },

  isExpired: (collection: string, id: string) => {
    const state = get();
    const doc = state.cache[collection]?.[id];
    if (!doc) return true;
    if (doc.expiresAt && Date.now() > doc.expiresAt) return true;
    return false;
  },

  clearCollection: (collection: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[collection];
      return { cache: newCache };
    });
  },

  clearCache: () => {
    set({ cache: {} });
  },

  prefetchDocuments: async (collection: string, ids: string[], ttl?: number) => {
    // Cette fonction sera implémentée par le hook useFirestoreDoc
    // Elle permettra de précharger plusieurs documents en une seule fois
    // Pour l'instant, c'est un placeholder
  },

  invalidateDocument: (collection: string, id: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      if (newCache[collection]?.[id]) {
        delete newCache[collection][id];
      }
      return { cache: newCache };
    });
  },

  invalidateCollection: (collection: string, filter?: (id: string, data: any) => boolean) => {
    set((state) => {
      const newCache = { ...state.cache };
      if (!newCache[collection]) return state;

      if (filter) {
        Object.entries(newCache[collection]).forEach(([id, doc]) => {
          if (filter(id, doc.data)) {
            delete newCache[collection][id];
          }
        });
      } else {
        delete newCache[collection];
      }

      return { cache: newCache };
    });
  },

  setConfig: (config: Partial<CacheConfig>) => {
    set((state) => ({
      config: { ...state.config, ...config }
    }));
  }
})); 