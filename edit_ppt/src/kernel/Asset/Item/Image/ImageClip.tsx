import React, { CSSProperties } from 'react';
import { Asset, AssetClass, SVGViewBox, CanvasInfo } from '@kernel/typing';
import { observer } from 'mobx-react';
import { useSvgHandler } from './hooks/useClipImage';

interface ImageShopProps {
  style: CSSProperties;
  asset: AssetClass;
  canvasInfo: CanvasInfo;
}

const ImageClip = observer(({ asset, style }: ImageShopProps) => {
  const { container } = asset.attribute;

  function setSvgViewBox(viewBox: SVGViewBox) {
    setTimeout(() => {
      asset.setContainerViewBox(viewBox);
    });
  }

  function setSvgString(svgString: string) {
    if (svgString !== container?.rt_svgString) {
      asset.replaceContainerSVG(svgString);
    }
  }

  const { SvgContainer } = useSvgHandler({
    asset,
    setSvgViewBox,
    setSvgString,
  });
  return (
    <div style={style}>
      <div ref={SvgContainer} />
    </div>
  );
});

export default ImageClip;
