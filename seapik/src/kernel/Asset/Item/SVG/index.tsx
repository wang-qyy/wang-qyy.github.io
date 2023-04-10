import React, { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useUpdate } from 'ahooks';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import { gradientId } from '@kernel/utils/idCreator';
import { deepCloneJson } from '@kernel/utils/single';
import { getStyles, useSvgHelper } from './utils';

const SVG = observer(({ asset, canvasInfo }: AssetItemProps) => {
  const { assetElementStyle, FlipStyle } = getStyles(asset, canvasInfo.scale);
  const svgContent = useRef<HTMLDivElement>(null);
  const { setSVGHandler, hasSvg, svgHandlerInstance } = useSvgHelper({
    asset,
  });
  const { resId, width, height, rt_svgString, svgStretch, svgStrokes, picUrl } =
    asset.attribute;

  const update = useUpdate();
  const colorFormat = useMemo(() => {
    const deepColor = deepCloneJson(asset.attribute?.colors);
    if (deepColor) {
      Object.keys(deepColor).forEach((key) => {
        if (!deepColor[key]?.id && deepColor[key]) {
          deepColor[key] = {
            // @ts-ignore
            id: gradientId(),
            color: deepColor[key],
          };
        }
      });
    }
    return { deepColor };
  }, [asset.attribute?.colors]);
  const colors = colorFormat.deepColor;

  useEffect(() => {
    if (svgHandlerInstance && rt_svgString) {
      try {
        svgHandlerInstance.replaceSvg(
          rt_svgString,
          `${resId}`,
          svgStretch,
          width,
          height,
          asset.id,
        );

        svgHandlerInstance.updateColorNode();
        // 解析描边数据信息
        svgHandlerInstance.analySvgStroke();
        if (colors) {
          // @ts-ignore
          svgHandlerInstance.setColor(colors, resId);
        }
        if (svgStrokes) {
          svgHandlerInstance.setStroke(svgStrokes, width, height, asset);
        }

        svgHandlerInstance.transform(width, height, asset, 1);

        const viewBox = svgHandlerInstance.getSVGViewBox();
        const colorsSvg = svgHandlerInstance.getSVGColors();
        const svgStrokeAnaly = svgHandlerInstance.getSVGStrokes();
        if (viewBox) {
          asset?.setSVGViewBox?.(viewBox);
        }
        const svgStretchSet = svgHandlerInstance.getSVGStretch();
        if (svgStretchSet) {
          asset?.setSVGStretch?.(svgStretchSet);
        }
        if (colorsSvg) {
          // @ts-ignore
          svgHandlerInstance.setColor(colorsSvg, resId);
          asset?.setSVGColors?.(colorsSvg);
        }
        if (svgStrokeAnaly) {
          asset?.setSVGStrokes?.(svgStrokeAnaly);
        }
      } catch (e: any) {
        console.error(e);
      }
    }
  }, [rt_svgString, svgHandlerInstance]);

  useEffect(() => {
    if (svgHandlerInstance && hasSvg() && colors) {
      // @ts-ignore
      svgHandlerInstance.setColor(colors, resId);

      const colorsSvg = svgHandlerInstance.getSVGColors();

      if (colorsSvg) {
        // @ts-ignore
        const newSvgString = svgHandlerInstance.xmlToString(
          svgHandlerInstance.SVGDom,
        );
        if (rt_svgString !== newSvgString) {
          asset?.setSVGColors?.(colorsSvg);
        }
      }
    }
  }, [colors, svgHandlerInstance]);
  useEffect(() => {
    if (svgHandlerInstance && hasSvg() && svgStrokes) {
      // @ts-ignore
      svgHandlerInstance.setStroke(svgStrokes, width, height, asset);

      const svgStrokeAnaly = svgHandlerInstance.getSVGStrokes();

      if (svgStrokeAnaly) {
        // @ts-ignore
        const newSvgString = svgHandlerInstance.xmlToString(
          svgHandlerInstance.SVGDom,
        );
        if (rt_svgString !== newSvgString) {
          asset?.setSVGStrokes?.(svgStrokeAnaly);
        }
      }
      const svgStretchSet = svgHandlerInstance.getSVGStretch();
      if (svgStretchSet) {
        asset?.setSVGStretch?.(svgStretchSet);
      }
    }
  }, [svgStrokes, svgHandlerInstance]);

  // 在dom结构加载完成后，初始化svg处理对象
  useLayoutEffect(() => {
    if (svgContent.current) {
      setSVGHandler(svgContent.current);
      update();
    }
  }, []);
  // 当source_key发生变化，需要重新获取新svg
  return (
    <div className="assetElement" style={assetElementStyle}>
      <div style={FlipStyle}>
        <div
          ref={svgContent}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
});
export default SVG;
