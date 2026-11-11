import React from 'react';
import type { RankingProduct } from '../../data/home';
import { toneFrameClasses, toneTitleClasses } from './tones';

interface ProductVisualProps {
  readonly visual: RankingProduct['visual'];
}

const shapeClasses: Record<RankingProduct['visual']['shape'], string> = {
  card: 'w-24 h-32 border-2 rounded-lg shadow-sm p-1',
  box: 'w-32 h-20 border rounded-lg',
  circle: 'w-28 h-28 border-2 rounded-[9999px] shadow-inner',
};

/** Placeholder product illustration (card / shoebox / watch dial) from the wireframe. */
export const ProductVisual: React.FC<ProductVisualProps> = ({ visual }) => (
  <div className="h-36 bg-canvas-soft rounded flex items-center justify-center p-3 mb-3 relative overflow-hidden group-hover:bg-mint-50 transition">
    <div
      className={`flex flex-col items-center justify-center text-center ${shapeClasses[visual.shape]} ${
        visual.shape === 'circle' ? 'border-outline bg-canvas' : toneFrameClasses[visual.tone]
      }`}
    >
      {visual.shape === 'card' ? (
        <>
          <span className={`text-[9px] font-black uppercase ${toneTitleClasses[visual.tone]}`}>{visual.title}</span>
          <span className="text-2xl mt-1">{visual.emoji}</span>
          {visual.caption && <span className="text-[8px] text-muted mt-2 font-mono">{visual.caption}</span>}
        </>
      ) : (
        <>
          <span className={visual.shape === 'circle' ? 'text-xl' : 'text-2xl'}>{visual.emoji}</span>
          <span className={`${visual.shape === 'circle' ? 'text-[8px]' : 'text-[9px]'} font-bold text-body`}>{visual.title}</span>
        </>
      )}
    </div>
  </div>
);

export default ProductVisual;
