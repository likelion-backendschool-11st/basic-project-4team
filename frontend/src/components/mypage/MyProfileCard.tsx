import React from 'react';
import { Link } from 'react-router-dom';
import type { MyActivityCounts, MyProfile } from '../../api/types';
import { ROUTES } from '../../data/layout';
import { myProfileCopy, myStatsCopy } from '../../data/mypage';
import { formatDate, formatPrice } from '../../hooks/listing/listingViewHelpers';
import { Icon } from '../common/Icon';

interface MyProfileCardProps {
  readonly profile: MyProfile;
  readonly counts: MyActivityCounts;
  readonly onEditProfile: () => void;
}

interface StatProps {
  readonly label: string;
  readonly value: number;
}

const Stat: React.FC<StatProps> = ({ label, value }) => (
  <div className="flex flex-col items-center py-space-sm">
    <span className="font-heading-3 text-heading-3 text-ink tabular-nums">{myStatsCopy.count(value)}</span>
    <span className="font-micro text-micro text-muted mt-0.5">{label}</span>
  </div>
);

/** 마이페이지 왼쪽: 프로필 + 거래 숫자. */
export const MyProfileCard: React.FC<MyProfileCardProps> = ({ profile, counts, onEditProfile }) => (
  <section className="border border-hairline-strong rounded-xl bg-canvas overflow-hidden">
    <div className="p-space-lg flex flex-col items-center text-center">
      <span className="w-20 h-20 rounded-[9999px] bg-primary-container text-on-primary flex items-center justify-center text-3xl font-bold select-none">
        {profile.nickname.slice(0, 1)}
      </span>
      <h2 className="mt-space-sm font-heading-3 text-heading-3 text-ink break-all">{profile.nickname}</h2>
      <p className="font-body-sm text-body-sm text-muted">@{profile.loginId}</p>
      <p className="mt-1 font-micro text-micro text-muted flex items-center gap-1 break-all">
        <Icon className="text-[14px]" name="mail" />
        {profile.email ?? myProfileCopy.noEmail}
      </p>
      <p className="mt-0.5 font-micro text-micro text-faint">{myProfileCopy.joinedAt(formatDate(profile.createdAt))}</p>
      <div className="mt-space-md grid grid-cols-2 gap-space-xs w-full">
        <button
          className="border border-hairline-strong text-ink font-ui-sm text-ui-sm py-2 rounded hover:bg-canvas-soft transition-colors"
          onClick={onEditProfile}
          type="button"
        >
          {myProfileCopy.editProfile}
        </button>
        <Link
          className="bg-primary-container hover:bg-primary-deep text-on-primary font-ui-sm text-ui-sm font-bold py-2 rounded transition-colors flex items-center justify-center gap-1"
          to={ROUTES.sell}
        >
          <Icon className="text-[16px]" name="add" />
          {myProfileCopy.sell}
        </Link>
      </div>
    </div>
    <div className="grid grid-cols-4 border-t border-hairline divide-x divide-hairline">
      <Stat label={myStatsCopy.selling} value={counts.selling} />
      <Stat label={myStatsCopy.reserved} value={counts.reserved} />
      <Stat label={myStatsCopy.sold} value={counts.sold} />
      <Stat label={myStatsCopy.purchased} value={counts.purchased} />
    </div>
    <div className="px-space-lg py-space-sm border-t border-hairline bg-mint-50 flex items-center justify-between">
      <span className="font-micro text-micro text-forest">{myStatsCopy.soldAmountLabel}</span>
      <span className="font-ui-label text-ui-label text-forest font-bold tabular-nums">
        {myStatsCopy.won(formatPrice(counts.soldAmount))}
      </span>
    </div>
  </section>
);

export default MyProfileCard;
