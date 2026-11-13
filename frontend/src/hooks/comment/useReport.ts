import { useCallback, useState } from 'react';
import { ApiError } from '../../api/client';
import { createReport } from '../../api/report';
import type { ReportReason, ReportTargetType } from '../../api/types';
import { REPORT_DETAIL_MAX, reportCopy } from '../../data/comment';

interface ReportTarget {
  readonly type: ReportTargetType;
  readonly id: number;
}

/** 신고 팝업 상태: 대상, 사유, 상세 내용, 전송. 성공하면 팝업을 닫고 notice를 남긴다. */
export const useReport = () => {
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetailState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const open = useCallback((type: ReportTargetType, id: number) => {
    setTarget({ type, id });
    setReason(null);
    setDetailState('');
    setError(null);
    setNotice(null);
  }, []);

  const close = useCallback(() => setTarget(null), []);

  const setDetail = useCallback((value: string) => setDetailState(value.slice(0, REPORT_DETAIL_MAX)), []);

  // 기타(etc)는 상세 내용이 있어야 보낼 수 있다 (서버도 400으로 막는다).
  const canSubmit = reason !== null && (reason !== 'etc' || detail.trim().length > 0) && !submitting;

  const submit = useCallback(async () => {
    if (!target || !reason) return;
    setSubmitting(true);
    try {
      await createReport({ targetType: target.type, targetId: target.id, reason, detail: detail.trim() || null });
      setTarget(null);
      setNotice(reportCopy.done);
    } catch (e) {
      // 409 이미 신고함, 400 본인 글 등 서버 문구를 그대로 보여준다.
      setError(e instanceof ApiError && e.status !== 0 && e.status < 500 ? e.message : reportCopy.submitError);
    } finally {
      setSubmitting(false);
    }
  }, [target, reason, detail]);

  return {
    isOpen: target !== null,
    open,
    close,
    reason,
    setReason,
    detail,
    setDetail,
    canSubmit,
    submitting,
    error,
    submit,
    notice,
    clearNotice: useCallback(() => setNotice(null), []),
  };
};
