import React from 'react';
import { Link } from 'react-router-dom';
import type { MyPost } from '../../api/types';
import { ROUTES } from '../../data/layout';
import { myPostsCopy as copy } from '../../data/mypage';
import { formatTimeAgo } from '../../hooks/listing/listingViewHelpers';
import { useMyPosts } from '../../hooks/mypage/useMyLists';
import { Icon } from '../common/Icon';
import { MyEmptyState } from './MyEmptyState';
import { MyListShell } from './MyListShell';

interface MyPostsPanelProps {
  readonly className?: string;
}

interface PostRowProps {
  readonly post: MyPost;
}

/** 글 상세 화면이 없으므로 품목 글은 토론방, 그 외는 커뮤니티 피드로 보낸다 (알림과 같은 규칙). */
const postLink = (itemId: string | null): string => (itemId ? ROUTES.itemDiscussion(itemId) : ROUTES.community);

const PostRow: React.FC<PostRowProps> = ({ post }) => (
  <li className="border-b border-hairline">
    <Link className="block py-space-sm px-1 hover:bg-canvas-soft transition-colors group" to={postLink(post.itemId)}>
      <span className="flex items-center gap-1.5 mb-1">
        <span className="font-micro text-micro font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
          {copy.boards[post.board]}
        </span>
        {post.itemName && <span className="font-micro text-micro text-primary truncate">#{post.itemName}</span>}
      </span>
      {post.title && <span className="block font-ui-label text-ui-label text-ink truncate group-hover:underline">{post.title}</span>}
      <span className={`block font-body-sm text-body-sm line-clamp-2 ${post.title ? 'text-muted' : 'text-ink group-hover:underline'}`}>
        {post.body}
      </span>
      <span className="mt-1 flex items-center gap-space-sm font-micro text-micro text-muted">
        <span>{formatTimeAgo(post.createdAt)}</span>
        <span className="flex items-center gap-0.5">
          <Icon className="text-[14px]" name="local_fire_department" />
          {copy.reactions(post.reactionCount)}
        </span>
        <span className="flex items-center gap-0.5">
          <Icon className="text-[14px]" name="chat_bubble" />
          {copy.comments(post.commentCount)}
        </span>
      </span>
    </Link>
  </li>
);

/** 내 토론글 탭. */
export const MyPostsPanel: React.FC<MyPostsPanelProps> = ({ className = '' }) => {
  const list = useMyPosts();
  return (
    <div className={className}>
      <MyListShell
        {...list.shellProps}
        empty={
          <MyEmptyState actionLabel={copy.emptyAction} actionTo={ROUTES.community} body={copy.emptyBody} icon="forum" title={copy.emptyTitle} />
        }
      >
        {list.items.map((post) => (
          <PostRow key={post.postId} post={post} />
        ))}
      </MyListShell>
    </div>
  );
};

export default MyPostsPanel;
