import React, { useRef, useState } from 'react';
import { chatCopy as copy } from '../../data/chat';
import { Icon } from '../common/Icon';

interface ChatComposerProps {
  readonly sending: boolean;
  /** 보냈으면 true — 입력창을 비운다. */
  readonly onSendText: (text: string) => Promise<boolean>;
  readonly onSendImage: (file: File) => void;
  /** 빠른 답장 버튼 (대화가 비어 있을 때만). */
  readonly quickReplies: readonly { readonly label: string; readonly message: string }[];
}

/** 채팅 입력창 — Enter 전송, Shift+Enter 줄바꿈, 사진 버튼, 1000자 제한. */
export const ChatComposer: React.FC<ChatComposerProps> = ({ sending, onSendText, onSendImage, quickReplies }) => {
  const [draft, setDraft] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = draft.trim().length > 0 && !sending;

  const submit = async () => {
    if (!canSend) return;
    if (await onSendText(draft)) setDraft('');
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-hairline bg-canvas">
      {quickReplies.length > 0 && (
        <div className="px-space-sm pt-space-sm flex flex-wrap gap-1.5">
          {quickReplies.map((reply) => (
            <button
              className="font-micro text-micro bg-canvas border border-hairline hover:border-primary-container px-2.5 py-1 rounded text-body hover:text-ink"
              key={reply.label}
              onClick={() => {
                setDraft(reply.message);
                inputRef.current?.focus();
              }}
              type="button"
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}
      <form
        className="p-space-sm flex items-end gap-space-xs"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <input
          accept={copy.imageTypes.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onSendImage(file);
          }}
          ref={fileRef}
          type="file"
        />
        <button
          aria-label={copy.photoLabel}
          className="p-2 text-muted hover:text-ink rounded hover:bg-canvas-soft disabled:opacity-40"
          disabled={sending}
          onClick={() => fileRef.current?.click()}
          title={copy.photoLabel}
          type="button"
        >
          <Icon className="text-[20px]" name="add_photo_alternate" />
        </button>
        <div className="flex-1 min-w-0 flex flex-col">
          <textarea
            aria-label={copy.placeholder}
            className="w-full resize-none bg-canvas-soft border border-hairline-strong rounded px-space-sm py-2 font-body-sm text-body-sm text-ink focus:outline-none focus:border-primary-container focus:ring-0 max-h-32"
            maxLength={copy.maxLength}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // 한글 조합 중 Enter는 글자 확정이라 보내지 않는다.
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder={copy.placeholder}
            ref={inputRef}
            rows={draft.includes('\n') ? 3 : 1}
            value={draft}
          />
          {draft.length > copy.maxLength * 0.9 && (
            <span className="self-end font-micro text-micro text-muted">{copy.counter(draft.length, copy.maxLength)}</span>
          )}
        </div>
        <button
          aria-label={copy.sendLabel}
          className="bg-primary-container hover:bg-forest text-on-primary px-3 py-2 rounded transition-colors flex items-center justify-center disabled:opacity-40"
          disabled={!canSend}
          type="submit"
        >
          <Icon className="text-[18px]" name="send" />
        </button>
      </form>
    </div>
  );
};

export default ChatComposer;
