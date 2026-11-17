import React from 'react';
import { AttributeFields } from './AttributeFields';
import { ConditionSelector } from './ConditionSelector';
import { SectionCard } from './SectionCard';
import { Icon } from '../common/Icon';
import { CARD_MAIN_CATEGORY, attributesCopy, type ListingAttributes } from '../../data/listingForm';

interface AttributesSectionProps {
  readonly step: number;
  /** 선택한 대분류 code. 카드(`cards`)일 때만 카드 필수 속성을 입력받는다 (REQ-POST-003). */
  readonly mainCategory: string;
  readonly hasItem: boolean;
  readonly value: ListingAttributes;
  readonly onChange: <K extends keyof ListingAttributes>(key: K, value: ListingAttributes[K]) => void;
  /** 필수 속성 검증 에러 (REQ-POST-010). */
  readonly error?: string;
}

/** Create section 5 — category-specific required attributes. */
export const AttributesSection: React.FC<AttributesSectionProps> = ({ step, mainCategory, hasItem, value, onChange, error }) => {
  const c = attributesCopy.create;
  const isCard = mainCategory === CARD_MAIN_CATEGORY;
  return (
    // data-component="CategoryAttributesForm"
    <SectionCard
      inlineHint={
        <span className="bg-mint-100 text-forest font-micro text-micro px-2 py-0.5 rounded">
          {isCard ? c.badge : c.otherBadge}
        </span>
      }
      right={<span className="font-caption text-caption text-muted">{isCard ? c.hint : c.otherHint}</span>}
      step={step}
      title={c.title}
      variant="create"
    >
      {isCard ? (
        <AttributeFields hasItem={hasItem} onChange={onChange} value={value} variant="create" />
      ) : (
        // 운동화·명품 속성(REQ-POST-007·008)은 미구현. API가 모든 판매글에 condition을 요구하므로 상태만 받는다.
        <div className="bg-canvas-soft p-space-md rounded flex flex-col gap-space-sm">
          <p className="flex items-start gap-1.5 font-caption text-caption text-muted">
            <Icon className="text-[16px] shrink-0" name="info" />
            {c.otherNotice}
          </p>
          <span className="font-caption text-caption text-body">{c.otherCondition}</span>
          <ConditionSelector onChange={(v) => onChange('condition', v)} value={value.condition} variant="create" />
        </div>
      )}
      {error && (
        <p className="flex items-center gap-1 font-caption text-caption text-error" role="alert">
          <Icon className="text-[16px]" name="error" />
          {error}
        </p>
      )}
    </SectionCard>
  );
};

export default AttributesSection;
