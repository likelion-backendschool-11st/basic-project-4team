import React from 'react';
import { discussionEditCopy as copy, type DiscussionEditSource } from '../../data/community';
import { useDiscussionComposer, type DiscussionComposerPayload } from '../../hooks/community/useDiscussionComposer';
import { DiscussionPostForm } from './DiscussionPostForm';

export interface DiscussionPostEditorProps {
  /** 원래 값 — 본문·사진·희망 체결가로 폼을 채운다. */
  readonly source: DiscussionEditSource;
  /** 저장. 성공하면 true → 수정 모드를 닫는다(카드에서). */
  readonly onSave: (payload: DiscussionComposerPayload) => Promise<boolean>;
  readonly onCancel: () => void;
  readonly ensureLogin: () => boolean;
  readonly marketPrice: number | null;
}

/** 토론방 글 수정 폼 (카드 안). 품목은 바꿀 수 없다 (REQ-BEDIT-001). */
export const DiscussionPostEditor: React.FC<DiscussionPostEditorProps> = ({ source, onSave, onCancel, ensureLogin, marketPrice }) => {
  const state = useDiscussionComposer(onSave, ensureLogin, source);
  return (
    <div className="mb-space-md">
      <DiscussionPostForm
        autoFocus
        cancelLabel={copy.cancelLabel}
        ensureLogin={ensureLogin}
        marketPrice={marketPrice}
        onCancel={onCancel}
        state={state}
        submitLabel={copy.submitLabel}
        submittingLabel={copy.submitting}
      />
    </div>
  );
};

export default DiscussionPostEditor;
