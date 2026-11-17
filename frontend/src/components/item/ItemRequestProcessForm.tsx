import React, { useId } from 'react';
import type { AdminItemRequest } from '../../api/types';
import { ITEM_LIMITS, adminItemRequestsCopy as copy } from '../../data/item';
import type { ProcessMode } from '../../hooks/item/useAdminItemRequests';
import { useItemRequestProcess, type ItemRequestProcessState } from '../../hooks/item/useItemRequestProcess';
import { SelectField } from '../listing-form/SelectField';
import { TextField } from '../listing-form/TextField';

interface ItemRequestProcessFormProps {
  readonly request: AdminItemRequest;
  readonly mode: ProcessMode;
  /** 카드 카테고리면 세트명·카드번호·언어·희귀도 칸을 보여준다. */
  readonly isCard: boolean;
  readonly onCancel: () => void;
  readonly onProcessed: (message: string) => void;
}

interface SectionProps {
  readonly state: ItemRequestProcessState;
  readonly isCard: boolean;
}

/** ① 새 품목 정보 입력. */
const CreateFields: React.FC<SectionProps> = ({ state, isCard }) => (
  <div className="flex flex-col gap-space-sm">
    <p className="font-caption text-caption text-muted">{copy.createHint}</p>
    <TextField
      label={copy.nameLabel}
      onChange={(v) => state.setField('name', v.slice(0, ITEM_LIMITS.name))}
      value={state.fields.name}
    />
    {isCard && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <TextField
          label={copy.setNameLabel}
          onChange={(v) => state.setField('setName', v.slice(0, ITEM_LIMITS.setName))}
          placeholder={copy.setNamePlaceholder}
          value={state.fields.setName}
        />
        <TextField
          label={copy.cardNoLabel}
          onChange={(v) => state.setField('cardNo', v.slice(0, ITEM_LIMITS.cardNo))}
          placeholder={copy.cardNoPlaceholder}
          value={state.fields.cardNo}
        />
        <SelectField
          label={copy.languageLabel}
          onChange={(v) => state.setField('language', v)}
          options={copy.languageOptions}
          tone="white"
          value={state.fields.language}
        />
        <SelectField
          label={copy.rarityLabel}
          onChange={(v) => state.setField('rarity', v)}
          options={copy.rarityOptions}
          tone="white"
          value={state.fields.rarity}
        />
      </div>
    )}
    <TextField
      label={copy.imageUrlLabel}
      onChange={(v) => state.setField('imageUrl', v.slice(0, ITEM_LIMITS.imageUrl))}
      placeholder={copy.imageUrlPlaceholder}
      value={state.fields.imageUrl}
    />
  </div>
);

