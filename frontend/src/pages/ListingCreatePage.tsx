import React from 'react';
import { AttributesSection } from '../components/listing-form/AttributesSection';
import { AuthPhotoPanel } from '../components/listing-form/AuthPhotoPanel';
import { CatalogSearchSection } from '../components/listing-form/CatalogSearchSection';
import { CategorySelectSection } from '../components/listing-form/CategorySelectSection';
import { CreateGuideSidebar } from '../components/listing-form/CreateGuideSidebar';
import { CreateSubmitFooter } from '../components/listing-form/CreateSubmitFooter';
import { DescriptionSection } from '../components/listing-form/DescriptionSection';
import { PhotoUploader } from '../components/listing-form/PhotoUploader';
import { PricingSection } from '../components/listing-form/PricingSection';
import { RegistrationHeader } from '../components/listing-form/RegistrationHeader';
import { SubmitToast } from '../components/listing-form/SubmitToast';
import { TradeOptionsSection } from '../components/listing-form/TradeOptionsSection';
import { emptyListingValues, submitCopy } from '../data/listingForm';
import { useListingForm } from '../hooks/listing-form/useListingForm';

interface ListingCreatePageProps {
  readonly className?: string;
}

/** P-014 판매글 등록 — route `/sell`. */
export const ListingCreatePage: React.FC<ListingCreatePageProps> = ({ className = '' }) => {
  const form = useListingForm(emptyListingValues, { variant: 'create' });
  const { values, errors, setField } = form;

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
                onMainChange={form.setMainCategory}
                onSubChange={(v) => setField('subCategory', v)}
                step={3}
                subCategory={values.subCategory}
              />
              <CatalogSearchSection
                match={values.catalogMatch}
                onQueryChange={(v) => setField('catalogQuery', v)}
                onSearch={form.searchCatalog}
                query={values.catalogQuery}
                step={4}
              />
              <AttributesSection onChange={form.setAttribute} step={5} value={values.attributes} />
              <PricingSection
                onAddPrice={form.addPrice}
                onPriceChange={(v) => setField('price', v)}
                onTitleChange={(v) => setField('title', v)}
                price={values.price}
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
              <CreateSubmitFooter errors={Object.values(errors)} submitting={form.submitting} />
            </form>
            <CreateGuideSidebar activeCategory={values.mainCategory} />
          </div>
        </div>
      </div>
      <SubmitToast body={submitCopy.toast.createBody} title={submitCopy.toast.createTitle} visible={form.submitting} />
    </div>
  );
};

export default ListingCreatePage;
