import { useMemo, PropsWithChildren } from 'react';
import { useSize } from 'ahooks';

import { Skeleton } from '@/components/Skeleton';
import { getInit } from '@/store/reducer/templateInfo';
import { getScale } from '../../pages/Content/Main/CanvasScale/handler';

export default function CanvasSkeleton({
  children,
  loading,
}: PropsWithChildren<{ loading: boolean }>) {
  const containerSize = useSize(
    document.querySelector('.xiudodo-main') as HTMLDivElement,
  );

  const { canvasInfo } = getInit();

  const canvasSize = useMemo(() => {
    const { width, height } = canvasInfo;
    if (width && height && containerSize.width) {
      const scale = getScale(canvasInfo, containerSize);

      return {
        width: width * scale,
        height: height * scale,
      };
    }

    return { width: 0, height: 0 };
  }, [
    containerSize.height,
    containerSize.width,
    canvasInfo.height,
    canvasInfo.width,
  ]);

  return (
    <>
      {loading ? (
        <Skeleton
          style={{
            ...canvasSize,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
          }}
        />
      ) : (
        children
      )}
    </>
  );
}
