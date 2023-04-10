import { useRef, useEffect } from 'react';

import { isEqual } from 'lodash-es';

export default function useDeepCompareEffect<T>(fn: () => void, deps: T) {
  // 使用一个数字信号控制是否渲染，简化 react 的计算，也便于调试
  const renderRef = useRef<number | any>(0);
  const depsRef = useRef<T>(deps);
  if (!isEqual(deps, depsRef.current)) {
    renderRef.current += 1;
  }
  depsRef.current = deps;
  return useEffect(fn, [renderRef.current]);
}
