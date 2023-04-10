import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { observer } from 'mobx-react';
import { useUpdateEffect, useSize } from 'ahooks';

import {
  recordHistory,
  Canvas,
  getCanvasInfo,
  assetBlur,
  isInCropping,
  endCrop,
  useCanvasScaleByObserver,
} from '@/kernel';

import { getScale, windowBeforeUnload } from '@/utils';

import useShortcuts from '@/hooks/useShortcuts';

import useCanvasInit from './useInitCanvas';

import Controller from './Controller';
import './index.less';

const mockImage = {
  resId: 1,
  width: 1440,
  height: 900,
  image_url:
    'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F5%2F5476e32631957.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1670484679&t=b0a602083e73083f8517d72905c5fccd',
};

function Main() {
  // const [size, setSize] = useState<CanvasInfo>();
  const canvasContainerRef = useRef(null);
  const containerSize = useSize(canvasContainerRef);

  const { update } = useCanvasScaleByObserver();

  // 快捷键
  useShortcuts();

  const { size } = useCanvasInit();

  const canvasInfo = getCanvasInfo();
  const renderCanvasSize = useMemo(() => {
    return {
      width: canvasInfo.width * canvasInfo.scale,
      height: canvasInfo.height * canvasInfo.scale,
    };
  }, [canvasInfo.scale, canvasInfo.width, canvasInfo.height]);

  useUpdateEffect(() => {
    if (
      containerSize?.width &&
      containerSize?.height &&
      canvasInfo.height &&
      canvasInfo.width
    ) {
      const calcScale = getScale(canvasInfo);
      update(calcScale);
    }
  }, [containerSize?.width, containerSize?.height]);

  return (
    <section className="layout-canvas">
      <div
        ref={canvasContainerRef}
        id="canvas_container"
        className="layout-canvas-container"
        onMouseDown={() => {
          if (isInCropping()) {
            endCrop();
          }
          assetBlur();
        }}
      >
        <div style={{ ...renderCanvasSize, margin: 'auto' }}>
          {size && (
            <Canvas
              onChange={(value) => {
                windowBeforeUnload.open();
                recordHistory();
              }}
              canvasInfo={size}
            />
          )}
        </div>
      </div>
      <Controller />
    </section>
  );
}

export default observer(Main);
