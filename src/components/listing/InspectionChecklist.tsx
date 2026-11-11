import React from 'react';
import { Icon } from '../common/Icon';
import type { InspectionPoint } from '../../data/listing';

interface InspectionChecklistProps {
  readonly title: string;
  readonly badge: string;
  readonly points: readonly InspectionPoint[];
}

/** 전문 검수 센터 기준 실물 상태 체결 보증표 (bento grid). */
export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({ title, badge, points }) => (
  <div className="mt-space-xl pt-space-md bg-canvas rounded p-space-md">
    <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
      <h3 className="font-ui-label text-ui-label text-ink flex items-center gap-1.5">
        <Icon className="text-[18px] text-primary" name="gavel" />
        <span>{title}</span>
      </h3>
      <span className="font-caption text-caption text-forest bg-mint-100 px-2 py-0.5 rounded">{badge}</span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
      {points.map((point) => (
        <div key={point.label} className="bg-canvas-soft p-space-xs rounded flex flex-col">
          <span className="font-micro text-micro text-muted">{point.label}</span>
          <span className="font-ui-label text-ui-label text-primary">{point.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default InspectionChecklist;
