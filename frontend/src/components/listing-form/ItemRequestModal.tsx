import React, { useEffect, useId } from 'react';
import { Icon } from '../common/Icon';
import { SelectField } from './SelectField';
import { ITEM_REQUEST_BODY_MAX, ITEM_REQUEST_TITLE_MAX, itemRequestCopy } from '../../data/listingForm';
import type { ItemRequestApi } from '../../hooks/listing-form/useItemRequest';

interface ItemRequestModalProps {
  /** useItemRequest()가 돌려준 상태·동작. */
  readonly state: ItemRequestApi;
}

const inputClass =
  'w-full bg-canvas-soft border-0 rounded px-space-sm py-2.5 font-body-sm text-body-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary';

/** 관리자에게 보내는 품목 등록 요청 글쓰기 팝업 (카테고리 + 제목 + 본문 + 참고 링크). Esc·바깥 클릭으로 닫힌다. */
export const ItemRequestModal: React.FC<ItemRequestModalProps> = ({ state }) => {
  const { phase, close } = state;
  const titleId = useId();
  const nameId = useId();
  const bodyId = useId();
  const urlId = useId();

  useEffect(() => {
    if (phase === 'closed') return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, close]);

  if (phase === 'closed') return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-space-md" onClick={close}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-lg max-h-full overflow-y-auto bg-canvas rounded-lg shadow-xl p-space-lg flex flex-col gap-space-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {phase === 'done' ? (
          <div className="flex flex-col items-center text-center gap-space-sm">
            <div className="w-12 h-12 rounded-full bg-mint-100 text-forest flex items-center justify-center">
              <Icon className="text-[24px]" name="check_circle" />
            </div>
            <h2 className="font-heading-3 text-heading-3 text-on-surface" id={titleId}>
              {itemRequestCopy.success.title}
            </h2>
            <p className="font-body-sm text-body-sm text-muted">{itemRequestCopy.success.body}</p>
            <button
              autoFocus
              className="w-full mt-space-sm py-space-xs rounded-lg bg-primary font-ui-sm text-ui-sm text-on-primary hover:opacity-90"
              onClick={close}
              type="button"
            >
              {itemRequestCopy.success.confirmLabel}
            </button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-space-sm"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void state.submit();
            }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="font-heading-3 text-heading-3 text-on-surface" id={titleId}>
                {itemRequestCopy.title}
              </h2>
              <p className="font-body-sm text-body-sm text-muted">{itemRequestCopy.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <SelectField
                label={itemRequestCopy.mainLabel}
                onChange={state.setMain}
                options={state.mainOptions}
                value={state.main}
              />
              <SelectField
                label={itemRequestCopy.subLabel}
                onChange={state.setSub}
                options={state.subOptions}
                value={state.sub}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption text-body" htmlFor={nameId}>
                {itemRequestCopy.titleLabel}
              </label>
              <input
                autoFocus
                className={inputClass}
                id={nameId}
                maxLength={ITEM_REQUEST_TITLE_MAX}
                onChange={(e) => state.setTitle(e.target.value)}
                placeholder={itemRequestCopy.titlePlaceholder}
                type="text"
                value={state.title}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption text-body" htmlFor={bodyId}>
                {itemRequestCopy.bodyLabel}
              </label>
              <textarea
                className={`${inputClass} resize-none`}
                id={bodyId}
                maxLength={ITEM_REQUEST_BODY_MAX}
                onChange={(e) => state.setBody(e.target.value)}
                placeholder={itemRequestCopy.bodyPlaceholder}
                rows={6}
                value={state.body}
              />
              <span className="font-micro text-micro text-muted self-end">
                {state.body.length}/{ITEM_REQUEST_BODY_MAX}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption text-body" htmlFor={urlId}>
                {itemRequestCopy.urlLabel}
              </label>
              <input
                className={inputClass}
                id={urlId}
                inputMode="url"
                onChange={(e) => state.setReferenceUrl(e.target.value)}
                placeholder={itemRequestCopy.urlPlaceholder}
                type="url"
                value={state.referenceUrl}
              />
            </div>

            {state.error && (
              <p className="font-body-sm text-body-sm text-error" role="alert">
                {state.error}
              </p>
            )}

            <div className="flex gap-space-xs mt-space-xs">
              <button
                className="flex-1 py-space-xs rounded-lg bg-surface-container-low font-ui-sm text-ui-sm text-on-surface-variant hover:text-on-surface disabled:opacity-50"
                disabled={state.submitting}
                onClick={close}
                type="button"
              >
                {itemRequestCopy.cancelLabel}
              </button>
              <button
                className="flex-1 py-space-xs rounded-lg bg-primary font-ui-sm text-ui-sm text-on-primary hover:opacity-90 disabled:opacity-50"
                disabled={state.submitting}
                type="submit"
              >
                {state.submitting ? itemRequestCopy.submittingLabel : itemRequestCopy.submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ItemRequestModal;
