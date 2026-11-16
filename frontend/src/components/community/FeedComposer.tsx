import React, { useRef } from 'react';
import { feedComposer } from '../../data/community';
import { useFeedComposer, type FeedComposerPayload } from '../../hooks/community/useFeedComposer';
import { Icon } from '../common/Icon';
import { ComposerItemTagPicker } from './ComposerItemTagPicker';
import { ComposerPhotoStrip } from './ComposerPhotoStrip';
import { ComposerPollEditor } from './ComposerPollEditor';
import { ComposerSelect } from './ComposerSelect';

export interface FeedComposerProps {
  readonly board: string;
  readonly tag: string;
  readonly onBoardChange: (value: string) => void;
  readonly onTagChange: (value: string) => void;
  /** 글 등록. 성공하면 true → 입력을 비운다. */
  readonly onSubmit: (payload: FeedComposerPayload) => Promise<boolean>;
  /** 사진 업로드·등록 전에 호출. false면 막는다 (비로그인). */
  readonly ensureLogin: () => boolean;
}

const toolClass = (active: boolean) =>
  `p-space-xs rounded-lg transition-colors flex items-center gap-1 font-caption text-caption ${
    active ? 'bg-mint-100 text-forest' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
  }`;

/** 커뮤니티 피드 글쓰기 — 본문 + 사진(최대 4장)·투표·시세 태그. 모두 서버에 저장된다. */
export const FeedComposer: React.FC<FeedComposerProps> = ({ board, tag, onBoardChange, onTagChange, onSubmit, ensureLogin }) => {
  const c = useFeedComposer(onSubmit, ensureLogin);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleTool = (key: 'photo' | 'poll' | 'tag') => {
    if (key === 'photo') {
      if (ensureLogin()) fileInput.current?.click();
      return;
    }
    if (key === 'poll') c.togglePoll();
    else c.toggleTag();
  };

  const toolActive = { photo: c.images.length > 0, poll: c.pollOpen, tag: c.tagOpen || c.taggedItem !== null };

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
            maxLength={feedComposer.bodyMax}
            onChange={(e) => c.setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) c.submit();
            }}
            placeholder={feedComposer.placeholder}
            rows={2}
            value={c.text}
          />
          {c.images.length > 0 && <ComposerPhotoStrip images={c.images} onRemove={c.removeImage} />}
          {c.pollOpen && (
            <ComposerPollEditor
              durationDays={c.pollDays}
              onAddOption={c.addPollOption}
              onDurationChange={c.setPollDays}
              onOptionChange={c.setPollOption}
              onRemoveOption={c.removePollOption}
              onRemovePoll={c.togglePoll}
              options={c.pollOptions}
            />
          )}
          {(c.tagOpen || c.taggedItem) && (
            <ComposerItemTagPicker
              onClear={c.clearItem}
              onQueryChange={c.setTagQuery}
              onSelect={c.selectItem}
              query={c.tagQuery}
              results={c.searchResults}
              selected={c.taggedItem}
              status={c.searchStatus}
            />
          )}
          {c.error && (
            <p className="mt-space-xs font-caption text-caption text-error" role="alert">
              {c.error}
            </p>
          )}
          <input
            accept={feedComposer.photo.accept}
            className="hidden"
            multiple
            onChange={(e) => {
              c.addFiles(Array.from(e.target.files ?? []));
              // 같은 파일을 다시 고를 수 있게 비운다.
              e.target.value = '';
            }}
            ref={fileInput}
            type="file"
          />
          <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs mt-space-xs border-t border-hairline/60">
            <div className="flex items-center gap-space-xxs">
              {feedComposer.tools.map((tool) => (
                <button
                  aria-pressed={toolActive[tool.key]}
                  className={toolClass(toolActive[tool.key])}
                  disabled={tool.key === 'photo' && c.images.length >= feedComposer.photo.max}
                  key={tool.key}
                  onClick={() => handleTool(tool.key)}
                  title={tool.title}
                  type="button"
                >
                  <Icon className="text-[18px] text-primary" name={tool.icon} />
                  <span className="hidden sm:inline">{tool.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="font-micro text-micro text-muted">
                {c.text.length}/{feedComposer.bodyMax}
              </span>
              <button
                className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-ui-label text-ui-label font-bold hover:bg-primary transition-colors flex items-center gap-1 shadow-sm disabled:opacity-60"
                disabled={!c.canSubmit}
                onClick={c.submit}
                type="button"
              >
                <Icon className="text-[16px]" name={feedComposer.submitIcon} />
                <span>
                  {c.uploading ? feedComposer.photo.uploading : c.submitting ? feedComposer.submitting : feedComposer.submitLabel}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedComposer;
