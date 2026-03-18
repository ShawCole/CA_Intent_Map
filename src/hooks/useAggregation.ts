import { useMemo } from 'react';
import { reshapeBuckets, topN, type CountItem } from '../utils/aggregation';
import type { BucketCount } from '../types/dashboard';

/** Reshape API bucket data into chart-ready CountItem[] */
export function useAggregation(
  buckets: BucketCount[] | undefined,
  order?: string[],
  labelMap?: Record<string, string>,
  top?: number,
): CountItem[] {
  return useMemo(() => {
    if (!buckets || buckets.length === 0) return [];
    const items = reshapeBuckets(buckets, order, labelMap);
    return top ? topN(items, top) : items;
  }, [buckets, order, labelMap, top]);
}
