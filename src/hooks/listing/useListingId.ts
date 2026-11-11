import { useParams } from 'react-router-dom';
import { MOCK_LISTING_ID } from '../../data/listing';

/** Reads `:id` from the route, falling back to the mock listing id. */
export const useListingId = (): string => {
  const { id } = useParams<{ id: string }>();
  return id ?? MOCK_LISTING_ID;
};
