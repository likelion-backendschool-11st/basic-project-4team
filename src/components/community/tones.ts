import type { AvatarTone, BadgeTone, ReactionTone } from '../../data/community';

/** Theme-token class maps for data-driven tones (keeps colors out of the data layer). */
export const avatarToneClass: Readonly<Record<AvatarTone, string>> = {
  rose: 'bg-tertiary-fixed text-tertiary',
  neutral: 'bg-surface-container text-on-surface',
  forest: 'bg-forest text-on-primary',
  soft: 'bg-surface-container-highest text-on-surface-variant',
  secondary: 'bg-secondary text-on-secondary',
  primary: 'bg-primary text-on-primary',
};

export const badgeToneClass: Readonly<Record<BadgeTone, string>> = {
  lime: 'bg-lime-panel text-forest',
  neutral: 'bg-surface-container text-muted',
  mint: 'bg-mint-100 text-forest',
};

/** Discussion badges use on-secondary-container text for the lime "거래 인증" chip. */
export const discussionBadgeToneClass: Readonly<Record<BadgeTone, string>> = {
  lime: 'bg-lime-panel text-on-secondary-container',
  neutral: 'text-muted',
  mint: 'bg-mint-100 text-forest',
};

export const reactionToneClass: Readonly<Record<ReactionTone, string>> = {
  tertiary: 'text-tertiary hover:bg-tertiary-fixed',
  neutral: 'text-on-surface-variant hover:bg-surface-container',
  info: 'text-info hover:bg-surface-container',
};
