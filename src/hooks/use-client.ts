import { useEffect, useState } from 'react';

/**
 * Hook to detect if the code is running on the client side
 * @returns {boolean} true if running on client, false if on server
 */
export function useClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
