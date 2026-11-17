import React from 'react';
import { Icon } from '../common/Icon';

interface ItemRequestPromptProps {
  readonly text: string;
  readonly label: string;
  readonly onRequest: () => void;
  readonly className?: string;
}

/** 4번 검색 결과 아래 "찾는 품목이 없나요? [품목 등록 요청]" 한 줄 (REQ-POST-005). */
export const ItemRequestPrompt: React.FC<ItemRequestPromptProps> = ({ text, label, onRequest, className = '' }) => (
  <div className={`flex items-center justify-between gap-space-xs flex-wrap ${className}`}>
    <span className="font-caption text-caption text-muted">{text}</span>
    <button
      className="inline-flex items-center gap-1 font-ui-sm text-ui-sm text-primary hover:text-forest hover:underline"
      onClick={onRequest}
      type="button"
    >
      <Icon className="text-[16px]" name="edit_note" />
      {label}
    </button>
  </div>
);

export default ItemRequestPrompt;
