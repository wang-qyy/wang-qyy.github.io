import type { AssetClass, CanvasInfo } from '@kernel/typing';
import { useState, useRef, useEffect } from 'react';
import { HandleSvg } from '@kernel/utils/svgHandler';
import { isEmpty } from 'lodash-es';

export function useMaskHandler(
  asset: AssetClass,
  canvasInfo: CanvasInfo,
  isPreviewMovie: boolean,
  prefix: string,
) {
  const MaskContainer = useRef<HTMLInputElement>(null);
  const SvgHandler = useRef<HandleSvg>(null);
  const rt_asset = asset.tempData?.rt_asset;
  const { attribute, assets, meta } = asset;
  const [loading, setLoading] = useState(true);
  // svg viewBox的尺寸
  const [vSize, setVSize] = useState({ viewBoxWidth: 0, viewBoxHeight: 0 });
  const { width, height, rt_svgString, source_key } = attribute;

  function replaceSvg(svg: SVGElement) {
    if (MaskContainer.current) {
      MaskContainer.current.innerHTML = '';
      MaskContainer.current.appendChild(svg);
    }
  }

  function setSvgShowOrHidden(isShow: boolean) {
    const svgHandler = SvgHandler.current;
    // @ts-ignore
    svgHandler?.batchSetAttributes(svgHandler.svgNode, {
      preserveAspectRatio: 'none',
      style: `opacity:${isShow ? 1 : 0};position:absolute;left:0;top:0`,
    });
  }

  function updateClipPathNode(scaleX: number, scaleY: number) {
    const svgHandler = SvgHandler.current;
    if (svgHandler?.svgNode && vSize.viewBoxWidth !== 0) {
      const { clipPathNodes } = svgHandler?.getImgAndClipPathNode();
      if (clipPathNodes) {
        // @ts-ignore
        svgHandler?.batchSetAttributes(clipPathNodes[0], {
          transform: `scale(${scaleX},${scaleY})`,
          transformOrigin: `left top`,
        });
      }
    }
    setLoading(false);
  }

  function buildHandler(svg: string) {
    const handleSvg = new HandleSvg(
      svg,
      `${meta.id}${attribute.resId}${prefix}`,
    );
    // @ts-ignore
    SvgHandler.current = handleSvg;
    if (!(assets && assets.length > 0)) {
      setSvgShowOrHidden(true);
    } else {
      setSvgShowOrHidden(false);
    }
    // @ts-ignore
    setVSize(handleSvg?.getViewBoxSize());
    if (handleSvg.svgNode) {
      replaceSvg(handleSvg.svgNode);
    }
  }

  useEffect(() => {
    if (rt_svgString) {
      buildHandler(rt_svgString);
    }
  }, [rt_svgString, source_key]);

  useEffect(() => {
    if (
      SvgHandler.current &&
      ((assets && assets.length > 0) || !isEmpty(rt_asset))
    ) {
      setSvgShowOrHidden(false);
      // 更新裁剪路径的缩放值
      const scaleX = width / vSize.viewBoxWidth;
      const scaleY = height / vSize.viewBoxHeight;
      updateClipPathNode(scaleX, scaleY);
    } else {
      setSvgShowOrHidden(true);
      updateClipPathNode(1, 1);
    }
  }, [asset?.assets?.length, assets, width, height, vSize, rt_asset]);

  return {
    vSize,
    MaskContainer,
    clipPath: SvgHandler.current?.getClipPathId(),
    loading,
  };
}
