import { useEffect } from 'react';
import { useClient } from './use-client';
/**
 * Hook to safely execute code only on client side
 * @param callback Function to execute on client side
 * @param deps Dependencies array for useEffect
 */
export function useClientEffect(
  callback: () => void,
  deps: React.DependencyList = []
) {
  const isClient = useClient();

  useEffect(() => {
    if (isClient) {
      callback();
    }
  }, [isClient, callback, ...deps]);
}
