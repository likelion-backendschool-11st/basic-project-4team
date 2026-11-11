import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListingPhoto } from '../../data/listingForm';

export interface AuthPhotoApi {
  readonly photo: ListingPhoto | null;
  /** True once the seller uploads/replaces the photo in this session (triggers re-review). */
  readonly replaced: boolean;
  readonly setFile: (files: FileList | null) => void;
}

/** Single physical-verification photo with a local object-URL preview. */
export const useAuthPhoto = (
  initial: ListingPhoto | null,
  onChange: (photo: ListingPhoto | null) => void,
): AuthPhotoApi => {
  const [photo, setPhoto] = useState<ListingPhoto | null>(initial);
  const [replaced, setReplaced] = useState(false);
  const blobUrl = useRef<string | null>(null);

  useEffect(() => {
    onChange(photo);
  }, [photo, onChange]);

  useEffect(
    () => () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    },
    [],
  );

  const setFile = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    const src = URL.createObjectURL(file);
    blobUrl.current = src;
    setPhoto({ id: `auth-${Date.now()}`, src, alt: file.name, label: '실물인증' });
    setReplaced(true);
  }, []);

  return { photo, replaced, setFile };
};
