import { AssetClass, CanvasInfo, PathBound } from '@/kernel/typing';
import { useCreation } from 'ahooks';
import Raphael from 'raphael';
import { useRef, useEffect, CSSProperties } from 'react';
import {
  polyline2Curve,
  polyline2path,
  restorePointsRelativeCanvas,
} from '@/kernel/utils/pathAnimation';
import {
  getAssetCenterPoint,
  getCenterPointFromSize,
} from '@/kernel/utils/mouseHandler/mouseHandlerHelper';

export const usePathAnimationAsset = (
  asset: AssetClass,
  canvasInfo: CanvasInfo,
) => {
  const { scale } = canvasInfo;
  const { attribute, transform } = asset;
  const { stayEffect } = attribute;
  const { graph } = stayEffect;
  const center = getCenterPointFromSize(
    { x: transform?.posX, y: transform.posY },
    { width: attribute.width, height: attribute.height },
    false,
  );
  const uniqId = 'path-svg';
  const currentSvgPath = useRef();
  // 画布变量
  const raphaelBox = useRef();
  const pathAttr = {
    stroke: '#464161',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 3,
    'stroke-dasharray': '.',
  };
  const getSvgPath = () => {
    return currentSvgPath.current;
  };
  const buildPathFreePath = (pointList: number[][], lineType: string) => {
    if (raphaelBox.current && pointList) {
      const restorePoints = restorePointsRelativeCanvas(
        pointList,
        center.x - graph.x,
        center.y - graph.y,
      );
      const restorePoints2 = restorePointsRelativeCanvas(
        pointList,
        -graph.x,
        -graph.y,
      );
      let setPath = '';
      // 贝塞尔曲线
      if (lineType === 'bessel') {
        setPath = polyline2Curve(restorePoints2, scale);
      } else {
        setPath = polyline2path(restorePoints2, scale);
      }
      if (currentSvgPath.current) {
        // 更新路径信息
        currentSvgPath.current.attr({
          path: setPath,
        });
        // 更新svg框尺寸信息
        raphaelBox.current.setSize(graph.width * scale, graph.height * scale);
      } else {
        // 初始化
        currentSvgPath.current = raphaelBox.current
          .path(setPath)
          .attr(pathAttr);
      }
    }
  };
  useEffect(() => {
    // 自由打点类型
    if (graph) {
      const { points, freePathType, width, height } = graph;
      if (!raphaelBox.current) {
        const paper = Raphael(uniqId, width * scale, height * scale);
        raphaelBox.current = paper;
        paper.clear();
      }
      buildPathFreePath(points, freePathType);
    }
  }, [
    asset.meta,
    scale,
    attribute.width,
    attribute.height,
    transform.posX,
    transform.posY,
    graph?.points,
  ]);
  return {
    getSvgPath,
    buildPathFreePath,
  };
};
export const usePathAnimationAssetStyle = (
  asset: AssetClass,
  canvasInfo: CanvasInfo,
) => {
  const { attribute, transform } = asset;
  const { scale } = canvasInfo;
  const { stayEffect = {}, width, height } = attribute;
  const { graph } = stayEffect;
  const center = getAssetCenterPoint(asset);
  const svgStyle: CSSProperties = useCreation(() => {
    if (graph) {
      return {
        width: graph?.width * scale,
        height: graph?.height * scale,
        left: (graph?.x + center.x) * scale,
        top: (graph?.y + center.y) * scale,
        position: 'absolute',
        zIndex: 2,
      };
    }
    return {};
  }, [
    graph?.x,
    graph?.y,
    graph?.width,
    graph?.height,
    width,
    height,
    transform.posX,
    transform.posY,
    scale,
  ]);
  const startNodeStyle = useCreation(() => {
    return {
      width: width * scale,
      height: height * scale,
      left: transform.posX * scale,
      top: transform.posY * scale,
      position: 'absolute',
      transform: `rotate(${transform.rotate}deg)`,
      zIndex: 1,
    };
  }, [width, height, transform.posX, transform.posY, transform.rotate, scale]);
  const itemPointAssetStyle = (end: PathBound) => {
    const { width: endWidth, height: endHeight, rotate: endRotate } = end;
    const { points = [], x, y } = graph;
    const index = points.length - 1;
    return {
      width: endWidth * scale,
      height: endHeight * scale,
      left: (center.x + points[index][2] - endWidth / 2) * scale,
      top: (center.y + points[index][3] - endHeight / 2) * scale,
      position: 'absolute',
      transform: `rotate(${endRotate}deg)`,
      zIndex: 1,
    };
  };
  const itemPointAssetScale = (end: PathBound) => {
    const { width: endWidth, height: endHeight } = end;
    return {
      x: endWidth / width,
      y: endHeight / height,
    };
  };
  return { svgStyle, startNodeStyle, itemPointAssetStyle, itemPointAssetScale };
};
