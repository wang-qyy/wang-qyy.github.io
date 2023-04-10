import type { AssetClass } from '@kernel/typing';
import { useState, useRef, useEffect } from 'react';
import { CacheFetch } from '@kernel/utils/single';
import { HandleSvg } from '@kernel/utils/svgHandler';
import { getCanvasInfo } from '@/kernel/store';

export function useMaskHandler(asset: AssetClass) {
  const { scale } = getCanvasInfo();
  const MaskContainer = useRef<HTMLInputElement>(null);
  const SvgHandler = useRef<HandleSvg>(null);
  const { attribute, meta } = asset;
  // svg viewBox的尺寸
  const [vSize, setVSize] = useState({ viewBoxWidth: 0, viewBoxHeight: 0 });
  // 缩放值
  const [vScale, setVScale] = useState({ scaleX: -1, scaleY: -1 });

  const { rt_svgString = '', width, height, source_key } = attribute;
  const [clipPath, setClipPath] = useState('');

  function replaceSvg(svg: SVGElement) {
    if (MaskContainer.current) {
      MaskContainer.current.innerHTML = '';
      MaskContainer.current.appendChild(svg);
    }
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
  }
  function setSvgShowOrHidden(isShow: boolean) {
    const svgHandler = SvgHandler.current;
    // @ts-ignore
    svgHandler?.batchSetAttributes(svgHandler.svgNode, {
      preserveAspectRatio: 'none',
      style: `opacity:${isShow ? 1 : 0};position:absolute;`,
    });
  }

  function buildHandler(svgStr: string) {
    const handleSvg = new HandleSvg(svgStr, `${meta.id}${attribute.resId}`);
    // @ts-ignore
    SvgHandler.current = handleSvg;
    if (handleSvg.svgNode) {
      replaceSvg(handleSvg.svgNode);
    }
    // @ts-ignore
    setVSize(handleSvg?.getViewBoxSize());
    // @ts-ignore
    const { viewBoxWidth, viewBoxHeight } = handleSvg?.getViewBoxSize();
    setVScale({
      scaleX: width / viewBoxWidth,
      scaleY: height / viewBoxHeight,
    });
    setSvgShowOrHidden(false);
    setClipPath(SvgHandler.current?.getClipPathId());
  }

  // todo 待优化 by huzhangrong
  function getSvgString() {
    const svgCacheFetch = new CacheFetch('');
    // @ts-ignore
    svgCacheFetch.getData(source_key, undefined, source_key).then(res => {
      if (res?.stat !== 0 && res?.msg) {
        buildHandler(res?.msg);
      }
      console.error(`SVG asset failed to load，URL:${source_key}`);
    });
  }

  useEffect(() => {
    if (rt_svgString && rt_svgString !== 'loading') {
      buildHandler(rt_svgString);
    } else {
      getSvgString();
    }
  }, [rt_svgString, source_key]);
  useEffect(() => {
    if (SvgHandler.current) {
      setSvgShowOrHidden(false);
      // 更新裁剪路径的缩放值
      const scaleX = width / vSize.viewBoxWidth;
      const scaleY = height / vSize.viewBoxHeight;
      updateClipPathNode(scaleX * scale, scaleY * scale);
    } else {
      setSvgShowOrHidden(true);
      updateClipPathNode(1, 1);
    }
  }, [width, height, vSize]);

  return {
    vSize,
    vScale,
    MaskContainer,
    clipPath,
  };
}
