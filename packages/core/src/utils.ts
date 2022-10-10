import { first, Observable, skip } from "rxjs";

/**
 * Partitions an Observable into two: (the first response) and (the rest)
 */
export const behead = (obs: Observable<any>): Observable<any>[] => {
  return [obs.pipe(first()), obs.pipe(skip(1))];
}