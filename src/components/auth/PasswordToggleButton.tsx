import React from 'react';
import { Icon } from '../common/Icon';

interface PasswordToggleButtonProps {
  readonly visible: boolean;
  readonly label: string;
  readonly onToggle: () => void;
}

export const PasswordToggleButton: React.FC<PasswordToggleButtonProps> = ({ visible, label, onToggle }) => (
  <button
    aria-label={label}
    aria-pressed={visible}
    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-ink focus:outline-none"
    onClick={onToggle}
    type="button"
  >
    <Icon className="text-[20px]" name={visible ? 'visibility_off' : 'visibility'} />
  </button>
);

export default PasswordToggleButton;
