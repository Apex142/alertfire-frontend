import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Récupérer depuis le localStorage
      const item = window.localStorage.getItem(key);
      // Parser la valeur stockée ou retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // En cas d'erreur, retourner initialValue
      console.warn(`Erreur lors de la lecture de ${key} depuis localStorage:`, error);
      return initialValue;
    }
  });

  // Retourner une version wrapped de useState qui persiste la nouvelle valeur dans localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à value d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Sauvegarder l'état
      setStoredValue(valueToStore);

      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de ${key} dans localStorage:`, error);
    }
  };

  // Écouter les changements dans d'autres onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}

// Exemple d'utilisation:
/*
interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
}

const [preferences, setPreferences] = useLocalStorage<UserPreferences>('userPreferences', {
  theme: 'light',
  language: 'fr'
});

// Mise à jour
setPreferences(prev => ({
  ...prev,
  theme: 'dark'
}));
*/ 