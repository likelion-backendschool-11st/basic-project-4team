import React from 'react';
import { Link } from 'react-router-dom';
import { noticeBar } from '../../data/layout';

interface NoticeBarProps {
  readonly data?: typeof noticeBar;
}

export const NoticeBar: React.FC<NoticeBarProps> = ({ data = noticeBar }) => (
  <div className="bg-forest text-on-primary font-caption text-caption border-b border-hairline">
    <div className="max-w-7xl mx-auto px-gutter-desktop h-9 flex items-center justify-between">
      <div className="flex items-center gap-space-xs overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="bg-lime-ribbon text-forest font-eyebrow text-eyebrow px-1.5 py-0.5 rounded">{data.badge}</span>
        <span>{data.text}</span>
      </div>
      <div className="hidden md:flex items-center gap-space-md shrink-0">
        {data.links.map((l, i) => (
          <React.Fragment key={l.label}>
            {i > 0 && <span className="text-faint">·</span>}
            <Link className="text-on-primary hover:text-lime-ribbon transition-colors" to={l.to}>
              {l.label}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export default NoticeBar;
