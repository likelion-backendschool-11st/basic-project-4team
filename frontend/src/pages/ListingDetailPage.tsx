import React from 'react';
import { BuyerListingView } from '../components/listing/BuyerListingView';
import { ListingLoadState } from '../components/listing/ListingLoadState';
import { ROUTES } from '../data/layout';
import { listingDetailCopy as copy } from '../data/listing';
import { useListingDetail } from '../hooks/listing/useListingDetail';
import { useListingId } from '../hooks/listing/useListingId';

interface ListingDetailPageProps {
  /** Overrides the `:id` route param (tests / storybook). */
  readonly listingId?: string;
}

/** P-010 상품 상세 (buyer view) — `/listings/:id`. 데이터는 LISTING-02 API에서 받는다. */
export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ listingId }) => {
  const routeId = useListingId();
  const state = useListingDetail(listingId ?? routeId);

  switch (state.status) {
    case 'loading':
      return <ListingLoadState icon="hourglass_empty" title={copy.loading} />;
    case 'notFound':
      return (
        <ListingLoadState
          body={copy.notFoundBody}
          icon="search_off"
          linkLabel={copy.homeLabel}
          linkTo={ROUTES.home}
          title={copy.notFoundTitle}
        />
      );
    case 'error':
      return (
        <ListingLoadState
          body={copy.errorBody}
          icon="error"
          linkLabel={copy.homeLabel}
          linkTo={ROUTES.home}
          title={copy.errorTitle}
        />
      );
    default:
      // key: 다른 판매글로 이동하면 찜·채팅 상태를 새로 시작한다.
      return <BuyerListingView key={state.listing.id} listing={state.listing} />;
  }
};

export default ListingDetailPage;
