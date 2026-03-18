import { useMemo, useRef, useState, useEffect } from 'react';
import { useFilters } from '../../contexts/FilterContext';
import { useRenderPerf } from '../../hooks/useRenderPerf';
import { FloatingCard } from './FloatingCard';
import { LanguageDoughnut } from '../charts/LanguageDoughnut';
import { LANGUAGE_CODE_LABELS } from '../../utils/constants';

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#a855f7', '#ef4444', '#ec4899', '#06b6d4', '#f97316', '#6b7280'];
const MIN_PCT = 0.5;
const MAX_NAMED = 4;

export interface LangSegment {
  name: string;
  value: number;
  fill: string;
}

function buildSegmentsFromApi(languages: { code: string; count: number }[]): LangSegment[] {
  const named = new Map<string, number>();
  let otherCount = 0;
  let total = 0;
  for (const l of languages) {
    total += l.count;
    const label = l.code !== 'UX' ? LANGUAGE_CODE_LABELS[l.code] : undefined;
    if (label) {
      named.set(label, (named.get(label) || 0) + l.count);
    } else {
      otherCount += l.count;
    }
  }
  const threshold = (total || 1) * (MIN_PCT / 100);
  const segments: LangSegment[] = [];
  let colorIdx = 0;
  const sorted = Array.from(named.entries()).sort((a, b) => b[1] - a[1]);
  for (const [label, count] of sorted) {
    if (count >= threshold && segments.length < MAX_NAMED) {
      segments.push({ name: label, value: count, fill: COLORS[colorIdx % COLORS.length] });
      colorIdx++;
    } else {
      otherCount += count;
    }
  }
  if (otherCount > 0) {
    segments.push({ name: 'Other', value: otherCount, fill: COLORS[COLORS.length - 1] });
  }
  return segments;
}

export function LanguageCard({ onClose, compact }: { onClose?: () => void; compact?: boolean }) {
  useRenderPerf('LanguageCard');
  const { apiData } = useFilters();

  const segments = useMemo(
    () => apiData ? buildSegmentsFromApi(apiData.aggregations.language) : [],
    [apiData],
  );

  const totalCount = apiData?.totalContacts || 0;

  const legendRef = useRef<HTMLDivElement>(null);
  const [hideOther, setHideOther] = useState(false);

  useEffect(() => {
    const el = legendRef.current;
    if (!el) return;
    setHideOther(false);
    requestAnimationFrame(() => {
      if (!legendRef.current) return;
      setHideOther(legendRef.current.scrollHeight > 36);
    });
  }, [segments]);

  const legendSegments = hideOther ? segments.filter(s => s.name !== 'Other') : segments;

  return (
    <FloatingCard title="Primary Language" className="w-[280px]" onClose={onClose}>
      <div ref={legendRef} className="flex items-center justify-center gap-x-3 gap-y-0.5 px-1 mb-1 flex-wrap min-h-[30px]">
        {legendSegments.map(s => (
          <span key={s.name} className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.fill }} /> {s.name}
          </span>
        ))}
      </div>
      <LanguageDoughnut segments={segments} totalCount={totalCount} height={170} compact={compact} />
    </FloatingCard>
  );
}
