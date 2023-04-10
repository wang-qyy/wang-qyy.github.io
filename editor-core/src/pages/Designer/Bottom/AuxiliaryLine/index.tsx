import { useRef } from 'react';

import { useUpdateEffect } from 'ahooks';
import { getAlignAsset } from '@/store/adapter/useDesigner';
import { calcTimeToPx } from '@/pages/Designer/Bottom/handler';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import {
  setDragOffset,
  useAssetDragStatus,
  clearDragStatus,
} from '@/store/adapter/useAssetDrag';

function mouseMoveDistance(
  cb: (
    distanceX: number,
    distanceY: number,
    mousePosition: { left: number; top: number },
  ) => void,
  finish?: (distanceX: number, distanceY: number) => void,
) {
  let origin: { x: number; y: number };

  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;
    if (!origin) {
      origin = {
        x: currentX,
        y: currentY,
      };
    }
    // 鼠标当前的位置
    const MousePosition = {
      // @ts-ignore
      left: event.pageX,
      // @ts-ignore
      top: event.pageY,
    };
    cb && cb(currentX - origin.x, currentY - origin.y, MousePosition);
  };
  const removeEventListener = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('mousemove', mouseMove);
  };

  const mouseUp = (event: MouseEvent) => {
    if (origin) {
      const currentX = event.clientX;
      const currentY = event.clientY;

      finish && finish(currentX - origin.x, currentY - origin.y);
    }
    removeEventListener();
  };

  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
  return removeEventListener;
}

export default function AuxiliaryLine() {
  const assetAlign = getAlignAsset();

  // const { isDragging } = useAssetDragStatus();

  const unitWidth = useGetUnitWidth();

  function getAuxiliaryLinePosition(time: number) {
    return calcTimeToPx(time, unitWidth) + 64;
  }
  // const removeEventListener = useRef<() => void>();
  // useUpdateEffect(() => {
  //   if (isDragging) {
  //     removeEventListener.current = mouseMoveDistance(
  //       (x, y) => {
  //         if (x || y) {
  //           setDragOffset({ x, y });
  //         }
  //       },
  //       () => {
  //         clearDragStatus();
  //       },
  //     );
  //   } else {
  //     removeEventListener.current?.();
  //   }
  // }, [isDragging]);

  return (
    <>
      {assetAlign?.map(
        line =>
          line && (
            <div
              key={`line_${line}`}
              className="asset-auxiliary-line"
              style={{
                position: 'absolute',
                height: '100%',
                borderLeft: '1px dashed #5A4CDB',
                zIndex: 1000,
                left: getAuxiliaryLinePosition(line),
              }}
            />
          ),
      )}
    </>
  );
}
