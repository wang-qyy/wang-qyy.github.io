import { AssetItemProps } from '@kernel/typing';
import {
  polyline2path,
  restorePointsRelativeCanvas,
  polyline2Curve,
} from '@/kernel/utils/pathAnimation';
import { useRef, useEffect } from 'react';
import Raphael from 'raphael';
import { getAssetCenterPoint } from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { assetUpdater } from '@/kernel/storeAPI';
import { CubicBezierAtTime } from '../util';

const usePlayPath = (props: AssetItemProps) => {
  const { asset, videoStatus, canvasInfo } = props;
  const { transform, attribute } = asset;
  const { width, height, stayEffect, startTime, endTime, opacity } = attribute;
  const { duration = 0, graph = {} } = stayEffect;
  const { currentTime } = videoStatus;
  const center = getAssetCenterPoint(asset);
  const { points = [], freePathType, easing, loop } = graph;
  // 画布变量
  const raphaelBox = useRef();
  const e = useRef();
  const aniPath = useRef(null);
  const animationEndTime = loop ? endTime : startTime + duration;
  // 构建路径动画信息
  const buildPath = () => {
    if (raphaelBox.current && graph) {
      // 清空svg
      raphaelBox.current.clear();
      // 初始化
      const restorePoints = restorePointsRelativeCanvas(
        points,
        center.x,
        center.y,
      );
      let path;
      // 贝塞尔曲线
      if (freePathType == 'bessel') {
        path = polyline2Curve(restorePoints, canvasInfo.scale);
      } else {
        path = polyline2path(restorePoints, canvasInfo.scale);
      }
      const p = raphaelBox.current.path(path);
      aniPath.current = p;
      e.current = raphaelBox.current.ellipse(0, 0, 7, 3);
      e.current.attr({
        progress: 0,
      });
      raphaelBox.current.customAttributes.progress = styleUpdate;
    }
  };
  const styleUpdate = (v: number) => {
    if (aniPath.current) {
      const len = aniPath.current.getTotalLength();
      const point = aniPath.current.getPointAtLength(v * len);
      const transformStyle = `t${[point.x, point.y]}r${point.alpha}`;
      calcRtPosition(point, v);
      return {
        transformStyle,
      };
    }
  };
  /**
   * 更改图层的rt_position
   */
  const calcRtPosition = (point: any, v: number) => {
    const rtPosition = {
      width,
      height,
      posX: point.x / canvasInfo.scale - width / 2,
      posY: point.y / canvasInfo.scale - height / 2,
      rotate: transform.rotate,
      opacity,
    };
    if (graph?.toBounds && graph?.toBounds.length == 1) {
      const end = graph?.toBounds[0];
      const diffWidth = end.width - width;
      const diffHeight = end.height - height;
      const diffRotate = end.rotate - transform.rotate;
      if (opacity && rtPosition.opacity) {
        const diffOpacity = end.opacity - opacity;
        rtPosition.opacity += diffOpacity * v;
      }
      rtPosition.width += diffWidth * v;
      rtPosition.height += diffHeight * v;
      rtPosition.rotate += diffRotate * v;
    }
    assetUpdater(asset, {
      rt_style: rtPosition,
    });
  };
  // 更新路径动画路径信息
  const updatePath = () => {
    if (aniPath.current) {
      const restorePoints = restorePointsRelativeCanvas(
        points,
        center.x,
        center.y,
      );
      let path;
      // 贝塞尔曲线
      if (freePathType == 'bessel') {
        path = polyline2Curve(restorePoints, canvasInfo.scale);
      } else {
        path = polyline2path(restorePoints, canvasInfo.scale);
      }
      // 更新路径信息
      aniPath.current.attr({
        path,
      });
    }
  };

  /** 没什么用了，存放做参考
   * 贝塞尔曲线设置速度
   * https://www.cnblogs.com/Qooo/p/13810032.html
   * */
  const run = (t: number) => {
    if (!raphaelBox.current || !e.current) {
      return;
    }
    const time = setInterval(() => {
      const p = CubicBezierAtTime(t / duration, easing, duration);
      styleUpdate(p);
      t += 16;
      if (t >= startTime + duration) {
        clearInterval(time);
      }
    }, [16]);
  };
  useEffect(() => {
    if (!raphaelBox.current) {
      raphaelBox.current = Raphael('hc-path-container', 0, 0);
    }
    if (!aniPath.current) {
      buildPath();
    }
  }, []);
  useEffect(() => {
    if (raphaelBox.current && aniPath.current) {
      updatePath();
    }
  }, [graph, canvasInfo.scale]);
  useEffect(() => {
    if (
      currentTime <= animationEndTime &&
      currentTime >= startTime &&
      e.current
    ) {
      // 播放时间在动画时间以内
      const p = CubicBezierAtTime(
        ((currentTime - startTime) % duration) / duration,
        easing,
        duration,
      );
      if ((currentTime - startTime) % (2 * duration) >= duration && loop) {
        // 反向运动
        styleUpdate(1 - p);
      } else {
        // 正向运动
        styleUpdate(p);
      }
    }
  }, [currentTime, graph]);

  return { aniPath };
};
export default usePlayPath;
