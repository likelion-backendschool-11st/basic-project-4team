import React from 'react';
import { useParams } from 'react-router-dom';
import { ListingLoadState } from '../components/listing/ListingLoadState';
import { ListingEditForm } from '../components/listing-form/ListingEditForm';
import { ROUTES } from '../data/layout';
import { editPageCopy as copy } from '../data/listingForm';
import { useListingDetail } from '../hooks/listing/useListingDetail';

interface ListingEditPageProps {
  readonly className?: string;
}

/** P-015 판매글 수정 — route `/my/listings/:id/edit`. 기존 정보는 LISTING-02로 불러온다. */
export const ListingEditPage: React.FC<ListingEditPageProps> = ({ className = '' }) => {
  const { id = '' } = useParams<{ id: string }>();
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
    default: {
      const { listing } = state;
      // 서버도 작성자를 검증하지만(403), 남의 글은 폼 자체를 보여주지 않는다 (REQ-EDIT-005).
      if (!listing.isOwner) {
        return (
          <ListingLoadState
            body={copy.forbiddenBody}
            icon="lock"
            linkLabel={copy.detailLabel}
            linkTo={ROUTES.listingDetail(id)}
            title={copy.forbiddenTitle}
          />
        );
      }
      if (listing.status === 'sold') {
        return (
          <ListingLoadState
            body={copy.soldBody}
            icon="verified"
            linkLabel={copy.detailLabel}
            linkTo={ROUTES.myListingDetail(id)}
            title={copy.soldTitle}
          />
        );
      }
      // key: 다른 판매글로 이동하면 폼 상태를 새로 시작한다.
      return <ListingEditForm className={className} key={listing.id} listing={listing} />;
    }
  }
};

export default ListingEditPage;
