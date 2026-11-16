import React from 'react';
import { toAssetUrl } from '../../api/client';
import { Icon } from '../common/Icon';

interface MyThumbnailProps {
  readonly url: string | null;
  readonly alt: string;
  /** 거래완료·삭제된 글은 흐리게. */
  readonly dimmed?: boolean;
}

/** 목록 행 왼쪽 정사각 썸네일. 사진이 없으면 아이콘. */
export const MyThumbnail: React.FC<MyThumbnailProps> = ({ url, alt, dimmed = false }) => (
  <span className="w-20 h-20 rounded bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center">
    {url ? (
      <img alt={alt} className={`w-full h-full object-cover ${dimmed ? 'opacity-50' : ''}`} loading="lazy" src={toAssetUrl(url)} />
    ) : (
      <Icon className="text-[28px] text-outline" name="image" />
    )}
  </span>
);

export default MyThumbnail;