/** ② 기존 품목 검색·선택. */
const LinkFields: React.FC<Pick<SectionProps, 'state'>> = ({ state }) => (
  <div className="flex flex-col gap-space-xs">
    <p className="font-caption text-caption text-muted">{copy.linkHint}</p>
    <div className="flex gap-space-xs">
      <input
        className="flex-1 min-w-0 bg-canvas border-0 font-body-sm text-body-sm text-ink px-space-sm py-2 rounded focus:outline-none focus:ring-0 placeholder:text-faint"
        onChange={(e) => state.setLinkQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            state.searchLink();
          }
        }}
        placeholder={copy.linkPlaceholder}
        type="text"
        value={state.linkQuery}
      />
      <button
        className="shrink-0 border border-hairline-strong bg-canvas text-ink font-ui-sm text-ui-sm px-3 rounded hover:bg-canvas-soft disabled:opacity-60"
        disabled={state.linkStatus === 'loading'}
        onClick={state.searchLink}
        type="button"
      >
        {state.linkStatus === 'loading' ? copy.linkSearching : copy.linkSearch}
      </button>
    </div>
    {state.linkStatus === 'error' && <p className="font-caption text-caption text-error">{copy.errors.failed}</p>}
    {state.linkStatus === 'ready' && state.linkResults.length === 0 && (
      <p className="font-caption text-caption text-muted">{copy.linkEmpty}</p>
    )}
    {state.linkResults.length > 0 && (
      <ul className="flex flex-col gap-1">
        {state.linkResults.map((item) => {
          const selected = item.id === state.linkItemId;
          return (
            <li key={item.id}>
              <button
                aria-pressed={selected}
                className={`w-full text-left px-space-sm py-1.5 rounded border transition-colors ${
                  selected ? 'border-primary bg-mint-50' : 'border-hairline bg-canvas hover:bg-canvas-soft'
                }`}
                onClick={() => state.setLinkItemId(item.id)}
                type="button"
              >
                <span className="block font-ui-sm text-ui-sm text-ink truncate">{`#${item.id} ${item.name}`}</span>
                <span className="block font-micro text-micro text-muted truncate">
                  {[item.category.name, item.setName, item.cardNo ? `#${item.cardNo}` : null].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

/** 요청 한 건의 승인(새 품목 등록 / 기존 품목 연결)·반려 폼 (ITEM-09). */
export const ItemRequestProcessForm: React.FC<ItemRequestProcessFormProps> = ({
  request,
  mode,
  isCard,
  onCancel,
  onProcessed,
}) => {
  const state = useItemRequestProcess(request, mode, isCard, onProcessed);
  const reasonId = useId();

  return (
    <div className="mt-space-sm bg-canvas-soft p-space-sm rounded flex flex-col gap-space-sm">
      {mode === 'approve' ? (
        <>
          <div aria-label={copy.modeAria} className="flex gap-1.5" role="group">
            {(['create', 'link'] as const).map((m) => (
              <button
                aria-pressed={state.approveMode === m}
                className={`px-space-sm py-1 rounded-[9999px] font-ui-sm text-ui-sm border transition-colors ${
                  state.approveMode === m
                    ? 'bg-ink text-canvas border-ink'
                    : 'bg-canvas text-body border-hairline-strong hover:bg-canvas-soft'
                }`}
                key={m}
                onClick={() => state.setApproveMode(m)}
                type="button"
              >
                {copy.modes[m]}
              </button>
            ))}
          </div>
          {state.approveMode === 'create' ? <CreateFields isCard={isCard} state={state} /> : <LinkFields state={state} />}
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="font-caption text-caption text-body" htmlFor={reasonId}>
            {copy.rejectLabel}
          </label>
          <textarea
            className="bg-canvas border-0 font-body-sm text-body-sm text-ink px-space-sm py-2 rounded resize-none focus:outline-none focus:ring-0 placeholder:text-faint"
            id={reasonId}
            maxLength={ITEM_LIMITS.rejectReason}
            onChange={(e) => state.setRejectReason(e.target.value)}
            placeholder={copy.rejectPlaceholder}
            rows={3}
            value={state.rejectReason}
          />
        </div>
      )}

      {state.error && (
        <div className="flex flex-wrap items-center gap-space-xs" role="alert">
          <p className="font-caption text-caption text-error">
            {state.conflict ? copy.conflict(state.conflict.name) : state.error}
          </p>
          {state.conflict && (
            <button
              className="font-caption text-caption text-link font-bold hover:underline disabled:opacity-60"
              disabled={state.submitting}
              onClick={state.approveWithConflict}
              type="button"
            >
              {copy.linkConflict}
            </button>
          )}
        </div>
      )}

      <div className="flex justify-end gap-space-xs">
        <button
          className="font-ui-sm text-ui-sm text-muted px-3 py-1.5 rounded hover:bg-canvas transition-colors"
          disabled={state.submitting}
          onClick={onCancel}
          type="button"
        >
          {copy.cancel}
        </button>
        <button
          className={`font-ui-sm text-ui-sm px-3 py-1.5 rounded transition-colors disabled:opacity-60 ${
            mode === 'approve'
              ? 'bg-primary-container text-on-primary hover:bg-forest'
              : 'bg-ink text-canvas hover:opacity-90'
          }`}
          disabled={state.submitting}
          onClick={state.submit}
          type="button"
        >
          {state.submitting ? copy.submitting : mode === 'approve' ? copy.submitApprove : copy.submitReject}
        </button>
      </div>
    </div>
  );
};

export default ItemRequestProcessForm;
