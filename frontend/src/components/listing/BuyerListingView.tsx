import React, { useCallback } from 'react';
import type { ListingDetail } from '../../api/types';
import { buyerListing, listingCore, listingDetailCopy, toastMessages } from '../../data/listing';
import { useBuyerListingView } from '../../hooks/listing/useBuyerListingView';
import { useChatDrawer } from '../../hooks/listing/useChatDrawer';
import { useToast } from '../../hooks/listing/useToast';
import { useWishlist } from '../../hooks/listing/useWishlist';
import { Icon } from '../common/Icon';
import { BuyerActionBar } from './BuyerActionBar';
import { BuyerDescriptionSection } from './BuyerDescriptionSection';
import { ChatDrawer } from './ChatDrawer';
import { ListingAttributeGrid } from './ListingAttributeGrid';
import { ListingCategoryHeader } from './ListingCategoryHeader';
import { ListingEngagementStats } from './ListingEngagementStats';
import { ListingGallery } from './ListingGallery';
import { ListingPriceCallout } from './ListingPriceCallout';
import { ListingSpecSummary } from './ListingSpecSummary';
import { ListingTitle } from './ListingTitle';
import { ListingToast } from './ListingToast';
import { ListingTopBar } from './ListingTopBar';
import { SellerProfileCard } from './SellerProfileCard';

interface BuyerListingViewProps {
  readonly listing: ListingDetail;
}

// 품목 토론 글 수는 board API가 제공한다(LISTING-02 비고). 연동 전까지 0으로 둔다.
const DISCUSSION_COUNT = 0;

/** P-010 구매자 상세 본문. LISTING-02 응답을 받은 뒤에만 렌더링해 찜 상태를 응답값으로 시작한다. */
export const BuyerListingView: React.FC<BuyerListingViewProps> = ({ listing }) => {
  const view = useBuyerListingView(listing);
  const { actions } = buyerListing;

  const { toast, showToast } = useToast();
  const onCopied = useCallback(
    (copied: boolean) => showToast(copied ? toastMessages.copied : toastMessages.copiedFallback),
    [showToast],
  );
  const onWishChange = useCallback(
    (wished: boolean) => showToast(wished ? toastMessages.wishAdded : toastMessages.wishRemoved),
    [showToast],
  );
  const onChatSent = useCallback(() => showToast(toastMessages.chatSent), [showToast]);

  const wishlist = useWishlist(listing.wishCount, onWishChange, listing.isWished);
  const chat = useChatDrawer(onChatSent);

  return (
    <div className="flex flex-col w-full bg-canvas">
      <ListingTopBar
        breadcrumbs={view.breadcrumbs}
        escrowBadge={buyerListing.escrowBadge}
        listingNo={view.listingNo}
        listingNoLabel={buyerListing.listingNoLabel}
      />

      <div className="max-w-7xl mx-auto px-gutter md:px-gutter-desktop py-space-xl w-full">
        {/* TOP: gallery (5) + product info panel (7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop mb-space-lg">
          {view.gallery.length > 0 ? (
            <ListingGallery images={view.gallery} variant="buyer" />
          ) : (
            <div className="lg:col-span-5 aspect-[4/5] bg-canvas-soft rounded border border-hairline flex flex-col items-center justify-center gap-space-xs text-muted">
              <Icon className="text-[40px]" name="image_not_supported" />
              <span className="font-caption text-caption">{listingDetailCopy.noImage}</span>
            </div>
          )}

          <div className="lg:col-span-7 flex flex-col justify-between min-w-0">
            <div className="flex flex-col">
              <ListingCategoryHeader
                discussionCount={DISCUSSION_COUNT}
                discussionLabel={actions.discussionChipLabel}
                eyebrow={view.eyebrow}
                itemId={view.itemSlug}
                onCopied={onCopied}
                setLabel={view.setLabel}
              />
              {/* data-component="ProductSpecTable" */}
              <div className="mt-space-sm mb-space-xs">
                <ListingTitle title={view.title} />
              </div>
              <ListingPriceCallout buyer={view.priceInfo} currency={listingCore.currency} price={view.price} />
              <ListingEngagementStats
                registered={view.stats.registered}
                views={view.stats.views}
                wishCount={wishlist.count}
                wishLabel={view.stats.wishLabel}
              />
              <ListingAttributeGrid attributes={view.attributes} variant="buyer" />
              <ListingSpecSummary specs={view.specs} title={buyerListing.specTitle} />
            </div>
            <BuyerActionBar
              chatLabel={actions.chatLabel}
              discussionCount={DISCUSSION_COUNT}
              discussionLabel={actions.discussionLabel}
              discussionTitle={actions.discussionTitle}
              itemId={view.itemSlug}
              onOpenChat={chat.openDrawer}
              onToggleWish={wishlist.toggle}
              wishCount={wishlist.count}
              wishLabel={actions.wishLabel}
              wished={wishlist.wished}
            />
          </div>
        </div>

        {/* MIDDLE: description (7) + seller profile (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop pt-space-md border-t border-hairline mb-space-xl">
          <BuyerDescriptionSection content={view.description} paragraphs={view.paragraphs} />
          <SellerProfileCard seller={view.seller} />
        </div>

        {/* 같은 품목의 다른 매물 캐러셀은 ITEM-05 API가 생기면 연결한다. */}
      </div>

      <ChatDrawer
        content={view.chat}
        draft={chat.draft}
        onClose={chat.closeDrawer}
        onDraftChange={chat.setDraft}
        onQuickReply={chat.insertQuick}
        onSend={chat.send}
        open={chat.open}
        sellerInitial={view.seller.initial}
        sellerName={view.seller.name}
      />
      <ListingToast position="center" toast={toast} />
    </div>
  );
};

export default BuyerListingView;
