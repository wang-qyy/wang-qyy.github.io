import React, { useLayoutEffect, useRef } from 'react';
// import { useGlobalContext } from '../../context';
import globalStore from '../../store/globalStore';
import { RulerHandler, RulerHandlerOptions } from './rulerHander';

const Ruler: React.FC<RulerHandlerOptions> = props => {
  const { width, height } = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const rulerHandler = useRef<RulerHandler>();
  // const { paddingLeft } = useGlobalContext();
  const { paddingLeft } = globalStore;

  useLayoutEffect(() => {
    if (!canvas.current) return;

    if (rulerHandler.current) {
      rulerHandler.current.updateOptions({ ...props, paddingLeft });
      return;
    }

    const handler = new RulerHandler(canvas.current, { ...props, paddingLeft });
    handler.drawRuler();
    rulerHandler.current = handler;
  }, [...Object.values(props)]);

  return (
    <div style={{ width, height }}>
      <canvas ref={canvas} />
    </div>
  );
};

export default Ruler;
