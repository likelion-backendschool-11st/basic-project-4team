import React from 'react';
import { Icon } from '../common/Icon';

interface LoginOptionsRowProps {
  readonly rememberLabel: string;
  readonly secureLabel: string;
  readonly remember: boolean;
  readonly onRememberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginOptionsRow: React.FC<LoginOptionsRowProps> = ({ rememberLabel, secureLabel, remember, onRememberChange }) => (
  <div className="flex items-center justify-between pt-1">
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        checked={remember}
        className="w-4 h-4 rounded border-hairline-strong text-primary-container focus:ring-0 cursor-pointer"
        id="rememberId"
        onChange={onRememberChange}
        type="checkbox"
      />
      <span className="text-sm text-body">{rememberLabel}</span>
    </label>
    <span className="font-caption text-caption font-normal text-muted flex items-center gap-1">
      <Icon className="text-[14px] text-primary-container" filled name="gpp_maybe" />
      {secureLabel}
    </span>
  </div>
);

export default LoginOptionsRow;
