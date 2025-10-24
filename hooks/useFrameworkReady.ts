import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    try {
      window.frameworkReady?.();
    } catch {
      // safe no-op en cas d'environnement non-browser
    }
  }, []); // <- exécute une seule fois au montage
}
