import React from 'react';
import { COMMENT_BODY_MAX, commentCopy } from '../../data/comment';
import { useCommentForm } from '../../hooks/comment/useCommentForm';

export interface CommentFormProps {
  readonly placeholder: string;
  /** 등록. 성공하면 true를 돌려줘야 입력창이 비워진다. */
  readonly onSubmit: (body: string) => Promise<boolean>;
  /** 있으면 취소 버튼을 보여준다 (답글 입력창). */
  readonly onCancel?: () => void;
  readonly autoFocus?: boolean;
}

/** 댓글·답글 입력창. */
export const CommentForm: React.FC<CommentFormProps> = ({ placeholder, onSubmit, onCancel, autoFocus = false }) => {
  const form = useCommentForm(onSubmit, COMMENT_BODY_MAX);

  return (
    <form className="flex flex-col gap-space-xs" onSubmit={form.handleSubmit}>
      <textarea
        aria-label={placeholder}
        autoFocus={autoFocus}
        className="w-full p-space-sm bg-surface-container-low border-0 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        onChange={(e) => form.setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        value={form.text}
      />
      <div className="flex items-center justify-end gap-space-xs">
        <span className="font-micro text-micro text-muted mr-auto">
          {form.text.length}/{COMMENT_BODY_MAX}
        </span>
        {onCancel && (
          <button
            className="px-space-sm py-1 rounded-lg font-ui-sm text-ui-sm text-on-surface-variant hover:bg-surface-container"
            onClick={onCancel}
            type="button"
          >
            {commentCopy.cancelLabel}
          </button>
        )}
        <button
          className="px-space-md py-1 rounded-lg bg-primary-container text-on-primary font-ui-sm text-ui-sm font-bold hover:bg-primary disabled:opacity-60"
          disabled={!form.canSubmit}
          type="submit"
        >
          {commentCopy.submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
