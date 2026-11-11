import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  defaultDiscussionItem,
  discussionItems,
  discussionMorePosts,
  discussionPostCopy,
  discussionPosts,
  discussionReactionTemplate,
  myAuthor,
  type DiscussionPost,
  type DiscussionSort,
} from '../../data/community';

const score = (p: DiscussionPost) => p.reactions.reduce((s, r) => s + r.count, 0) + p.commentCount;

/** Item discussion room: resolves :id, sorts/filters posts, adds composer posts, loads older posts. */
export const useItemDiscussion = () => {
  const { id } = useParams<{ id: string }>();
  const item = useMemo(() => discussionItems.find((i) => i.id === id) ?? defaultDiscussionItem, [id]);
  const itemId = id ?? item.id;

  const [sort, setSort] = useState<DiscussionSort>('popular');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userPosts, setUserPosts] = useState<readonly DiscussionPost[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  const hasMore = loadedCount < discussionMorePosts.length;
  const loadMore = useCallback(() => {
    setLoadedCount((n) => Math.min(n + 1, discussionMorePosts.length));
  }, []);

  const addPost = useCallback((text: string) => {
    const post: DiscussionPost = {
      id: `post-user-${Date.now()}`,
      author: myAuthor,
      badges: [{ label: discussionPostCopy.newPostBadge, tone: 'mint' }],
      isOwner: false,
      meta: discussionPostCopy.justNow,
      body: text,
      reactions: discussionReactionTemplate(0, 0, 0, 0),
      commentCount: 0,
      order: Number.MAX_SAFE_INTEGER,
    };
    setUserPosts((prev) => [post, ...prev]);
  }, []);

  const posts = useMemo(() => {
    const base = [...discussionPosts, ...discussionMorePosts.slice(0, loadedCount)];
    const filtered = verifiedOnly ? base.filter((p) => p.isOwner) : base;
    const sorted = [...filtered].sort((a, b) =>
      sort === 'latest' ? b.order - a.order : score(b) - score(a),
    );
    // Freshly written posts always stay on top.
    return [...userPosts, ...sorted];
  }, [sort, verifiedOnly, userPosts, loadedCount]);

  return {
    itemId,
    item,
    sort,
    setSort,
    verifiedOnly,
    setVerifiedOnly,
    posts,
    totalDiscussions: item.totalDiscussions + userPosts.length,
    addPost,
    hasMore,
    loadMore,
  };
};
