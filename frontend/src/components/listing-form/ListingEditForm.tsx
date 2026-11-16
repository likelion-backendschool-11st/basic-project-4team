import React from 'react';
import { AttributeFields } from './AttributeFields';
import { EditGuideSidebar } from './EditGuideSidebar';
import { EditHeaderBanner } from './EditHeaderBanner';
import { EditSubmitActions } from './EditSubmitActions';
import { EditTitleBlock } from './EditTitleBlock';
import { EditableFieldsSection } from './EditableFieldsSection';
import { LockedCategorySection } from './LockedCategorySection';
import { PhotoUploader } from './PhotoUploader';
import { SubmitToast } from './SubmitToast';
import { TradeOptionsSection } from './TradeOptionsSection';
import type { ListingDetail } from '../../api/types';
import { ROUTES } from '../../data/layout';
import { submitCopy } from '../../data/listingForm';
import { useDeleteListing } from '../../hooks/listing-form/useDeleteListing';
import { useEditListing } from '../../hooks/listing-form/useEditListing';
import { useListingForm } from '../../hooks/listing-form/useListingForm';
import { usePricePolicy } from '../../hooks/listing-form/usePricePolicy';

interface ListingEditFormProps {
  /** LISTING-02로 불러온 내 판매글. */
  readonly listing: ListingDetail;
  readonly className?: string;
}

/** P-015 판매글 수정 폼. 저장은 LISTING-04, 삭제는 LISTING-05. */
export const ListingEditForm: React.FC<ListingEditFormProps> = ({ listing, className = '' }) => {
  const id = String(listing.id);
  const edit = useEditListing(listing);
  const form = useListingForm(edit.initialValues, { variant: 'edit', listingId: id, onSubmit: edit.onSubmit });
  const { deleting, deleteError, confirmAndRemove } = useDeleteListing(id);
  const { values, errors, setField } = form;
  const pricePolicy = usePricePolicy(values.itemId, values.attributes);
  const cancelTo = ROUTES.myListingDetail(id);
  const messages = [...Object.values(errors), form.submitError, deleteError].filter((m): m is string => Boolean(m));

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <EditHeaderBanner registrationNo={edit.registrationNo} />
      <div className="max-w-7xl mx-auto px-gutter-desktop py-space-section w-full">
        <EditTitleBlock cancelTo={cancelTo} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* data-component="ListingEditForm" */}
          <form className="lg:col-span-8 flex flex-col gap-space-xl min-w-0" noValidate onSubmit={form.handleSubmit}>
            <PhotoUploader
              error={errors.photos ?? errors.authPhoto}
              initialAuthPhoto={edit.initialValues.authPhoto}
              initialPhotos={edit.initialValues.photos}
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
              <AttributeFields
                conditionDisabled={edit.conditionDisabled}
                conditionVisible={edit.conditionVisible}
                onChange={form.setAttribute}
                value={values.attributes}
                variant="edit"
              />
            </LockedCategorySection>
            <EditableFieldsSection
              description={values.description}
              descriptionError={errors.description}
              onAddPrice={form.addPrice}
              onDescriptionChange={(v) => setField('description', v)}
              onPriceChange={(v) => setField('price', v)}
              onTitleChange={(v) => setField('title', v)}
              originalPrice={edit.originalPrice}
              price={values.price}
              pricePolicy={pricePolicy}
              priceError={errors.price}
              step={3}
              title={values.title}
              titleError={errors.title}
              wishCount={edit.wishCount}
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
              errors={messages}
              onDelete={confirmAndRemove}
              submitting={form.submitting || deleting}
            />
          </form>
          <EditGuideSidebar activeCategory={values.mainCategory} />
        </div>
      </div>
      <SubmitToast body={submitCopy.toast.editBody} title={submitCopy.toast.editTitle} visible={form.saved} />
    </div>
  );
};

export default ListingEditForm;
