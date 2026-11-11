import React, { useCallback } from 'react';
import { CopyUrlButton } from '../components/listing/CopyUrlButton';
import { DealCompleteModal } from '../components/listing/DealCompleteModal';
import { DeleteConfirmModal } from '../components/listing/DeleteConfirmModal';
import { ListingAttributeGrid } from '../components/listing/ListingAttributeGrid';
import { ListingBreadcrumbs } from '../components/listing/ListingBreadcrumbs';
import { ListingEngagementStats } from '../components/listing/ListingEngagementStats';
import { ListingGallery } from '../components/listing/ListingGallery';
import { ListingPriceCallout } from '../components/listing/ListingPriceCallout';
import { ListingTitle } from '../components/listing/ListingTitle';
import { ListingToast } from '../components/listing/ListingToast';
import { RelatedListingsCarousel } from '../components/listing/RelatedListingsCarousel';
import { SellerDescriptionSection } from '../components/listing/SellerDescriptionSection';
import { SellerManagementPanel } from '../components/listing/SellerManagementPanel';
import { StatusDropdown } from '../components/listing/StatusDropdown';
import { listingCore, sellerDescription, sellerListing, toastMessages } from '../data/listing';
import { useListingId } from '../hooks/listing/useListingId';
import { useListingStatus } from '../hooks/listing/useListingStatus';
import { useToast } from '../hooks/listing/useToast';

interface MyListingDetailPageProps {
  /** Overrides the `:id` route param (tests / storybook). */
  readonly listingId?: string;
}

/** P-013 내 판매글 상세 (seller management view) — `/my/listings/:id`. */
export const MyListingDetailPage: React.FC<MyListingDetailPageProps> = ({ listingId }) => {
  const routeId = useListingId();
  const id = listingId ?? routeId;
  const data = sellerListing;

  const { toast, showToast } = useToast(3000);
  const onCopied = useCallback(
    (copied: boolean) => showToast(copied ? toastMessages.copied : toastMessages.copiedFallback),
    [showToast],
  );
  const manage = useListingStatus('판매중', listingCore.price, toastMessages, showToast);

  return (
    /* data-component="SellerProductDetailLayout" */
    <div className="max-w-7xl mx-auto px-gutter md:px-gutter-desktop py-space-xl w-full bg-canvas">
      {/* TOP: gallery (5) + overview & control deck (7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop mb-space-xl">
        <ListingGallery extraThumbs={data.extraThumbs} images={data.gallery} variant="seller" />

        {/* data-component="SellerProductOverviewCard" */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-space-md min-w-0">
          <div>
            <div className="flex items-center justify-between gap-space-xs mb-space-xs">
              <ListingBreadcrumbs items={data.breadcrumbs} variant="chevron" />
              <CopyUrlButton onCopied={onCopied} variant="seller" />
            </div>
            <ListingTitle className="mb-space-sm leading-tight" title={listingCore.title} />
            <ListingPriceCallout currency={listingCore.currency} price={listingCore.price} seller={data.price} />
            <ListingEngagementStats
              registered={data.stats.registered}
              variant="seller"
              views={data.stats.views}
              viewsLabel={data.stats.viewsLabel}
              wishCount={listingCore.wishCount}
              wishLabel={data.stats.wishLabel}
            />
            <ListingAttributeGrid attributes={data.attributes} variant="seller" />
          </div>

          <SellerManagementPanel
            itemId={listingCore.itemId}
            labels={data.management}
            listingId={id}
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

      <SellerDescriptionSection content={data.description} inspection={data.inspection} paragraphs={sellerDescription} />

      <RelatedListingsCarousel
        description={data.related.description}
        items={data.related.items}
        title={data.related.title}
        variant="seller"
      />

      <DeleteConfirmModal
        labels={data.deleteModal}
        onCancel={manage.closeDelete}
        onConfirm={manage.confirmDelete}
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

export default MyListingDetailPage;
