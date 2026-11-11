import React from 'react';
import { feedComposer } from '../../data/community';
import { useComposer } from '../../hooks/community/useComposer';
import { Icon } from '../common/Icon';
import { ComposerSelect } from './ComposerSelect';

export interface FeedComposerProps {
  readonly board: string;
  readonly tag: string;
  readonly onBoardChange: (value: string) => void;
  readonly onTagChange: (value: string) => void;
  readonly onSubmit: (text: string) => void;
}

/** Quick post box at the top of the community feed. */
export const FeedComposer: React.FC<FeedComposerProps> = ({ board, tag, onBoardChange, onTagChange, onSubmit }) => {
  const { text, setText, canSubmit, submit } = useComposer(onSubmit);

  return (
    /* data-component="QuickPostBox" */
    <div className="bg-canvas rounded-lg p-space-md shadow-sm mb-space-xs border border-hairline/60">
      <div className="flex flex-wrap items-center justify-between gap-space-xs pb-space-xs mb-space-xs border-b border-hairline">
        <div className="flex items-center gap-space-xs flex-wrap">
          <ComposerSelect
            ariaLabel="토론방 선택"
            icon={feedComposer.boardIcon}
            onChange={onBoardChange}
            options={feedComposer.boardOptions}
            value={board}
          />
          <ComposerSelect
            ariaLabel="글 유형 선택"
            icon={feedComposer.tagIcon}
            onChange={onTagChange}
            options={feedComposer.tagOptions}
            tone="tag"
            value={tag}
          />
        </div>
        <div className="items-center gap-1 text-muted font-micro text-micro hidden sm:flex">
          <Icon className="text-[13px] text-primary" name={feedComposer.verifiedIcon} />
          <span>{feedComposer.verifiedNotice}</span>
        </div>
      </div>
      <div className="flex items-start gap-space-sm">
        <div className="w-9 h-9 rounded-full bg-forest text-on-primary flex items-center justify-center font-bold text-ui-sm shrink-0 mt-0.5">
          <span>{feedComposer.avatarLabel}</span>
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            aria-label={feedComposer.placeholder}
            className="w-full bg-transparent border-0 outline-none resize-none font-body-md text-body-md text-on-surface placeholder:text-muted focus:ring-0 leading-relaxed p-0"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder={feedComposer.placeholder}
            rows={2}
            value={text}
          />
          <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs mt-space-xxs border-t border-hairline/60">
            <div className="flex items-center gap-space-xxs">
              {feedComposer.tools.map((tool) => (
                <button
                  className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1 font-caption text-caption"
                  key={tool.key}
                  title={tool.title}
                  type="button"
                >
                  <Icon className="text-[18px] text-primary" name={tool.icon} />
                  <span className="hidden sm:inline">{tool.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-ui-label text-ui-label font-bold hover:bg-primary transition-colors flex items-center gap-1 shadow-sm disabled:opacity-60"
                disabled={!canSubmit}
                onClick={submit}
                type="button"
              >
                <Icon className="text-[16px]" name={feedComposer.submitIcon} />
                <span>{feedComposer.submitLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedComposer;
