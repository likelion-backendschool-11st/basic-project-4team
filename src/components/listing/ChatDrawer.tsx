import React from 'react';
import { Icon } from '../common/Icon';

interface QuickReply {
  readonly label: string;
  readonly message: string;
}

interface ChatDrawerContent {
  readonly responseTime: string;
  readonly onlineTitle: string;
  readonly productTitle: string;
  readonly productPrice: string;
  readonly productThumb: string;
  readonly escrowBadge: string;
  readonly privacyNotice: string;
  readonly welcomeMeta: string;
  readonly welcomeMessage: string;
  readonly quickReplies: readonly QuickReply[];
  readonly placeholder: string;
  readonly photoTitle: string;
  readonly closeLabel: string;
  readonly sendLabel: string;
}

interface ChatDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly sellerInitial: string;
  readonly sellerName: string;
  readonly content: ChatDrawerContent;
  readonly draft: string;
  readonly onDraftChange: (value: string) => void;
  readonly onQuickReply: (message: string) => void;
  readonly onSend: () => void;
}

/** Right slide-in 1:1 chat drawer opened from "1:1 채팅하기". */
export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  open,
  onClose,
  sellerInitial,
  sellerName,
  content,
  draft,
  onDraftChange,
  onQuickReply,
  onSend,
}) => (
  <>
    <div
      aria-hidden="true"
      className={`fixed inset-0 bg-ink/40 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    {/* data-component="ChatDrawer" */}
    <aside
      aria-hidden={!open}
      aria-label={`${sellerName} 1:1 채팅`}
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-canvas shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-hairline ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-space-md border-b border-hairline flex items-center justify-between bg-canvas-soft">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">{sellerInitial}</div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-ui-label text-ui-label text-ink">{sellerName}</span>
              <span className="w-2 h-2 rounded-full bg-primary-container" title={content.onlineTitle} />
            </div>
            <span className="font-micro text-micro text-muted">{content.responseTime}</span>
          </div>
        </div>
        <button aria-label={content.closeLabel} className="p-1 text-muted hover:text-ink rounded hover:bg-canvas" onClick={onClose} type="button">
          <Icon className="text-[20px]" name="close" />
        </button>
      </div>

      <div className="p-space-sm bg-mint-50 border-b border-mint-200 flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs overflow-hidden">
          <div className="w-10 h-10 rounded bg-canvas-soft border border-hairline shrink-0 overflow-hidden">
            <img alt={content.productTitle} className="w-full h-full object-cover" src={content.productThumb} />
          </div>
          <div className="truncate">
            <p className="font-ui-sm text-ui-sm text-ink font-bold truncate">{content.productTitle}</p>
            <p className="font-micro text-micro text-forest font-bold">{content.productPrice}</p>
          </div>
        </div>
        <span className="font-eyebrow text-eyebrow bg-canvas text-forest px-2 py-1 rounded border border-mint-200 shrink-0">
          {content.escrowBadge}
        </span>
      </div>

      <div className="flex-1 p-space-md overflow-y-auto space-y-space-md bg-canvas text-body-sm font-body-sm">
        <div className="text-center">
          <span className="font-micro text-micro text-muted bg-canvas-soft px-2.5 py-1 rounded-full border border-hairline inline-block">
            {content.privacyNotice}
          </span>
        </div>
        <div className="flex flex-col items-start max-w-[85%]">
          <span className="font-micro text-micro text-muted mb-1">{content.welcomeMeta}</span>
          <div className="bg-canvas-soft border border-hairline rounded p-space-sm text-ink leading-relaxed">{content.welcomeMessage}</div>
        </div>
        <div className="pt-space-xs flex flex-wrap gap-1.5">
          {content.quickReplies.map((reply) => (
            <button
              key={reply.label}
              className="font-micro text-micro bg-canvas border border-hairline hover:border-primary-container px-2.5 py-1 rounded text-body hover:text-ink"
              onClick={() => onQuickReply(reply.message)}
              type="button"
            >
              {reply.label}
            </button>
          ))}
        </div>
      </div>

      <form
        className="p-space-sm border-t border-hairline bg-canvas"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <div className="flex items-center gap-space-xs">
          <button className="p-2 text-muted hover:text-ink rounded hover:bg-canvas-soft" title={content.photoTitle} type="button">
            <Icon className="text-[20px]" name="add_photo_alternate" />
          </button>
          <input
            className="flex-1 min-w-0 bg-canvas-soft border border-hairline-strong rounded px-space-sm py-2 font-body-sm text-body-sm text-ink focus:outline-none focus:border-primary-container focus:ring-0"
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder={content.placeholder}
            type="text"
            value={draft}
          />
          <button
            aria-label={content.sendLabel}
            className="bg-primary-container hover:bg-forest text-on-primary font-ui-sm text-ui-sm px-3 py-2 rounded transition-colors flex items-center justify-center"
            type="submit"
          >
            <Icon className="text-[18px]" name="send" />
          </button>
        </div>
      </form>
    </aside>
  </>
);

export default ChatDrawer;
