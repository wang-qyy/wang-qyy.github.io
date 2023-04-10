import React, { CSSProperties, useRef } from 'react';
import { Asset } from '@kernel/typing';
import { observer } from 'mobx-react';
import { useSvgHandler } from './hooks/useClipImage';

interface ImageShopProps {
  style: CSSProperties;
  asset: Asset;
}
/**
 * @description 兼容裁剪、滤镜、特效的图片处理方案
 */
const ImageShop = observer(({ asset, style }: ImageShopProps) => {
  const ImageCanvasRef = useRef<HTMLCanvasElement>(null);
  const ImageEffectRef = useRef<HTMLCanvasElement>(null);
  return (
    <div style={style}>
      <canvas ref={ImageCanvasRef} width={style.width} height={style.height} />
      <canvas
        ref={ImageEffectRef}
        width={style.width}
        height={style.height}
        // 此canvas暂时不显示，如果出现特效数据，再手动显示
        style={{ display: 'none' }}
      />
    </div>
  );
});

export default ImageShop;
