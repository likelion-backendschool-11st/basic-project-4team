import React from 'react';
import { Icon } from '../common/Icon';
import { pricingCopy } from '../../data/listingForm';

interface NewUserLimitNoticeProps {
  readonly body: string;
  /** 입력 가격이 제한 이상이면 강조해서 보여줄 문구. */
  readonly overMessage: string | null;
}

/** 신규 가입자 고가 등록 제한 안내 (REQ-POST-018). 가격이 제한 이상이면 오류 색으로 바뀐다. */
export const NewUserLimitNotice: React.FC<NewUserLimitNoticeProps> = ({ body, overMessage }) => (
  // data-component="NewUserLimitNotice"
  <div
    className={`p-space-sm rounded flex items-start gap-2 font-caption text-caption leading-relaxed ${
      overMessage ? 'bg-error-container text-on-error-container ring-1 ring-error' : 'bg-mint-50 text-forest border border-mint-200'
    }`}
    role={overMessage ? 'alert' : undefined}
  >
    <Icon className={`text-[18px] shrink-0 mt-0.5 ${overMessage ? 'text-error' : 'text-primary-container'}`} name="person_alert" />
    <p>
      <strong>{pricingCopy.newUser.strong}</strong>
      {body}
      {overMessage && <strong className="block mt-1 text-error">{overMessage}</strong>}
    </p>
  </div>
);

export default NewUserLimitNotice;
