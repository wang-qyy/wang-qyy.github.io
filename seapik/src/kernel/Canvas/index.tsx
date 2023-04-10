import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { setCanvasInfo } from '@kernel/store';
import WholeCanvas from '@kernel/Canvas/WholeCanvas';
import Canvas from '@kernel/Canvas/Canvas';
import { config, loadHooks } from '@kernel/utils/config';
import type { CanvasInfo, EventHooks } from '../typing';
import './index.less';

export interface CanvasProps extends EventHooks {
  canvasInfo: CanvasInfo;
  wholeTemplate?: boolean;
}

const Index = observer((props: React.PropsWithChildren<CanvasProps>) => {
  const { canvasInfo, onChange, onError, wholeTemplate = true } = props;
  useEffect(() => {
    setCanvasInfo(canvasInfo);
  }, [canvasInfo.width, canvasInfo.scale, canvasInfo]);

  useEffect(() => {
    loadHooks({
      onChange,
      onError,
    });
  }, []);

  if (wholeTemplate) {
    return <WholeCanvas />;
  }
  return <Canvas />;
});
export default Index;
