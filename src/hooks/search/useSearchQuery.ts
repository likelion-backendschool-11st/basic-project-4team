import { useSearchParams } from 'react-router-dom';
import { searchDefaults } from '../../data/search';

/** Reads the `q` query-string parameter, falling back to the design's default keyword. */
export const useSearchQuery = (): string => {
  const [params] = useSearchParams();
  const q = params.get('q')?.trim();
  return q && q.length > 0 ? q : searchDefaults.query;
};
