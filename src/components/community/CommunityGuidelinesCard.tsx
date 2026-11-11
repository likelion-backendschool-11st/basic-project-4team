import React from 'react';
import { Link } from 'react-router-dom';
import { guidelines } from '../../data/community';
import { Icon } from '../common/Icon';

export interface CommunityGuidelinesCardProps {
  readonly className?: string;
}

/** RE:PICK 클린 토론 원칙 card. */
export const CommunityGuidelinesCard: React.FC<CommunityGuidelinesCardProps> = ({ className = '' }) => (
  /* data-component="CleanCommunityGuidelines" */
  <section className={`bg-surface-container-low rounded-lg p-space-md shadow-sm ${className}`}>
    <div className="flex items-center gap-space-xs text-on-surface font-ui-label text-ui-label mb-space-xs">
      <Icon className="text-forest text-[18px]" name={guidelines.icon} />
      <span>{guidelines.title}</span>
    </div>
    <p className="font-body-sm text-body-sm text-muted mb-space-sm">{guidelines.description}</p>
    <ul className="flex flex-col gap-1.5 font-caption text-caption text-on-surface-variant mb-space-md">
      {guidelines.rules.map((rule) => (
        <li className="flex items-start gap-1.5" key={rule}>
          <Icon className="text-primary text-[14px] shrink-0 mt-0.5" name="check" />
          <span>{rule}</span>
        </li>
      ))}
    </ul>
    <div className="bg-surface-container-lowest p-space-xs rounded font-micro text-micro text-muted flex items-center justify-between gap-space-xs">
      <span>{guidelines.footnote}</span>
      <Link className="text-link underline hover:text-primary shrink-0" to={guidelines.linkTo}>
        {guidelines.linkLabel}
      </Link>
    </div>
  </section>
);

export default CommunityGuidelinesCard;
