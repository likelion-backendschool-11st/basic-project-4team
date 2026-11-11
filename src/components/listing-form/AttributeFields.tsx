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
  type ListingAttributes,
} from '../../data/listingForm';

interface AttributeFieldsProps {
  readonly variant: FormVariant;
  readonly value: ListingAttributes;
  readonly onChange: <K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => void;
}

/** Card-category attribute inputs (set, number, language, rarity, condition, grading). */
export const AttributeFields: React.FC<AttributeFieldsProps> = ({ variant, value, onChange }) => {
  const isGraded = value.condition === 'graded';

  if (variant === 'create') {
    const c = attributesCopy.create;
    return (
      <div className="bg-canvas-soft p-space-md rounded flex flex-col gap-space-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <TextField label={c.setName} onChange={(v) => onChange('setName', v)} placeholder={attributesCopy.setNamePlaceholder} value={value.setName} />
          <TextField label={c.cardNo} onChange={(v) => onChange('cardNo', v)} placeholder={attributesCopy.cardNoPlaceholder} value={value.cardNo} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <SelectField label={c.language} onChange={(v) => onChange('language', v)} options={languageOptions} tone="white" value={value.language} />
          <SelectField label={c.rarity} onChange={(v) => onChange('rarity', v)} options={rarityOptions} tone="white" value={value.rarity} />
        </div>
        <div className="flex flex-col gap-space-xs">
          <span className="font-caption text-caption text-body">{c.condition}</span>
          <ConditionSelector onChange={(v) => onChange('condition', v)} value={value.condition} variant="create" />
          {isGraded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-xs bg-canvas p-space-sm rounded">
              <SelectField
                label={c.gradingService}
                onChange={(v) => onChange('gradingService', v)}
                options={gradingServiceOptions}
                tone="soft"
                value={value.gradingService}
              />
              <SelectField emphasize label={c.grade} onChange={(v) => onChange('grade', v)} options={gradeOptions} tone="soft" value={value.grade} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const e = attributesCopy.edit;
  return (
    // data-component="ImmutableAttributesForm"
    <div className="pt-space-md border-t border-hairline bg-canvas-soft/60 p-space-md rounded">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-space-sm">
        <span className="font-eyebrow text-eyebrow text-primary">{e.title}</span>
        <span className="font-caption text-caption text-muted">{e.hint}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
        <TextField label={e.setName} onChange={(v) => onChange('setName', v)} tone="compact" value={value.setName} />
        <TextField label={e.cardNo} onChange={(v) => onChange('cardNo', v)} tone="compact" value={value.cardNo} />
        <SelectField label={e.language} onChange={(v) => onChange('language', v)} options={languageOptions} tone="compact" useShortLabel value={value.language} />
        <SelectField label={e.rarity} onChange={(v) => onChange('rarity', v)} options={rarityOptions} tone="compact" useShortLabel value={value.rarity} />
      </div>
      <div className="mt-space-sm pt-space-sm border-t border-hairline grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <div>
          <span className="block font-micro text-micro text-muted mb-1">{e.condition}</span>
          <ConditionSelector
            disabledValues={editConditionDisabled}
            onChange={(v) => onChange('condition', v)}
            value={value.condition}
            variant="edit"
            visible={editConditionVisible}
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
