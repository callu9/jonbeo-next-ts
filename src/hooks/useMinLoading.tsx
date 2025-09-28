import { useEffect, useRef, useState } from "react";

/**
 * Skeleton UI를 위한 훅입니다.
 * 로딩이 완료되었더라도, 최소 minMs만큼은 로딩 화면을 유지할 수 있도록 합니다.
 * @param loading 로딩 여부
 * @param minMs 최소 로딩 화면 유지 시간
 * @returns
 */
export function useMinLoading(loading: boolean, minMs = 250) {
  const [show, setShow] = useState(false);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      startRef.current = performance.now();
      setShow(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      const elapsed = startRef.current ? performance.now() - startRef.current : 0;
      const remain = Math.max(minMs - elapsed, 0);
      timerRef.current = window.setTimeout(() => setShow(false), remain);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading, minMs]);

  return show;
}
