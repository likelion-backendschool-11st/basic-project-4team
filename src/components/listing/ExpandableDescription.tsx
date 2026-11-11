import React from 'react';
import { Icon } from '../common/Icon';
import type { DescriptionParagraph } from '../../data/listing';
import { useExpandable } from '../../hooks/listing/useExpandable';
import { RichText } from './RichText';

interface ExpandableDescriptionProps {
  readonly paragraphs: readonly DescriptionParagraph[];
  readonly expandLabel: string;
  readonly collapseLabel: string;
  /** buyer: white page + full-width toggle · seller: soft panel + centered pill toggle. */
  readonly variant?: 'buyer' | 'seller';
}

/** Collapsible description body with gradient fade and 더보기/접기 toggle. */
export const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({
  paragraphs,
  expandLabel,
  collapseLabel,
  variant = 'buyer',
}) => {
  const { expanded, toggle } = useExpandable();
  const label = expanded ? collapseLabel : expandLabel;
  const icon = expanded ? 'expand_less' : 'expand_more';

  if (variant === 'seller') {
    return (
      <>
        <div className={`relative overflow-hidden transition-all duration-300 ${expanded ? '' : 'max-h-48'}`}>
          <div className="font-body-md text-body-md text-body leading-relaxed space-y-space-sm">
            <RichText paragraphs={paragraphs} />
          </div>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-canvas-soft to-transparent pointer-events-none" />
          )}
        </div>
        <div className="mt-space-sm flex justify-center">
          <button
            aria-expanded={expanded}
            className="flex items-center gap-1 font-ui-label text-ui-label text-primary-container bg-canvas hover:bg-mint-50 px-space-xl py-2 rounded transition-colors shadow-sm"
            onClick={toggle}
            type="button"
          >
            <span>{label}</span>
            <Icon className="text-[18px]" name={icon} />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="relative mt-space-md font-body-md text-body-md text-body leading-relaxed">
        <div className={`space-y-4 overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[1200px]' : 'max-h-[220px]'}`}>
          <RichText paragraphs={paragraphs} />
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
        )}
      </div>
      <div className="mt-space-sm">
        <button
          aria-expanded={expanded}
          className="w-full py-2 bg-canvas-soft hover:bg-hairline text-ink font-ui-sm text-ui-sm rounded border border-hairline flex items-center justify-center gap-1 transition-colors"
          onClick={toggle}
          type="button"
        >
          <span>{label}</span>
          <Icon className="text-[16px]" name={icon} />
        </button>
      </div>
    </>
  );
};

export default ExpandableDescription;
