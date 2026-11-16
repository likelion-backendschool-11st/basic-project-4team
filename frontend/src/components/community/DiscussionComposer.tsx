import React, { useRef } from 'react';
import { discussionComposer as copy, feedComposer } from '../../data/community';
import { useDiscussionComposer, type DiscussionComposerPayload } from '../../hooks/community/useDiscussionComposer';
import { Icon } from '../common/Icon';
import { ComposerPhotoStrip } from './ComposerPhotoStrip';

export interface DiscussionComposerProps {
  /** 글 등록. 성공하면 true → 입력을 비운다. */
  readonly onSubmit: (payload: DiscussionComposerPayload) => Promise<boolean>;
  /** 사진 업로드·등록 전에 호출. false면 막는다 (비로그인 팝업). */
  readonly ensureLogin: () => boolean;
  /** 이 품목의 최근 체결가. 희망 체결가 입력 때 비교용. 거래 이력이 없으면 null. */
  readonly marketPrice: number | null;
}

const toolClass = (active: boolean) =>
  `p-1 rounded flex items-center gap-1 text-caption font-caption transition-colors ${
    active ? 'bg-mint-100 text-forest' : 'hover:bg-surface-container hover:text-on-surface'
  }`;

/** 품목 토론방 글쓰기 — 본문(500자) + 사진(최대 4장) + 희망 체결가. 모두 서버에 저장된다. */
export const DiscussionComposer: React.FC<DiscussionComposerProps> = ({ onSubmit, ensureLogin, marketPrice }) => {
  const c = useDiscussionComposer(onSubmit, ensureLogin);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!c.canSubmit) {
      inputRef.current?.focus();
      return;
    }
    await c.submit();
  };

  return (
    /* data-component="QuickPostBox" */
    <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
      <div className="flex gap-space-sm items-start">
        <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-forest font-bold shrink-0">
          <Icon className="text-[20px]" name={copy.avatarIcon} />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            aria-label={copy.placeholder}
            className="w-full p-space-sm bg-surface-container-low border-0 rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-muted focus:outline-none focus:ring-0 resize-none"
            maxLength={copy.maxLength}
            onChange={(e) => c.setText(e.target.value)}
            placeholder={copy.placeholder}
            ref={inputRef}
            rows={3}
            value={c.text}
          />
          {c.images.length > 0 && <ComposerPhotoStrip images={c.images} onRemove={c.removeImage} />}
          {c.priceOpen && (
            <div className="mt-space-xs p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xxs">
              <div className="flex items-center gap-space-xs">
                <label className="flex-1 flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-canvas border border-hairline focus-within:border-primary">
                  <Icon className="text-[16px] text-forest" name={copy.priceIcon} />
                  <span className="sr-only">{copy.priceInputLabel}</span>
                  <input
                    autoFocus
                    className="flex-1 min-w-0 bg-transparent border-0 p-0 font-body-sm text-body-sm text-on-surface text-right focus:outline-none focus:ring-0"
                    inputMode="numeric"
                    onChange={(e) => c.setPriceInput(e.target.value)}
                    placeholder={copy.pricePlaceholder}
                    value={c.priceInput}
                  />
                  <span className="font-body-sm text-body-sm text-muted">원</span>
                </label>
                <button
                  aria-label={copy.priceRemove}
                  className="p-1 rounded text-muted hover:text-error"
                  onClick={c.togglePrice}
                  type="button"
                >
                  <Icon className="text-[18px]" name="close" />
                </button>
              </div>
              <span className="font-caption text-caption text-muted">{copy.priceReference(marketPrice, c.price)}</span>
            </div>
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
          <div className="flex flex-wrap items-center justify-between gap-space-xs mt-space-xs px-1">
            <div className="flex items-center gap-space-xs text-muted">
              <button
                aria-pressed={c.images.length > 0}
                className={toolClass(c.images.length > 0)}
                disabled={c.photosFull}
                onClick={() => {
                  if (ensureLogin()) fileInput.current?.click();
                }}
                title={copy.photoTitle}
                type="button"
              >
                <Icon className="text-[18px]" name={copy.photoIcon} />
                <span>{copy.photoLabel(c.images.length, feedComposer.photo.max)}</span>
              </button>
              <button
                aria-pressed={c.priceOpen}
                className={toolClass(c.priceOpen)}
                onClick={c.togglePrice}
                title={copy.priceTitle}
                type="button"
              >
                <Icon className="text-[18px]" name={copy.priceIcon} />
                <span>{copy.priceLabel}</span>
              </button>
            </div>
            <div className="flex items-center gap-space-sm ml-auto">
              <span className="font-micro text-micro text-muted">{copy.counter(c.length, copy.maxLength)}</span>
              <button
                className="px-space-md py-space-xs bg-primary-container text-on-primary font-ui-label text-ui-label rounded-lg hover:bg-primary shadow-sm transition-all disabled:opacity-60"
                disabled={c.uploading || c.submitting}
                onClick={handleSubmit}
                type="button"
              >
                {c.uploading ? copy.uploading : c.submitting ? copy.submitting : copy.submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscussionComposer;
