import React from 'react';
import type { SocialProvider } from '../../data/auth';
import { Icon } from '../common/Icon';
import { GoogleLogo } from './GoogleLogo';

interface SocialLoginButtonsProps {
  readonly dividerLabel: string;
  readonly providers: readonly SocialProvider[];
  readonly onSelect: (providerLabel: string) => void;
}

interface ProviderMarkProps {
  readonly id: SocialProvider['id'];
}

const ProviderMark: React.FC<ProviderMarkProps> = ({ id }) => {
  if (id === 'kakao') return <Icon className="text-[16px] mr-1.5" filled name="chat_bubble" />;
  if (id === 'naver') return <span className="font-black text-sm mr-1.5 leading-none">N</span>;
  return <GoogleLogo className="w-4 h-4 mr-1.5" />;
};

/* data-component="SocialAuth" */
export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ dividerLabel, providers, onSelect }) => (
  <div className="mt-8">
    <div className="relative flex py-2 items-center">
      <div className="flex-grow border-t border-hairline" />
      <span className="flex-shrink mx-4 text-xs text-muted uppercase font-medium">{dividerLabel}</span>
      <div className="flex-grow border-t border-hairline" />
    </div>
    <div className="grid grid-cols-3 gap-3 mt-4">
      {providers.map((provider) => (
        <button
          className={`flex items-center justify-center py-2.5 px-3 border rounded text-xs font-semibold transition-opacity hover:opacity-90 ${
            provider.style ? 'border-hairline' : 'border-hairline-strong bg-canvas hover:bg-canvas-soft text-body'
          }`}
          key={provider.id}
          onClick={() => onSelect(provider.label)}
          style={provider.style}
          title={provider.title}
          type="button"
        >
          <ProviderMark id={provider.id} />
          {provider.label}
        </button>
      ))}
    </div>
  </div>
);

export default SocialLoginButtons;
