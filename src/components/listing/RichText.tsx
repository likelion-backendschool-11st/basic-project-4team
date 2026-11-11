import React from 'react';
import type { DescriptionParagraph, DescriptionSegment } from '../../data/listing';

interface RichTextProps {
  /** Inline segments (one line). */
  readonly segments?: readonly DescriptionSegment[];
  /** Paragraphs → lines (joined with <br />) → segments. */
  readonly paragraphs?: readonly DescriptionParagraph[];
}

interface SegmentsProps {
  readonly segments: readonly DescriptionSegment[];
}

const Segments: React.FC<SegmentsProps> = ({ segments }) => (
  <>
    {segments.map((seg, i) => (seg.strong ? <strong key={i}>{seg.text}</strong> : <React.Fragment key={i}>{seg.text}</React.Fragment>))}
  </>
);

/** Renders data-driven rich text without dangerouslySetInnerHTML. */
export const RichText: React.FC<RichTextProps> = ({ segments, paragraphs }) => {
  if (segments) return <Segments segments={segments} />;
  return (
    <>
      {paragraphs?.map((lines, p) => (
        <p key={p}>
          {lines.map((line, l) => (
            <React.Fragment key={l}>
              {l > 0 && <br />}
              <Segments segments={line} />
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
};

export default RichText;
