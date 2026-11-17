import React from 'react';
import { ConditionSelector } from './ConditionSelector';
import { SelectField } from './SelectField';
import { TextField } from './TextField';
import {
  attributesCopy,
  editConditionDisabled,
  editConditionVisible,
  gradeOptions,
  gradingServiceOptions,
  languageOptions,
  rarityOptions,
  type FormVariant,
  type ItemCondition,
  type ListingAttributes,
  type SelectOption,
} from '../../data/listingForm';

interface AttributeFieldsProps {
  readonly variant: FormVariant;
  readonly value: ListingAttributes;
  readonly onChange: <K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => void;
  /** 공식 품목을 골랐는지. 품목 속성(세트명 등)은 품목에서 채우므로 고르기 전에는 안내만 보여준다. */
  readonly hasItem?: boolean;
  /** Edit mode: 카드 품목 속성(세트명 등) 줄을 보여줄지. 카드가 아닌 판매글은 상태만 보여준다. */
  readonly showItemAttributes?: boolean;
  /** Edit mode: conditions shown / locked (defaults: sealed + graded, sealed locked). */
  readonly conditionVisible?: readonly ItemCondition[];
  readonly conditionDisabled?: readonly ItemCondition[];
}

/** 품목 코드값(ko, SAR …) → 화면 라벨. 선택지에 없으면 코드값을 그대로 보여준다. */
const toOptionLabel = (options: readonly SelectOption[], value: string, short = false): string => {
  const option = options.find((o) => o.value === value);
  if (!option) return value;
  return short ? (option.shortLabel ?? option.label) : option.label;
};

/**
 * Card-category attribute inputs (REQ-POST-006).
 * 세트명·카드 번호·언어·희귀도는 선택한 품목(items) 값으로 채우는 읽기 전용,
 * 상태와 그레이딩 업체·등급은 판매자가 고른다.
 */
export const AttributeFields: React.FC<AttributeFieldsProps> = ({
  variant,
  value,
  onChange,
  hasItem = true,
  showItemAttributes = true,
  conditionVisible = editConditionVisible,
  conditionDisabled = editConditionDisabled,
}) => {
  const isGraded = value.condition === 'graded';
  const onConditionChange = (next: ItemCondition) => onChange('condition', next);

  if (variant === 'create') {
    const c = attributesCopy.create;
    // 품목을 고른 뒤 값이 비어 있으면 '-'로 보여준다 (품목 DB에 없는 정보).
    const show = (text: string) => (hasItem ? text || attributesCopy.emptyValue : '');
    return (
      <div className="bg-canvas-soft p-space-md rounded flex flex-col gap-space-md">
        <div className="flex flex-col gap-space-sm">
          <span className="font-caption text-caption text-muted">{hasItem ? c.itemLocked : c.itemPending}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <TextField label={c.setName} placeholder={attributesCopy.setNamePlaceholder} readOnly value={show(value.setName)} />
            <TextField label={c.cardNo} placeholder={attributesCopy.cardNoPlaceholder} readOnly value={show(value.cardNo)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <TextField label={c.language} readOnly value={show(toOptionLabel(languageOptions, value.language))} />
            <TextField label={c.rarity} readOnly value={show(toOptionLabel(rarityOptions, value.rarity))} />
          </div>
        </div>
        <div className="flex flex-col gap-space-xs">
          <span className="font-caption text-caption text-body">{c.condition}</span>
          <ConditionSelector onChange={onConditionChange} value={value.condition} variant="create" />
          {isGraded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-xs bg-canvas p-space-sm rounded">
              <SelectField
                label={c.gradingService}
                onChange={(v) => onChange('gradingService', v)}
                options={gradingServiceOptions}
                placeholder={attributesCopy.selectPlaceholder}
                tone="soft"
                value={value.gradingService}
              />
              <SelectField
                emphasize
                label={c.grade}
                onChange={(v) => onChange('grade', v)}
                options={gradeOptions}
                placeholder={attributesCopy.selectPlaceholder}
                tone="soft"
                value={value.grade}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  const e = attributesCopy.edit;
  const showEdit = (text: string) => text || attributesCopy.emptyValue;
  return (
    // data-component="ImmutableAttributesForm"
    <div className="pt-space-md border-t border-hairline bg-canvas-soft/60 p-space-md rounded">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-space-sm">
        <span className="font-eyebrow text-eyebrow text-primary">{e.title}</span>
        <span className="font-caption text-caption text-muted">{e.hint}</span>
      </div>
      {/* 품목 속성은 수정할 수 없다 (REQ-EDIT-002). */}
      {showItemAttributes && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mb-space-sm pb-space-sm border-b border-hairline">
          <TextField label={e.setName} readOnly tone="compact" value={showEdit(value.setName)} />
          <TextField label={e.cardNo} readOnly tone="compact" value={showEdit(value.cardNo)} />
          <TextField label={e.language} readOnly tone="compact" value={showEdit(toOptionLabel(languageOptions, value.language, true))} />
          <TextField label={e.rarity} readOnly tone="compact" value={showEdit(toOptionLabel(rarityOptions, value.rarity, true))} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <div>
          <span className="block font-micro text-micro text-muted mb-1">{e.condition}</span>
          <ConditionSelector
            disabledValues={conditionDisabled}
            onChange={onConditionChange}
            value={value.condition}
            variant="edit"
            visible={conditionVisible}
          />
        </div>
        <div>
          <span className="block font-micro text-micro text-muted mb-1">{e.grading}</span>
          <div className="flex items-center gap-space-xs">
            <SelectField
              className="w-1/2"
              disabled={!isGraded}
              onChange={(v) => onChange('gradingService', v)}
              options={gradingServiceOptions}
              placeholder={attributesCopy.selectPlaceholder}
              tone="compact"
              useShortLabel
              value={value.gradingService}
            />
            <SelectField
              className="w-1/2"
              disabled={!isGraded}
              emphasize
              onChange={(v) => onChange('grade', v)}
              options={gradeOptions}
              placeholder={attributesCopy.selectPlaceholder}
              tone="compact"
              useShortLabel
              value={value.grade}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeFields;
