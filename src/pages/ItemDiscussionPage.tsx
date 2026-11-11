import React from 'react';
import { Breadcrumbs } from '../components/community/Breadcrumbs';
import { CommunityGuidelinesCard } from '../components/community/CommunityGuidelinesCard';
import { DiscussionComposer } from '../components/community/DiscussionComposer';
import { DiscussionFeedControls } from '../components/community/DiscussionFeedControls';
import { DiscussionPostCard } from '../components/community/DiscussionPostCard';
import { ItemDiscussionHeader } from '../components/community/ItemDiscussionHeader';
import { LoadMoreSentinel } from '../components/community/LoadMoreSentinel';
import { TrendingItemsSidebar } from '../components/community/TrendingItemsSidebar';
import { discussionPostCopy } from '../data/community';
import { useItemDiscussion } from '../hooks/community/useItemDiscussion';

export interface ItemDiscussionPageProps {
  readonly className?: string;
}

/** P-018 품목별 토론방 (/community/items/:id). */
export const ItemDiscussionPage: React.FC<ItemDiscussionPageProps> = ({ className = '' }) => {
  const d = useItemDiscussion();

  return (
    <div className={`w-full bg-surface ${className}`}>
      <div className="w-full max-w-[1200px] mx-auto px-gutter py-space-lg">
        <div className="flex flex-col w-full">
          <Breadcrumbs current={d.item.breadcrumbCurrent} items={d.item.breadcrumbs} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left Column: Discussion Room & Voting */}
            <div className="lg:col-span-8 flex flex-col gap-space-md min-w-0">
              <ItemDiscussionHeader item={d.item} />
              <DiscussionComposer onSubmit={d.addPost} />
              <DiscussionFeedControls
                onSortChange={d.setSort}
                onVerifiedOnlyChange={d.setVerifiedOnly}
                sort={d.sort}
                total={d.totalDiscussions}
                verifiedOnly={d.verifiedOnly}
              />
              {/* data-component="DiscussionPostList" */}
              <div className="flex flex-col gap-space-sm">
                {d.posts.map((post) => (
                  <DiscussionPostCard itemId={d.itemId} key={post.id} post={post} />
                ))}
                {d.posts.length === 0 && (
                  <p className="py-space-lg text-center font-body-sm text-body-sm text-muted">{discussionPostCopy.emptyLabel}</p>
                )}
              </div>
              <LoadMoreSentinel
                endLabel={discussionPostCopy.endLabel}
                hasMore={d.hasMore}
                loadingLabel={discussionPostCopy.loadingLabel}
                onLoadMore={d.loadMore}
                variant="discussion"
              />
            </div>
            {/* Right Column: Trending Discussions Sidebar & Rules */}
            <div className="lg:col-span-4 flex flex-col gap-space-md min-w-0">
              <TrendingItemsSidebar currentItemId={d.itemId} />
              <CommunityGuidelinesCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDiscussionPage;
