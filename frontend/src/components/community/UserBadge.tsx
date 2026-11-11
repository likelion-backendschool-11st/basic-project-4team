import React from 'react';
import type { CommunityBadge } from '../../data/community';
import { Icon } from '../common/Icon';
import { badgeToneClass, discussionBadgeToneClass } from './tones';

export interface UserBadgeProps {
  readonly badge: CommunityBadge;
  readonly variant?: 'feed' | 'discussion';
}

/** Small author badge (프로컬렉터 / 보유자 / 거래 인증 …). */
export const UserBadge: React.FC<UserBadgeProps> = ({ badge, variant = 'feed' }) => {
  if (variant === 'feed') {
    return (
      <span className={`px-space-xxs py-0.5 rounded font-caption text-caption ${badge.tone === 'neutral' ? '' : 'font-bold'} ${badgeToneClass[badge.tone]}`}>
        {badge.label}
      </span>
    );
  }
  if (badge.tone === 'neutral') {
    return <span className="font-micro text-micro text-muted">{badge.label}</span>;
  }
  return (
    <span className={`font-micro text-micro px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 ${discussionBadgeToneClass[badge.tone]}`}>
      {badge.icon && <Icon className="text-[12px]" name={badge.icon} />}
      {badge.label}
    </span>
  );
};

export default UserBadge;
