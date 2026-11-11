import React from 'react';
import { CategoryFilterPills } from '../components/community/CategoryFilterPills';
import { FeedComposer } from '../components/community/FeedComposer';
import { FeedPostCard } from '../components/community/FeedPostCard';
import { LoadMoreSentinel } from '../components/community/LoadMoreSentinel';
import { feedCategories, feedCopy } from '../data/community';
import { useCommunityFeed } from '../hooks/community/useCommunityFeed';

export interface CommunityFeedPageProps {
  readonly className?: string;
}

/** P-017 커뮤니티 토론방 feed. */
export const CommunityFeedPage: React.FC<CommunityFeedPageProps> = ({ className = '' }) => {
  const feed = useCommunityFeed();

  return (
    <div className={`w-full bg-surface ${className}`}>
      <div className="w-full max-w-[1200px] mx-auto px-gutter py-space-lg">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-space-md">
          {/* data-component="MainFeedColumn" */}
          <div className="w-full flex flex-col gap-space-md">
            <FeedComposer
              board={feed.board}
              onBoardChange={feed.setBoard}
              onSubmit={feed.addPost}
              onTagChange={feed.setTag}
              tag={feed.tag}
            />
            <CategoryFilterPills active={feed.category} categories={feedCategories} onChange={feed.setCategory} />
            {feed.posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
            {feed.posts.length === 0 && (
              <p className="py-space-lg text-center font-body-sm text-body-sm text-muted">{feedCopy.emptyLabel}</p>
            )}
            <LoadMoreSentinel
              endLabel={feedCopy.endLabel}
              hasMore={feed.hasMore}
              loadingLabel={feedCopy.loadingLabel}
              onLoadMore={feed.loadMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeedPage;
