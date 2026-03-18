import { useMemo } from 'react';
import type { GeoZip } from '../types/dashboard';

/** Build zip → total count map from API geo.zips data */
export function useZipAggregation(zips: GeoZip[] | undefined): Map<string, number> {
  return useMemo(() => {
    const map = new Map<string, number>();
    if (!zips) return map;
    for (const z of zips) {
      if (z.zip && z.total > 0) {
        map.set(z.zip, z.total);
      }
    }
    return map;
  }, [zips]);
}
