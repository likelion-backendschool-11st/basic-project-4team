import React, { useCallback } from 'react';
import { BuyerActionBar } from '../components/listing/BuyerActionBar';
import { BuyerDescriptionSection } from '../components/listing/BuyerDescriptionSection';
import { ChatDrawer } from '../components/listing/ChatDrawer';
import { ListingAttributeGrid } from '../components/listing/ListingAttributeGrid';
import { ListingCategoryHeader } from '../components/listing/ListingCategoryHeader';
import { ListingEngagementStats } from '../components/listing/ListingEngagementStats';
import { ListingGallery } from '../components/listing/ListingGallery';
import { ListingPriceCallout } from '../components/listing/ListingPriceCallout';
import { ListingSpecSummary } from '../components/listing/ListingSpecSummary';
import { ListingTitle } from '../components/listing/ListingTitle';
import { ListingToast } from '../components/listing/ListingToast';
import { ListingTopBar } from '../components/listing/ListingTopBar';
import { RelatedListingsCarousel } from '../components/listing/RelatedListingsCarousel';
import { SellerProfileCard } from '../components/listing/SellerProfileCard';
import { buyerDescription, buyerListing, listingCore, toastMessages } from '../data/listing';
import { useChatDrawer } from '../hooks/listing/useChatDrawer';
import { useListingId } from '../hooks/listing/useListingId';
import { useToast } from '../hooks/listing/useToast';
import { useWishlist } from '../hooks/listing/useWishlist';

interface ListingDetailPageProps {
  /** Overrides the `:id` route param (tests / storybook). */
  readonly listingId?: string;
}

/** P-010 상품 상세 (buyer view) — `/listings/:id`. */
export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ listingId }) => {
  const routeId = useListingId();
  const id = listingId ?? routeId;
  const data = buyerListing;

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

  const wishlist = useWishlist(listingCore.wishCount, onWishChange);
  const chat = useChatDrawer(onChatSent);

  return (
    <div className="flex flex-col w-full bg-canvas">
      <ListingTopBar
        breadcrumbs={data.breadcrumbs}
        escrowBadge={data.escrowBadge}
        listingNo={id}
        listingNoLabel={data.listingNoLabel}
      />

      <div className="max-w-7xl mx-auto px-gutter md:px-gutter-desktop py-space-xl w-full">
        {/* TOP: gallery (5) + product info panel (7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop mb-space-lg">
          <ListingGallery images={data.gallery} variant="buyer" />

          <div className="lg:col-span-7 flex flex-col justify-between min-w-0">
            <div className="flex flex-col">
              <ListingCategoryHeader
                discussionCount={listingCore.discussionCount}
                discussionLabel={data.actions.discussionChipLabel}
                eyebrow={data.eyebrow}
                itemId={listingCore.itemId}
                onCopied={onCopied}
                setLabel={data.setLabel}
              />
              {/* data-component="ProductSpecTable" */}
              <div className="mt-space-sm mb-space-xs">
                <ListingTitle title={listingCore.title} />
              </div>
              <ListingPriceCallout buyer={data.price} currency={listingCore.currency} price={listingCore.price} />
              <ListingEngagementStats
                registered={data.stats.registered}
                views={data.stats.views}
                wishCount={wishlist.count}
                wishLabel={data.stats.wishLabel}
              />
              <ListingAttributeGrid attributes={data.attributes} variant="buyer" />
              <ListingSpecSummary specs={data.specs} title={data.specTitle} />
            </div>
            <BuyerActionBar
              chatLabel={data.actions.chatLabel}
              discussionCount={listingCore.discussionCount}
              discussionLabel={data.actions.discussionLabel}
              discussionTitle={data.actions.discussionTitle}
              itemId={listingCore.itemId}
              onOpenChat={chat.openDrawer}
              onToggleWish={wishlist.toggle}
              wishCount={wishlist.count}
              wishLabel={data.actions.wishLabel}
              wished={wishlist.wished}
            />
          </div>
        </div>

        {/* MIDDLE: description (7) + seller profile (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop pt-space-md border-t border-hairline mb-space-xl">
          <BuyerDescriptionSection content={data.description} paragraphs={buyerDescription} />
          <SellerProfileCard seller={data.seller} />
        </div>

        {/* BOTTOM: same-item listings carousel */}
        <RelatedListingsCarousel
          description={data.related.description}
          items={data.related.items}
          subtitle={data.related.subtitle}
          title={data.related.title}
          variant="buyer"
        />
      </div>

      <ChatDrawer
        content={data.chat}
        draft={chat.draft}
        onClose={chat.closeDrawer}
        onDraftChange={chat.setDraft}
        onQuickReply={chat.insertQuick}
        onSend={chat.send}
        open={chat.open}
        sellerInitial={data.seller.initial}
        sellerName={data.seller.name}
      />
      <ListingToast position="center" toast={toast} />
    </div>
  );
};

export default ListingDetailPage;
