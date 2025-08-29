import useSWR from 'swr';
import type { User } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUsers() {
  const { data, error, isLoading } = useSWR<User[]>(
    'https://jsonplaceholder.typicode.com/users',
    fetcher
  );

  return {
    users: data,
    isLoading,
    isError: error,
  };
}
