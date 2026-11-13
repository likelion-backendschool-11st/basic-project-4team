import React from 'react';
import { Link } from 'react-router-dom';
import type { CommentReply } from '../../api/types';
import { commentCopy } from '../../data/comment';
import { loginRequiredCopy } from '../../data/itemcommunity';
import { ROUTES } from '../../data/layout';
import type { useComments } from '../../hooks/comment/useComments';
import { useReport } from '../../hooks/comment/useReport';
import { useLoginGate } from '../../hooks/itemcommunity/useLoginGate';
import { LoginRequiredModal } from '../itemcommunity/LoginRequiredModal';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { ReportModal } from './ReportModal';

export interface CommentSectionProps {
  /** useComments()가 돌려준 상태·동작. */
  readonly state: ReturnType<typeof useComments>;
  /** 로그인 상태면 입력창·답글 버튼을, 아니면 로그인 안내를 보여준다. 비로그인으로 좋아요·신고를 누르면 로그인 팝업. */
  readonly canWrite: boolean;
}

const textButton = 'font-ui-sm text-ui-sm text-primary hover:underline';

/** 토론글 카드 아래로 펼쳐지는 댓글 목록 + 답글 + 좋아요 + 신고 + 입력창 (피드·품목 토론방 공용). */
export const CommentSection: React.FC<CommentSectionProps> = ({ state, canWrite }) => {
  const loginGate = useLoginGate();
  const report = useReport();

  const handleToggleLike = (comment: CommentReply) => {
    if (loginGate.ensureLogin()) state.toggleLike(comment);
  };

  const handleMenuSelect = (comment: CommentReply, key: string) => {
    if (key === 'delete' && window.confirm(commentCopy.deleteConfirm)) state.remove(comment.id);
    if (key === 'report' && loginGate.ensureLogin()) report.open('comment', comment.id);
  };

  return (
    /* data-component="CommentSection" */
    <section className="mt-space-sm pt-space-sm border-t border-hairline flex flex-col gap-space-xs">
      {state.comments.length === 0 && state.loading && (
        <p className="py-space-sm text-center font-body-sm text-body-sm text-muted">{commentCopy.loading}</p>
      )}
      {state.loadError && (
        <p className="py-space-sm text-center font-body-sm text-body-sm text-error">
          {commentCopy.loadError}{' '}
          <button className={textButton} onClick={state.retry} type="button">
            {commentCopy.retry}
          </button>
        </p>
      )}
      {!state.loading && !state.loadError && state.comments.length === 0 && (
        <p className="py-space-sm text-center font-body-sm text-body-sm text-muted">{commentCopy.empty}</p>
      )}

      <ul className="flex flex-col">
        {state.comments.map((comment) => {
          const hiddenReplies = comment.replyCount - comment.replies.length;
          const replyingHere = state.replyingTo === comment.id;
          return (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                onMenuSelect={handleMenuSelect}
                onToggleLike={handleToggleLike}
                onReply={canWrite && !comment.isDeleted ? () => state.setReplyingTo(comment.id) : undefined}
              />
              {(comment.replies.length > 0 || hiddenReplies > 0 || replyingHere) && (
                <div className="ml-space-xl pl-space-sm border-l-2 border-hairline">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      comment={reply}
                      key={reply.id}
                      onMenuSelect={handleMenuSelect}
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                  {hiddenReplies > 0 && (
                    <button className={`${textButton} py-1`} onClick={() => state.loadReplies(comment)} type="button">
                      {commentCopy.moreReplies(hiddenReplies)}
                    </button>
                  )}
                  {replyingHere && comment.author && (
                    <div className="py-space-xs">
                      <CommentForm
                        autoFocus
                        onCancel={() => state.setReplyingTo(null)}
                        onSubmit={(body) => state.submit(body, comment.id)}
                        placeholder={commentCopy.replyPlaceholder(comment.author.nickname)}
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {state.hasMore && (
        <button className={`${textButton} self-center py-space-xs`} disabled={state.loading} onClick={state.loadMore} type="button">
          {state.loading ? commentCopy.loading : commentCopy.moreComments}
        </button>
      )}
      {state.actionError && <p className="font-body-sm text-body-sm text-error">{state.actionError}</p>}
      {report.notice && (
        <p className="font-body-sm text-body-sm text-primary" role="status">
          {report.notice}
        </p>
      )}

      {canWrite ? (
        <CommentForm onSubmit={(body) => state.submit(body)} placeholder={commentCopy.placeholder} />
      ) : (
        <p className="py-space-xs text-center font-body-sm text-body-sm text-muted">
          {commentCopy.loginPrompt}{' '}
          <Link className={textButton} to={ROUTES.login}>
            {commentCopy.loginLabel}
          </Link>
        </p>
      )}
      <ReportModal state={report} />
      <LoginRequiredModal
        {...loginRequiredCopy}
        onClose={loginGate.close}
        onConfirm={loginGate.goLogin}
        open={loginGate.open}
      />
    </section>
  );
};

export default CommentSection;
