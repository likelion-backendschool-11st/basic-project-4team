import React from 'react';
import { Link } from 'react-router-dom';

interface AuthSecondaryActionProps {
  readonly label: string;
  /** 있으면 링크, 없으면 버튼. */
  readonly to?: string;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}

const CLASS_NAME =
  'w-full bg-canvas hover:bg-canvas-soft text-ink font-bold py-3.5 px-4 rounded text-base border border-hairline-strong transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container disabled:opacity-60 disabled:cursor-not-allowed';

/** 취소·다시 받기 같은 보조 버튼. SubmitButton과 같은 크기의 외곽선 버튼. */
export const AuthSecondaryAction: React.FC<AuthSecondaryActionProps> = ({ label, to, onClick, disabled = false }) =>
  to ? (
    <Link className={CLASS_NAME} to={to}>
      {label}
    </Link>
  ) : (
    <button className={CLASS_NAME} disabled={disabled} onClick={onClick} type="button">
      {label}
    </button>
  );

export default AuthSecondaryAction;
