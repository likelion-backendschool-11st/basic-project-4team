import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';

interface ListingLoadStateProps {
  readonly icon: string;
  readonly title: string;
  readonly body?: string;
  readonly linkLabel?: string;
  readonly linkTo?: string;
}

/** 판매글 상세의 로딩·없음·오류 안내 화면. */
export const ListingLoadState: React.FC<ListingLoadStateProps> = ({ icon, title, body, linkLabel, linkTo }) => (
  <div className="flex flex-col items-center justify-center gap-space-sm w-full min-h-[60vh] bg-canvas px-gutter text-center">
    <Icon className="text-[40px] text-muted" name={icon} />
    <h1 className="font-heading-3 text-heading-3 text-ink">{title}</h1>
    {body && <p className="font-body-sm text-body-sm text-muted">{body}</p>}
    {linkLabel && linkTo && (
      <Link className="text-link font-ui-sm text-ui-sm hover:underline" to={linkTo}>
        {linkLabel}
      </Link>
    )}
  </div>
);

export default ListingLoadState;
