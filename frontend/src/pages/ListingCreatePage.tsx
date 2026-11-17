import React from 'react';
import { AttributesSection } from '../components/listing-form/AttributesSection';
import { AuthPhotoPanel } from '../components/listing-form/AuthPhotoPanel';
import { CatalogSearchSection } from '../components/listing-form/CatalogSearchSection';
import { CategorySelectSection } from '../components/listing-form/CategorySelectSection';
import { CreateGuideSidebar } from '../components/listing-form/CreateGuideSidebar';
import { CreateSubmitFooter } from '../components/listing-form/CreateSubmitFooter';
import { DescriptionSection } from '../components/listing-form/DescriptionSection';
import { ItemRequestModal } from '../components/listing-form/ItemRequestModal';
import { LoginRequiredModal } from '../components/itemcommunity/LoginRequiredModal';
import { PhotoUploader } from '../components/listing-form/PhotoUploader';
import { PricingSection } from '../components/listing-form/PricingSection';
import { RegistrationHeader } from '../components/listing-form/RegistrationHeader';
import { SubmitToast } from '../components/listing-form/SubmitToast';
import { TradeOptionsSection } from '../components/listing-form/TradeOptionsSection';
import { emptyListingValues, itemRequestCopy, submitCopy } from '../data/listingForm';
import { useCatalogMapping } from '../hooks/listing-form/useCatalogMapping';
import { useItemRequest } from '../hooks/listing-form/useItemRequest';
import { submitCreateForm } from '../hooks/listing-form/submitListing';
import { useListingForm } from '../hooks/listing-form/useListingForm';
import { usePricePolicy } from '../hooks/listing-form/usePricePolicy';

interface ListingCreatePageProps {
  readonly className?: string;
}

/** P-014 판매글 등록 — route `/sell`. */
export const ListingCreatePage: React.FC<ListingCreatePageProps> = ({ className = '' }) => {
  const form = useListingForm(emptyListingValues, { variant: 'create', onSubmit: submitCreateForm });
  const { values, errors, setField } = form;
  const mapping = useCatalogMapping(form);
  const pricePolicy = usePricePolicy(values.itemId, values.attributes);
  const itemRequest = useItemRequest({ tree: mapping.categoryTree, onExistingItem: mapping.searchExisting });

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <RegistrationHeader />
      <div className="w-full bg-surface-bright py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
            <form className="lg:col-span-8 flex flex-col gap-space-lg min-w-0" noValidate onSubmit={form.handleSubmit}>
              <PhotoUploader
                error={errors.photos}
                initialPhotos={emptyListingValues.photos}
                onPhotosChange={form.setPhotos}
                step={1}
                variant="create"
              />
              <AuthPhotoPanel
                error={errors.authPhoto}
                initialPhoto={emptyListingValues.authPhoto}
                onChange={form.setAuthPhoto}
                step={2}
              />
              <CategorySelectSection
                mainCategory={values.mainCategory}
                mainOptions={mapping.mainOptions}
                onMainChange={mapping.onMainChange}
                onSubChange={mapping.onSubChange}
                status={mapping.categoryStatus}
                step={3}
                subCategory={values.subCategory}
                subOptions={mapping.subOptions}
              />
              <CatalogSearchSection
                error={errors.catalog}
                match={values.catalogMatch}
                onQueryChange={(v) => setField('catalogQuery', v)}
                onRequestItem={() =>
                  itemRequest.open({ main: values.mainCategory, sub: values.subCategory, title: values.catalogQuery })
                }
                onSearch={mapping.onSearch}
                onSelect={mapping.onSelectItem}
                query={values.catalogQuery}
                requestNotice={itemRequest.existingNotice}
                results={mapping.catalog.results}
                selectedItemId={values.itemId}
                status={mapping.catalog.status}
                step={4}
                totalCount={mapping.catalog.totalCount}
              />
              <AttributesSection
                error={errors.condition ?? errors.grading}
                hasItem={values.itemId !== null}
                mainCategory={values.mainCategory}
                onChange={form.setAttribute}
                step={5}
                value={values.attributes}
              />
              <PricingSection
                onAddPrice={form.addPrice}
                onPriceChange={(v) => setField('price', v)}
                onTitleChange={(v) => setField('title', v)}
                price={values.price}
                pricePolicy={pricePolicy}
                priceError={errors.price}
                step={6}
                title={values.title}
                titleError={errors.title}
              />
              <DescriptionSection
                error={errors.description}
                onChange={(v) => setField('description', v)}
                step={7}
                value={values.description}
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
                step={8}
                variant="create"
              />
              <CreateSubmitFooter
                errors={form.submitError ? [...Object.values(errors), form.submitError] : Object.values(errors)}
                submitting={form.submitting || form.saved}
              />
            </form>
            <CreateGuideSidebar activeCategory={values.mainCategory} />
          </div>
        </div>
      </div>
      <SubmitToast body={submitCopy.toast.createBody} title={submitCopy.toast.createTitle} visible={form.saved} />
      {/* 판매글 <form> 밖에 둔다 — 팝업 안의 요청 글쓰기 form이 판매글 form에 중첩되지 않게. */}
      <ItemRequestModal state={itemRequest} />
      <LoginRequiredModal
        {...itemRequestCopy.loginRequired}
        onClose={itemRequest.loginGate.close}
        onConfirm={itemRequest.loginGate.goLogin}
        open={itemRequest.loginGate.open}
      />
    </div>
  );
};

export default ListingCreatePage;
