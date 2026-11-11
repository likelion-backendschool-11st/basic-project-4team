import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AttributeFields } from '../components/listing-form/AttributeFields';
import { EditGuideSidebar } from '../components/listing-form/EditGuideSidebar';
import { EditHeaderBanner } from '../components/listing-form/EditHeaderBanner';
import { EditSubmitActions } from '../components/listing-form/EditSubmitActions';
import { EditTitleBlock } from '../components/listing-form/EditTitleBlock';
import { EditableFieldsSection } from '../components/listing-form/EditableFieldsSection';
import { LockedCategorySection } from '../components/listing-form/LockedCategorySection';
import { PhotoUploader } from '../components/listing-form/PhotoUploader';
import { SubmitToast } from '../components/listing-form/SubmitToast';
import { TradeOptionsSection } from '../components/listing-form/TradeOptionsSection';
import { ROUTES } from '../data/layout';
import { getEditListingMock, submitCopy } from '../data/listingForm';
import { useDeleteListing } from '../hooks/listing-form/useDeleteListing';
import { useListingForm } from '../hooks/listing-form/useListingForm';

interface ListingEditPageProps {
  readonly className?: string;
}

/** P-015 판매글 수정 — route `/my/listings/:id/edit`. */
export const ListingEditPage: React.FC<ListingEditPageProps> = ({ className = '' }) => {
  const { id = '' } = useParams<{ id: string }>();
  const listing = useMemo(() => getEditListingMock(id), [id]);
  const form = useListingForm(listing.values, { variant: 'edit', listingId: id });
  const onDelete = useDeleteListing();
  const { values, errors, setField } = form;
  const cancelTo = ROUTES.myListingDetail(id);

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <EditHeaderBanner registrationNo={listing.registrationNo} />
      <div className="max-w-7xl mx-auto px-gutter-desktop py-space-section w-full">
        <EditTitleBlock cancelTo={cancelTo} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* data-component="ListingEditForm" */}
          <form className="lg:col-span-8 flex flex-col gap-space-xl min-w-0" noValidate onSubmit={form.handleSubmit}>
            <PhotoUploader
              error={errors.photos ?? errors.authPhoto}
              initialAuthPhoto={listing.values.authPhoto}
              initialPhotos={listing.values.photos}
              onAuthPhotoChange={form.setAuthPhoto}
              onPhotosChange={form.setPhotos}
              step={1}
              variant="edit"
            />
            <LockedCategorySection
              catalogMatch={values.catalogMatch}
              mainCategory={values.mainCategory}
              step={2}
              subCategory={values.subCategory}
            >
              <AttributeFields onChange={form.setAttribute} value={values.attributes} variant="edit" />
            </LockedCategorySection>
            <EditableFieldsSection
              description={values.description}
              descriptionError={errors.description}
              onAddPrice={form.addPrice}
              onDescriptionChange={(v) => setField('description', v)}
              onPriceChange={(v) => setField('price', v)}
              onTitleChange={(v) => setField('title', v)}
              originalPrice={listing.originalPrice}
              price={values.price}
              priceError={errors.price}
              step={3}
              title={values.title}
              titleError={errors.title}
              wishCount={listing.wishCount}
            />
            <TradeOptionsSection
              agreed={values.agreed}
              delivery={values.delivery}
              direct={values.direct}
              directLocation={values.directLocation}
              onAgreedChange={(v) => setField('agreed', v)}
              onDeliveryChange={(v) => setField('delivery', v)}
              onDirectChange={(v) => setField('direct', v)}
              onLocationChange={(v) => setField('directLocation', v)}
              step={4}
              variant="edit"
            />
            <EditSubmitActions
              cancelTo={cancelTo}
              errors={Object.values(errors)}
              onDelete={onDelete}
              submitting={form.submitting}
            />
          </form>
          <EditGuideSidebar activeCategory={values.mainCategory} />
        </div>
      </div>
      <SubmitToast body={submitCopy.toast.editBody} title={submitCopy.toast.editTitle} visible={form.submitting} />
    </div>
  );
};

export default ListingEditPage;
