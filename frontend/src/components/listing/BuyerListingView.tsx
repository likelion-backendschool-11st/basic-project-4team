import React, { useCallback } from 'react';
import type { ListingDetail } from '../../api/types';
import { ROUTES } from '../../data/layout';
import {
  buyerListing,
  listingCore,
  listingDetailCopy,
  ownerActionCopy,
  relatedListingsCopy,
  sellerListing,
  toastMessages,
  wishCopy,
} from '../../data/listing';
import { useChat } from '../../hooks/chat/useChat';
import { useLoginGate } from '../../hooks/itemcommunity/useLoginGate';
import { useBuyerListingView } from '../../hooks/listing/useBuyerListingView';
import { useItemDiscussionCount } from '../../hooks/listing/useItemDiscussionCount';
import { useOwnerListingActions } from '../../hooks/listing/useOwnerListingActions';
import { useRelatedListings } from '../../hooks/listing/useRelatedListings';
import { useSellerOtherListings } from '../../hooks/listing/useSellerOtherListings';
import { useToast } from '../../hooks/listing/useToast';
import { useWishlist } from '../../hooks/listing/useWishlist';
import { Icon } from '../common/Icon';
import { LoginRequiredModal } from '../itemcommunity/LoginRequiredModal';
import { BuyerActionBar } from './BuyerActionBar';
import { BuyerDescriptionSection } from './BuyerDescriptionSection';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ListingAttributeGrid } from './ListingAttributeGrid';
import { ListingCategoryHeader } from './ListingCategoryHeader';
import { ListingEngagementStats } from './ListingEngagementStats';
import { ListingGallery } from './ListingGallery';
import { ListingPriceCallout } from './ListingPriceCallout';
import { ListingSpecSummary } from './ListingSpecSummary';
import { ListingTitle } from './ListingTitle';
import { ListingToast } from './ListingToast';
import { ListingTopBar } from './ListingTopBar';
import { OwnerActionBar } from './OwnerActionBar';
import { RelatedListingsCarousel } from './RelatedListingsCarousel';
import { SellerProfileCard } from './SellerProfileCard';

interface BuyerListingViewProps {
  readonly listing: ListingDetail;
}

/** P-010 구매자 상세 본문. LISTING-02 응답을 받은 뒤에만 렌더링해 찜 상태를 응답값으로 시작한다. */
export const BuyerListingView: React.FC<BuyerListingViewProps> = ({ listing }) => {
  const view = useBuyerListingView(listing);
  // 품목 토론 글 수는 board API(GET /posts?itemId=)가 제공한다 (LISTING-02 비고).
  const discussionCount = useItemDiscussionCount(view.itemSlug);
  const { actions } = buyerListing;
  const sellerOthers = useSellerOtherListings(view.sellerId, listing.id);
  const related = useRelatedListings(view.itemId, listing.id, 'buyer');

  const { toast, showToast } = useToast();
  const onCopied = useCallback(
    (copied: boolean) =>
      copied ? showToast(toastMessages.copied) : showToast(toastMessages.copyFailed, toastMessages.copyFailedIcon),
    [showToast],
  );

  const loginGate = useLoginGate();
  const wishlist = useWishlist({
    listingId: listing.id,
    initialCount: listing.wishCount,
    initialWished: listing.isWished,
    ensureLogin: loginGate.ensureLogin,
    onLoginRequired: loginGate.prompt,
    showToast,
  });
  // 1:1 채팅 (REQ-DETAIL-005) — 방을 만들거나 기존 방을 열어 오른쪽 채팅 창을 띄운다.
  const { startChat } = useChat();
  const { ensureLogin, prompt } = loginGate;
  const onOpenChat = useCallback(async () => {
    if (!ensureLogin()) return;
    const outcome = await startChat(listing.id);
    if (outcome.ok) return;
    if (outcome.reason === 'login') prompt();
    else showToast(outcome.message, 'info');
  }, [ensureLogin, prompt, startChat, listing.id, showToast]);
  // 작성자 본인이면 찜·채팅 대신 수정·삭제·관리 버튼을 보여준다.
  const owner = useOwnerListingActions(String(listing.id), showToast);

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
                discussionCount={discussionCount}
                discussionLabel={actions.discussionChipLabel}
                eyebrow={view.eyebrow}
                itemId={view.itemSlug}
                onCopied={onCopied}
                setLabel={view.setLabel}
                sharePath={ROUTES.listingDetail(String(listing.id))}
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
            {listing.isOwner ? (
              <OwnerActionBar
                deleting={owner.deleting}
                editTo={ROUTES.myListingEdit(String(listing.id))}
                labels={ownerActionCopy}
                manageTo={ROUTES.myListingDetail(String(listing.id))}
                onDelete={owner.openDelete}
              />
            ) : (
              <BuyerActionBar
                chatLabel={actions.chatLabel}
                discussionCount={discussionCount}
                discussionLabel={actions.discussionLabel}
                discussionTitle={actions.discussionTitle}
                itemId={view.itemSlug}
                onOpenChat={() => void onOpenChat()}
                onToggleWish={wishlist.toggle}
                wishCount={wishlist.count}
                wishLabel={actions.wishLabel}
                wished={wishlist.wished}
              />
            )}
          </div>
        </div>

        {/* MIDDLE: description (7) + seller profile (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop pt-space-md border-t border-hairline mb-space-xl">
          <BuyerDescriptionSection content={view.description} paragraphs={view.paragraphs} />
          <SellerProfileCard
            otherEmptyText={sellerOthers.loading ? undefined : relatedListingsCopy.sellerOtherEmpty}
            otherItems={sellerOthers.items}
            otherTitle={relatedListingsCopy.sellerOtherTitle(sellerOthers.totalCount)}
            seller={view.seller}
          />
        </div>

        {/* 같은 품목의 다른 매물이 없으면 영역째 숨긴다. */}
        {related.items.length > 0 && (
          <RelatedListingsCarousel
            description={relatedListingsCopy.buyer.description(view.itemName, related.totalCount)}
            items={related.items}
            subtitle={relatedListingsCopy.buyer.subtitle}
            title={relatedListingsCopy.buyer.title}
          />
        )}
      </div>

      {listing.isOwner && (
        <DeleteConfirmModal
          labels={{ ...sellerListing.deleteModal, warning: sellerListing.deleteModal.warning(wishlist.count, listing.viewCount) }}
          onCancel={owner.closeDelete}
          onConfirm={owner.confirmDelete}
          open={owner.deleteOpen}
        />
      )}
      <ListingToast position="center" toast={toast} />
      <LoginRequiredModal
        {...wishCopy.loginRequired}
        onClose={loginGate.close}
        onConfirm={loginGate.goLogin}
        open={loginGate.open}
      />
    </div>
  );
};

export default BuyerListingView;
