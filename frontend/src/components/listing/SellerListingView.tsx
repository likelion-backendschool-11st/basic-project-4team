import React, { useCallback, useEffect } from 'react';
import { CopyUrlButton } from './CopyUrlButton';
import { DealCompleteModal } from './DealCompleteModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ListingAttributeGrid } from './ListingAttributeGrid';
import { ListingBreadcrumbs } from './ListingBreadcrumbs';
import { ListingEngagementStats } from './ListingEngagementStats';
import { ListingGallery } from './ListingGallery';
import { ListingPriceCallout } from './ListingPriceCallout';
import { ListingTitle } from './ListingTitle';
import { ListingToast } from './ListingToast';
import { RelatedListingsCarousel } from './RelatedListingsCarousel';
import { SellerDescriptionSection } from './SellerDescriptionSection';
import { SellerManagementPanel } from './SellerManagementPanel';
import { StatusDropdown } from './StatusDropdown';
import type { ListingDetail } from '../../api/types';
import { listingCore, sellerDetailCopy, sellerListing, toastMessages } from '../../data/listing';
import { useDeleteListing } from '../../hooks/listing-form/useDeleteListing';
import { useListingStatus } from '../../hooks/listing/useListingStatus';
import { useSellerListingView } from '../../hooks/listing/useSellerListingView';
import { useToast } from '../../hooks/listing/useToast';

// 삭제 완료 토스트를 보여준 뒤 홈으로 이동한다.
const DELETE_REDIRECT_MS = 1200;

interface SellerListingViewProps {
  /** LISTING-02로 불러온 내 판매글 (isOwner = true). */
  readonly listing: ListingDetail;
}

/** P-013 내 판매글 상세 화면. 판매글 정보·삭제·상태 변경·거래완료 모두 API로 처리한다. */
export const SellerListingView: React.FC<SellerListingViewProps> = ({ listing }) => {
  const view = useSellerListingView(listing);
  const data = sellerListing;

  const { toast, showToast } = useToast(3000);
  const onCopied = useCallback(
    (copied: boolean) => showToast(copied ? toastMessages.copied : toastMessages.copiedFallback),
    [showToast],
  );
  const manage = useListingStatus(view.id, view.status, view.price, toastMessages, showToast);
  const onDeleted = useCallback(() => showToast(toastMessages.deleted, 'delete'), [showToast]);
  const { remove, deleteError } = useDeleteListing(view.id, { onDeleted, redirectDelayMs: DELETE_REDIRECT_MS });
  const { closeDelete } = manage;
  const onConfirmDelete = useCallback(() => {
    closeDelete();
    void remove();
  }, [closeDelete, remove]);

  useEffect(() => {
    if (deleteError) showToast(deleteError, sellerDetailCopy.deleteFailedIcon);
  }, [deleteError, showToast]);

  return (
    /* data-component="SellerProductDetailLayout" */
    <div className="max-w-7xl mx-auto px-gutter md:px-gutter-desktop py-space-xl w-full bg-canvas">
      {/* TOP: gallery (5) + overview & control deck (7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop mb-space-xl">
        <ListingGallery images={view.gallery} variant="seller" />

        {/* data-component="SellerProductOverviewCard" */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-space-md min-w-0">
          <div>
            <div className="flex items-center justify-between gap-space-xs mb-space-xs">
              <ListingBreadcrumbs items={view.breadcrumbs} variant="chevron" />
              <CopyUrlButton onCopied={onCopied} variant="seller" />
            </div>
            <ListingTitle className="mb-space-sm leading-tight" title={view.title} />
            <ListingPriceCallout currency={listingCore.currency} price={view.price} seller={view.priceInfo} />
            <ListingEngagementStats
              registered={view.stats.registered}
              variant="seller"
              views={view.stats.views}
              viewsLabel={view.stats.viewsLabel}
              wishCount={view.wishCount}
              wishLabel={view.stats.wishLabel}
            />
            <ListingAttributeGrid attributes={view.attributes} variant="seller" />
          </div>

          <SellerManagementPanel
            itemId={view.itemSlug}
            labels={data.management}
            listingId={view.id}
            onDelete={manage.openDelete}
            statusControl={
              <StatusDropdown
                menuRef={manage.menuRef}
                onOpenDealModal={manage.openDeal}
                onSelect={manage.selectStatus}
                onToggle={manage.toggleMenu}
                open={manage.menuOpen}
                options={data.statusOptions}
                prefix={data.management.statusPrefix}
                status={manage.status}
              />
            }
          />
        </div>
      </div>

      <SellerDescriptionSection content={data.description} inspection={data.inspection} paragraphs={view.paragraphs} />

      {/* 같은 품목의 다른 매물(ITEM-05)은 아직 API가 없어 목 데이터를 보여준다. */}
      <RelatedListingsCarousel
        description={data.related.description}
        items={data.related.items}
        title={data.related.title}
        variant="seller"
      />

      <DeleteConfirmModal
        labels={data.deleteModal}
        onCancel={manage.closeDelete}
        onConfirm={onConfirmDelete}
        open={manage.deleteOpen}
      />
      <DealCompleteModal
        currency={listingCore.currency}
        finalPrice={manage.finalPrice}
        labels={data.dealModal}
        onCancel={manage.closeDeal}
        onFinalPriceChange={manage.setFinalPrice}
        onRequestReviewChange={manage.setRequestReview}
        onSubmit={manage.submitDeal}
        open={manage.dealOpen}
        requestReview={manage.requestReview}
      />
      {/* data-component="SellerListingNav" (toast) */}
      <ListingToast position="right" toast={toast} />
    </div>
  );
};

export default SellerListingView;
