import React from 'react';
import type { CommunityAuthor } from '../../data/community';
import { avatarToneClass } from './tones';

export interface AuthorAvatarProps {
  readonly author: CommunityAuthor;
  /** `feed` uses ui-sm initials (P-017), `discussion` uses caption initials (P-018). */
  readonly variant?: 'feed' | 'discussion';
}

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ author, variant = 'feed' }) => (
  <div
    aria-hidden="true"
    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 ${
      variant === 'feed' ? 'text-ui-sm' : 'text-caption'
    } ${avatarToneClass[author.tone]}`}
  >
    <span>{author.initials}</span>
  </div>
);

export default AuthorAvatar;
