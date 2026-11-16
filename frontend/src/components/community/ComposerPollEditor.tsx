import React from 'react';
import { feedComposer } from '../../data/community';
import { Icon } from '../common/Icon';

export interface ComposerPollEditorProps {
  readonly options: readonly string[];
  readonly durationDays: number;
  readonly onOptionChange: (index: number, value: string) => void;
  readonly onAddOption: () => void;
  readonly onRemoveOption: (index: number) => void;
  readonly onDurationChange: (days: number) => void;
  readonly onRemovePoll: () => void;
}

const copy = feedComposer.poll;

/** 글쓰기 투표 입력 — 선택지 2~4개, 투표 기간(1·3·7일). */
export const ComposerPollEditor: React.FC<ComposerPollEditorProps> = ({
  options,
  durationDays,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onDurationChange,
  onRemovePoll,
}) => (
  <div className="mt-space-xs p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 font-ui-label text-ui-label text-on-surface">
        <Icon className="text-[16px] text-primary" name="poll" />
        {copy.title}
      </span>
      <button className="font-caption text-caption text-muted hover:text-error" onClick={onRemovePoll} type="button">
        {copy.removePoll}
      </button>
    </div>
    {options.map((value, i) => (
      // 선택지는 순서로만 구분돼 index를 key로 쓴다.
      <div className="flex items-center gap-space-xs" key={i}>
        <input
          aria-label={copy.optionPlaceholder(i + 1)}
          className="flex-1 min-w-0 px-space-sm py-space-xs rounded-lg bg-canvas border border-hairline font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-0"
          maxLength={copy.optionMax}
          onChange={(e) => onOptionChange(i, e.target.value)}
          placeholder={copy.optionPlaceholder(i + 1)}
          value={value}
        />
        {options.length > copy.minOptions && (
          <button
            aria-label={copy.removeOption}
            className="p-1 rounded text-muted hover:text-error"
            onClick={() => onRemoveOption(i)}
            type="button"
          >
            <Icon className="text-[18px]" name="close" />
          </button>
        )}
      </div>
    ))}
    <div className="flex items-center justify-between gap-space-xs">
      {options.length < copy.maxOptions ? (
        <button
          className="flex items-center gap-1 font-caption text-caption text-primary hover:underline"
          onClick={onAddOption}
          type="button"
        >
          <Icon className="text-[16px]" name="add" />
          {copy.addOption}
        </button>
      ) : (
        <span />
      )}
      <label className="flex items-center gap-1 font-caption text-caption text-muted">
        {copy.durationLabel}
        <select
          className="bg-canvas border border-hairline rounded py-0 pl-space-xs pr-7 font-caption text-caption text-on-surface focus:ring-0"
          onChange={(e) => onDurationChange(Number(e.target.value))}
          value={String(durationDays)}
        >
          {copy.durations.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  </div>
);

export default ComposerPollEditor;
