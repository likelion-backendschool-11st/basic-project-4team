import { apiRequest } from './client';
import type { Report, ReportReason, ReportTargetType } from './types';

export interface CreateReportRequest {
  readonly targetType: ReportTargetType;
  readonly targetId: number;
  readonly reason: ReportReason;
  /** 사유가 'etc'면 필수. */
  readonly detail?: string | null;
}

/** 토론글·댓글 신고. 로그인 필요. 같은 대상은 1인 1회(409 ALREADY_REPORTED). */
export const createReport = async (body: CreateReportRequest): Promise<Report> => {
  const { report } = await apiRequest<{ readonly report: Report }>('/reports', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return report;
};
