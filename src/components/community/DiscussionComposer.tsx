import React from 'react';
import { discussionComposer as copy } from '../../data/community';
import { useComposer } from '../../hooks/community/useComposer';
import { Icon } from '../common/Icon';

export interface DiscussionComposerProps {
  readonly onSubmit: (text: string) => void;
}

/** Quick discussion editor with 500-char counter (adds a post to the local list). */
export const DiscussionComposer: React.FC<DiscussionComposerProps> = ({ onSubmit }) => {
  const { text, setText, length, submit } = useComposer(onSubmit, copy.maxLength);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!submit()) inputRef.current?.focus();
  };

  return (
    /* data-component="QuickPostBox" */
    <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
      <div className="flex gap-space-sm items-start">
        <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-forest font-bold shrink-0">
          <Icon className="text-[20px]" name={copy.avatarIcon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative">
            <textarea
              aria-label={copy.placeholder}
              className="w-full p-space-sm bg-surface-container-low border-0 rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-muted focus:outline-none focus:ring-0 resize-none"
              maxLength={copy.maxLength}
              onChange={(e) => setText(e.target.value)}
              placeholder={copy.placeholder}
              ref={inputRef}
              rows={3}
              value={text}
            />
            <div className="flex flex-wrap items-center justify-between gap-space-xs mt-space-xs px-1">
              <div className="flex items-center gap-space-xs text-muted">
                <button className="p-1 rounded hover:bg-surface-container hover:text-on-surface flex items-center gap-1 text-caption font-caption" title={copy.photoTitle} type="button">
                  <Icon className="text-[18px]" name={copy.photoIcon} />
                  <span>{copy.photoLabel(0, copy.maxPhotos)}</span>
                </button>
                <button className="p-1 rounded hover:bg-surface-container hover:text-on-surface flex items-center gap-1 text-caption font-caption" title={copy.priceTitle} type="button">
                  <Icon className="text-[18px]" name={copy.priceIcon} />
                  <span>{copy.priceLabel}</span>
                </button>
              </div>
              <div className="flex items-center gap-space-sm ml-auto">
                <span className="font-micro text-micro text-muted">{copy.counter(length, copy.maxLength)}</span>
                <button
                  className="px-space-md py-space-xs bg-primary-container text-on-primary font-ui-label text-ui-label rounded-lg hover:bg-primary shadow-sm transition-all"
                  onClick={handleSubmit}
                  type="button"
                >
                  {copy.submitLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscussionComposer;
