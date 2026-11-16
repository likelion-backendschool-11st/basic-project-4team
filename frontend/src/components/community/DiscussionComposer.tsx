import React from 'react';
import { discussionComposer as copy } from '../../data/community';
import { useDiscussionComposer, type DiscussionComposerPayload } from '../../hooks/community/useDiscussionComposer';
import { Icon } from '../common/Icon';
import { DiscussionPostForm } from './DiscussionPostForm';

export interface DiscussionComposerProps {
  /** 글 등록. 성공하면 true → 입력을 비운다. */
  readonly onSubmit: (payload: DiscussionComposerPayload) => Promise<boolean>;
  /** 사진 업로드·등록 전에 호출. false면 막는다 (비로그인 팝업). */
  readonly ensureLogin: () => boolean;
  /** 이 품목의 최근 체결가. 희망 체결가 입력 때 비교용. 거래 이력이 없으면 null. */
  readonly marketPrice: number | null;
}

/** 품목 토론방 글쓰기 — 본문(500자) + 사진(최대 4장) + 희망 체결가. 모두 서버에 저장된다. */
export const DiscussionComposer: React.FC<DiscussionComposerProps> = ({ onSubmit, ensureLogin, marketPrice }) => {
  const state = useDiscussionComposer(onSubmit, ensureLogin);

  return (
    /* data-component="QuickPostBox" */
    <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
      <div className="flex gap-space-sm items-start">
        <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-forest font-bold shrink-0">
          <Icon className="text-[20px]" name={copy.avatarIcon} />
        </div>
        <DiscussionPostForm
          ensureLogin={ensureLogin}
          marketPrice={marketPrice}
          state={state}
          submitLabel={copy.submitLabel}
          submittingLabel={copy.submitting}
        />
      </div>
    </section>
  );
};

export default DiscussionComposer;
