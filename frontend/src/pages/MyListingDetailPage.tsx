import React from 'react';
import { ListingLoadState } from '../components/listing/ListingLoadState';
import { SellerListingView } from '../components/listing/SellerListingView';
import { ROUTES } from '../data/layout';
import { listingDetailCopy as copy, sellerDetailCopy } from '../data/listing';
import { useListingDetail } from '../hooks/listing/useListingDetail';
import { useListingId } from '../hooks/listing/useListingId';

interface MyListingDetailPageProps {
  /** Overrides the `:id` route param (tests / storybook). */
  readonly listingId?: string;
}

/** P-013 내 판매글 상세 (seller management view) — `/my/listings/:id`. 데이터는 LISTING-02 API에서 받는다. */
export const MyListingDetailPage: React.FC<MyListingDetailPageProps> = ({ listingId }) => {
  const routeId = useListingId();
  const id = listingId ?? routeId;
  const state = useListingDetail(id);

  switch (state.status) {
    case 'loading':
      return <ListingLoadState icon="hourglass_empty" title={copy.loading} />;
    case 'notFound':
      return (
        <ListingLoadState body={copy.notFoundBody} icon="search_off" linkLabel={copy.homeLabel} linkTo={ROUTES.home} title={copy.notFoundTitle} />
      );
    case 'error':
      return (
        <ListingLoadState body={copy.errorBody} icon="error" linkLabel={copy.homeLabel} linkTo={ROUTES.home} title={copy.errorTitle} />
      );
    default:
      if (!state.listing.isOwner) {
        return (
          <ListingLoadState
            body={sellerDetailCopy.notOwnerBody}
            icon="lock"
            linkLabel={sellerDetailCopy.buyerViewLabel}
            linkTo={ROUTES.listingDetail(id)}
            title={sellerDetailCopy.notOwnerTitle}
          />
        );
      }
      // key: 다른 판매글로 이동하면 상태 드롭다운·모달 상태를 새로 시작한다.
      return <SellerListingView key={state.listing.id} listing={state.listing} />;
  }
};

export default MyListingDetailPage;
