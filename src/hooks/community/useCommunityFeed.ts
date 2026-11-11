import { useCallback, useMemo, useState } from 'react';
import {
  feedBoardMeta,
  feedComposer,
  feedCopy,
  feedMorePosts,
  feedPosts,
  myAuthor,
  type FeedCategoryKey,
  type FeedPost,
} from '../../data/community';

const PAGE_SIZE = 1;

/** Community feed: category filter, composer board/tag selection, posting, infinite load. */
export const useCommunityFeed = () => {
  const [category, setCategory] = useState<FeedCategoryKey>('all');
  const [board, setBoard] = useState<string>(feedComposer.boardOptions[0].value);
  const [tag, setTag] = useState<string>(feedComposer.tagOptions[0].value);
  const [userPosts, setUserPosts] = useState<readonly FeedPost[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  const hasMore = loadedCount < feedMorePosts.length;

  const loadMore = useCallback(() => {
    setLoadedCount((n) => Math.min(n + PAGE_SIZE, feedMorePosts.length));
  }, []);

  const addPost = useCallback(
    (text: string) => {
      const meta = feedBoardMeta[board] ?? feedBoardMeta.free;
      const tagLabel = feedComposer.tagOptions.find((t) => t.value === tag)?.label ?? '';
      const post: FeedPost = {
        id: `feed-user-${Date.now()}`,
        category: meta.category,
        board: { label: meta.label, icon: meta.icon, itemId: meta.itemId },
        author: myAuthor,
        timeAgo: feedCopy.justNow,
        context: tagLabel,
        title: feedCopy.newPostTitle,
        body: text,
        reactions: [
          { key: 'fire', emoji: '🔥', count: 0 },
          { key: 'clap', emoji: '👏', count: 0 },
        ],
        commentCount: 0,
      };
      setUserPosts((prev) => [post, ...prev]);
    },
    [board, tag],
  );

  const posts = useMemo(() => {
    const all = [...userPosts, ...feedPosts, ...feedMorePosts.slice(0, loadedCount)];
    return category === 'all' ? all : all.filter((p) => p.category === category);
  }, [userPosts, loadedCount, category]);

  return { category, setCategory, board, setBoard, tag, setTag, posts, addPost, hasMore, loadMore };
};
