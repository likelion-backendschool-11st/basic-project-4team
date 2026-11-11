import React from 'react';
import { Icon } from '../common/Icon';

interface GuideQnaProps {
  readonly title: string;
  readonly items: readonly { readonly q: string; readonly a: string }[];
}

/** Collapsible Q&A list (native details/summary). */
export const GuideQna: React.FC<GuideQnaProps> = ({ title, items }) => (
  <div className="bg-canvas p-space-md rounded shadow-sm">
    <h3 className="font-ui-label text-ui-label text-ink mb-space-xs flex items-center gap-1">
      <Icon className="text-primary-container text-[18px]" name="live_help" />
      {title}
    </h3>
    <div className="flex flex-col gap-space-xs font-caption text-caption text-body">
      {items.map((item) => (
        <details className="cursor-pointer" key={item.q}>
          <summary className="hover:text-ink font-bold text-ink py-1">{item.q}</summary>
          <p className="pl-2 pt-1 text-muted leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  </div>
);

export default GuideQna;
