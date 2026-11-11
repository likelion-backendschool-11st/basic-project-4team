import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { MAX_PHOTOS, type ListingPhoto } from '../../data/listingForm';

let uploadSeq = 0;

const toPhoto = (file: File, index: number): ListingPhoto => {
  uploadSeq += 1;
  return {
    id: `upload-${Date.now()}-${uploadSeq}`,
    src: URL.createObjectURL(file),
    alt: file.name,
    label: `사진 ${index + 1}`,
    caption: file.name.length > 12 ? `${file.name.slice(0, 10)}…` : file.name,
  };
};

const isBlob = (src: string): boolean => src.startsWith('blob:');

export interface PhotoDragHandlers {
  readonly draggable: true;
  readonly onDragStart: () => void;
  readonly onDragOver: (e: React.DragEvent) => void;
  readonly onDrop: () => void;
}

export interface PhotoUploadsApi {
  readonly photos: readonly ListingPhoto[];
  readonly remaining: number;
  readonly addFiles: (files: FileList | null) => void;
  readonly remove: (id: string) => void;
  readonly move: (fromIndex: number, toIndex: number) => void;
  readonly dragHandlers: (index: number) => PhotoDragHandlers;
}

/**
 * Photo list state with local object-URL previews, removal and drag reordering.
 * `onChange` mirrors the list into the parent form state.
 */
export const usePhotoUploads = (
  initial: readonly ListingPhoto[],
  onChange: (photos: readonly ListingPhoto[]) => void,
): PhotoUploadsApi => {
  const [photos, setPhotos] = useState<readonly ListingPhoto[]>(initial);
  const dragIndex = useRef<number | null>(null);
  const latest = useRef(photos);
  latest.current = photos;

  useEffect(() => {
    onChange(photos);
  }, [photos, onChange]);

  // Revoke any object URLs still alive on unmount.
  useEffect(
    () => () => {
      latest.current.forEach((p) => {
        if (isBlob(p.src)) URL.revokeObjectURL(p.src);
      });
    },
    [],
  );

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setPhotos((prev) => {
      const room = Math.max(MAX_PHOTOS - prev.length, 0);
      return [...prev, ...list.slice(0, room).map((f, i) => toPhoto(f, prev.length + i))];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && isBlob(target.src)) URL.revokeObjectURL(target.src);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const move = useCallback((from: number, to: number) => {
    setPhotos((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const dragHandlers = useCallback(
    (index: number): PhotoDragHandlers => ({
      draggable: true,
      onDragStart: () => {
        dragIndex.current = index;
      },
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDrop: () => {
        if (dragIndex.current !== null) move(dragIndex.current, index);
        dragIndex.current = null;
      },
    }),
    [move],
  );

  return { photos, remaining: MAX_PHOTOS - photos.length, addFiles, remove, move, dragHandlers };
};
