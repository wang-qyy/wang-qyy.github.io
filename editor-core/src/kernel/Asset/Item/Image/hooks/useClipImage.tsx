import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { HandleSvg } from '@kernel/utils/svgHandler';
import { AssetClass, SVGViewBox } from '@kernel/typing';

interface SvgHandlerParams {
  asset: AssetClass;
  setSvgViewBox: (viewBox: SVGViewBox) => void;
  setSvgString: (svgString: string) => void;
}

export function useSvgHandler({ asset, setSvgViewBox }: SvgHandlerParams) {
  // const [clipLoading, setClipLoading] = useState(false);
  const SvgContainer = useRef<HTMLInputElement>(null);
  const SvgHandler = useRef<HandleSvg>(null);
  const { attribute, transform } = asset;
  const { container, picUrl } = attribute;

  function replaceSvg(svg: SVGElement) {
    if (SvgContainer.current) {
      SvgContainer.current.innerHTML = '';
      SvgContainer.current.appendChild(svg);
    }
  }

  function updateSvgAttr() {
    const svgHandler = SvgHandler.current;
    if (svgHandler?.svgNode && container && picUrl && picUrl !== 'loading') {
      const {
        width,
        height,
        viewBoxWidth,
        viewBoxHeight,
        viewBoxWidthBack,
        viewBoxHeightBack,
        posX,
        posY,
      } = container;
      const { imageNodes, clipPathNodes } = svgHandler.getImgAndClipPathNode();
      svgHandler.batchSetAttributes(svgHandler.svgNode, {
        width,
        height,
        preserveAspectRatio: 'none',
        // style: `transform: scaleX(${transform.horizontalFlip ? -1 : 1}) scaleY(${transform.verticalFlip ? -1 : 1})`,
        viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
      });
      if (imageNodes[0]) {
        // @ts-ignore
        svgHandler.batchSetAttributes(imageNodes[0], {
          'xlink:href': picUrl,
          preserveAspectRatio: 'none',
          width: attribute.width,
          height: attribute.height,
          x: posX,
          y: posY,
          transform: 'matrix(1 0 0 1 0 0)',
        });
      }

      if (clipPathNodes[0]) {
        // @ts-ignore
        svgHandler.batchSetAttributes(clipPathNodes[0], {
          transform: `scale(${viewBoxWidth / viewBoxWidthBack}, ${
            viewBoxHeight / viewBoxHeightBack
          })`,
        });
      }
    }
  }

  function updateAttr() {
    if (
      container?.width &&
      container?.height &&
      container?.viewBoxWidth &&
      container?.viewBoxHeight
    ) {
      updateSvgAttr();
    }
  }

  /**
   * @description 替换id，防止id重复引起的bug
   * @param svgString
   */
  function formatSvgString(svgString: string) {
    const tempStr = `asset-image-container-${
      new Date().getTime() + Math.random()
    }`;
    let picUrl = svgString;
    const clipPathStr = picUrl.match(/clip-path="url\(#(.+?)\)/)?.[1] || '';
    const xlinkHref = picUrl.match(/xlink:href="#(.+?)"/)?.[1] || '';
    picUrl = picUrl.replace(new RegExp(clipPathStr), tempStr);
    picUrl = picUrl.replace(new RegExp(clipPathStr), tempStr);
    picUrl = picUrl.replace(new RegExp(xlinkHref), `content-${tempStr}`);
    picUrl = picUrl.replace(new RegExp(xlinkHref), `content-${tempStr}`);
    return picUrl;
  }

  useLayoutEffect(() => {
    if (container?.rt_svgString) {
      const svg = formatSvgString(container.rt_svgString);
      const handle = new HandleSvg(svg);
      if (handle.viewBox) {
        setSvgViewBox(handle.viewBox);
      }
      if (handle.svgNode) {
        replaceSvg(handle.svgNode);
      }
      // @ts-ignore
      SvgHandler.current = handle;
      updateAttr();
    }
  }, [container?.rt_svgString]);

  useEffect(() => {
    updateAttr();
  }, [
    container,
    attribute.width,
    attribute.height,
    transform.posX,
    transform.posY,
  ]);

  return {
    SvgContainer,
  };
}
