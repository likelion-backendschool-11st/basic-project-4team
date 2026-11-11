import React from 'react';
import { feedCopy, type FeedPost } from '../../data/community';
import { FeedPoll } from './FeedPoll';
import { FeedPostActions } from './FeedPostActions';
import { FeedPostHeader } from './FeedPostHeader';
import { PostImages } from './PostImages';
import { ReactionBar } from './ReactionBar';

export interface FeedPostCardProps {
  readonly post: FeedPost;
}

/** Community feed card — renders poll (PollWidget) or regular post (FeedCard) layout. */
export const FeedPostCard: React.FC<FeedPostCardProps> = ({ post }) => {
  const isPoll = Boolean(post.poll);
  return (
    /* data-component={isPoll ? 'PollWidget' : 'FeedCard'} */
    <article className="bg-canvas rounded-lg p-space-md shadow-sm border border-hairline/60">
      <FeedPostHeader post={post} />
      <h3
        className={`text-on-surface font-bold mb-space-xs ${
          isPoll ? 'font-heading-3 text-heading-3' : 'font-heading-4 text-heading-4'
        }`}
      >
        {post.title}
      </h3>
      <p className="font-body-md text-body-md text-body mb-space-md leading-relaxed">{post.body}</p>

      {post.poll ? (
        <FeedPoll
          actions={
            <FeedPostActions
              commentIcon="chat_bubble"
              commentLabel={feedCopy.pollCommentLabel(post.commentCount)}
              itemId={post.board.itemId}
            />
          }
          poll={post.poll}
        />
      ) : (
        <>
          {post.images && post.images.length > 0 && <PostImages images={post.images} />}
          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs font-ui-sm text-ui-sm">
            <ReactionBar seeds={post.reactions ?? []} />
            <FeedPostActions
              commentIcon="chat"
              commentLabel={feedCopy.commentLabel(post.commentCount)}
              itemId={post.board.itemId}
            />
          </div>
        </>
      )}
    </article>
  );
};

export default FeedPostCard;
