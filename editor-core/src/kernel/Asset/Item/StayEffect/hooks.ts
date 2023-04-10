import { AssetItemProps } from '@kernel/typing';
import { useCreation } from 'ahooks';
import { useEffect, useState, CSSProperties, useRef, useMemo } from 'react';
import {
  calculateRotatedPointCoordinate,
  getAssetCenterPoint,
} from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import {
  polyline2path,
  restorePointsRelativeCanvas,
  polyline2Curve,
} from '@/kernel/utils/pathAnimation';
import Raphael from 'raphael';
import { toJS } from 'mobx';
import { CalcPositionBydirection, CubicBezierAtTime } from './util';
// 旋转和抖动动画
const useWhirl = (props: AssetItemProps) => {
  const { asset, isPreviewMovie } = props;
  const { transform, attribute } = asset;
  const { width, height, opacity = 100 } = attribute;
  const { posX, posY, rotate } = transform;
  // 图形的中心点
  const point = getAssetCenterPoint(asset);
  const [style, setStyle] = useState<any>({});
  /**
   * 旋转动画计算样式
   * @param rotate
   */
  const calcStyle = (
    rotate: number,
    position: { left: number; top: number },
  ) => {
    if (position) {
      // 旋转中心
      const center = {
        x: posX + width * position.left,
        y: posY + height * position.top,
      };
      const coordinate = calculateRotatedPointCoordinate(point, center, rotate);
      setStyle({
        width,
        height,
        opacity,
        posX: coordinate.x - width / 2,
        posY: coordinate.y - height / 2,
        rotate,
      });
      if (!isPreviewMovie) {
        asset.setTempData({
          rt_style: {
            width,
            height,
            opacity,
            posX: coordinate.x - width / 2,
            posY: coordinate.y - height / 2,
            rotate,
          },
        });
      }
    }
  };
  /**
   * 抖动动画计算样式
   * @param width
   * @param height
   * @param left
   * @param top
   * @param speed
   * @param directio
   * @param amplitllde
   * @param current
   * @returns
   */
  const getPosition = (
    speed: number,
    directio: number,
    amplitllde: number,
    current: number,
  ) => {
    let result = {
      left: posX,
      top: posY,
    };
    if (current !== 0) {
      // 振距
      const L = Math.min(width, height) * amplitllde;
      // 运动速度
      const v = (4 * speed * L) / 1000;
      // 运动路程
      const s = v * current;
      const N1 = Math.ceil((s + 1) / L);
      // 振动段数
      const N = Math.ceil(s / L);

      // 离原点距离
      let M = s % L;
      if (N1 > N && N !== 0) {
        M = L;
      }
      if (N % 2 === 0) M = L - M;
      // 判断所处区域
      const district = N % 4;
      result = CalcPositionBydirection(posX, posY, M, directio);
      // 取对称点
      if (district === 0 || district === 3) {
        result.left = 2 * posX - result.left;
        result.top = 2 * posY - result.top;
      }
    }
    setStyle({
      width,
      height,
      opacity,
      posX: result.left,
      posY: result.top,
      rotate,
    });
    if (!isPreviewMovie) {
      asset.setTempData({
        rt_style: {
          width,
          height,
          opacity,
          posX: result.left,
          posY: result.top,
          rotate,
        },
      });
    }
  };
  // 计算旋转角度
  const calcRotate = (time: number, speed: number, ccw: boolean) => {
    let rotate = 0;
    rotate = ((time * 360 * speed) / 1000) % 360;
    // 逆时针
    if (!ccw) {
      rotate = 360 - rotate;
    }
    return rotate;
  };
  return { calcRotate, calcStyle, getPosition, style };
};
// 路径动画
const usePlayPath = (props: AssetItemProps) => {
  const { asset, isPreviewMovie } = props;
  const { transform, attribute } = asset;
  const { width, height, stayEffect, opacity } = attribute;
  const center = getAssetCenterPoint(asset);
  const e = useRef();
  const aniPath = useRef(null);
  const [style, setStyle] = useState<any>({});
  // 构建路径动画信息
  const buildPath = (raphaelBox: any) => {
    if (raphaelBox.current && stayEffect && stayEffect?.graph) {
      const { points, freePathType } = stayEffect?.graph;
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
      if (freePathType === 'bessel') {
        path = polyline2Curve(restorePoints, 1);
      } else {
        path = polyline2path(restorePoints, 1);
      }
      const p = raphaelBox.current.path(path);
      aniPath.current = p;
      // e.current = raphaelBox.current.ellipse(0, 0, 7, 3);
      // e.current.attr({
      //   progress: 0,
      // });
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
    const graph = stayEffect?.graph;
    const realPoint = {
      x: point.x,
      y: point.y,
    };
    const rtPosition = {
      width,
      height,
      posX: realPoint.x - width / 2,
      posY: realPoint.y - height / 2,
      rotate: transform.rotate,
      opacity,
    };
    if (graph?.toBounds && graph?.toBounds.length === 1) {
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
      rtPosition.posX = realPoint.x - rtPosition.width / 2;
      rtPosition.posY = realPoint.y - rtPosition.height / 2;
    }
    setStyle(rtPosition);
    if (!isPreviewMovie) {
      asset.setTempData({
        // @ts-ignore
        rt_style: rtPosition,
      });
    }
  };
  // 更新路径动画路径信息
  const updatePath = (graph: any) => {
    if (aniPath.current && graph) {
      const { points, freePathType } = graph;
      const restorePoints = restorePointsRelativeCanvas(
        points,
        center.x,
        center.y,
      );
      let path;
      // 贝塞尔曲线
      if (freePathType === 'bessel') {
        path = polyline2Curve(restorePoints, 1);
      } else {
        path = polyline2path(restorePoints, 1);
      }
      // 更新路径信息
      aniPath.current.attr({
        path,
      });
    }
  };
  return { aniPath, updatePath, buildPath, styleUpdate, style };
};
/**
 * 计算停留特效样式
 */
const useStayEffectStyle = (props: AssetItemProps) => {
  const { asset, videoStatus, manualPreview, isPreviewMovie } = props;
  const { rt_previewStayEffect, rt_style } = asset.tempData;
  const { transform, attribute } = asset;
  const { width, height, stayEffect, startTime, endTime } = attribute;
  const { posX, posY } = transform;
  const { currentTime, playStatus } = videoStatus;
  // 画布变量
  const raphaelBox = useRef();
  const interval = useRef();
  // 预览时间
  const previewTime = useRef<number>(0);
  const needAni =
    manualPreview || playStatus === 1 || isPreviewMovie || rt_previewStayEffect;

  const {
    calcRotate,
    calcStyle,
    getPosition,
    style: styleWhirl,
  } = useWhirl(props);
  const {
    aniPath,
    buildPath,
    updatePath,
    styleUpdate,
    style: stylePath,
  } = usePlayPath(props);
  // 根据时间设置动画
  const setAnimationByTime = (time: number) => {
    if (stayEffect) {
      const { duration = 0, attach, graph } = stayEffect;
      if ((time <= endTime && time >= startTime) || rt_previewStayEffect) {
        // 旋转和抖动动画
        if (attach) {
          const { position, speed, ccw, direction, amplitude } = attach?.data;
          if (attach?.type === 'Whirl') {
            // 计算旋转角度
            const rotate = calcRotate(time - startTime, speed, ccw);
            // 计算样式
            calcStyle(rotate, position);
          } else {
            getPosition(speed, direction, amplitude, time - startTime);
          }
        }
        // 路径动画
        if (graph && aniPath.current) {
          const { easing, loop } = graph;
          // 不循环播放，大于动画时间 直接返回
          if (!loop && time > startTime + duration) {
            return;
          }
          let percent = ((time - startTime) % duration) / duration;
          if (time - startTime >= duration && percent === 0) {
            percent = 1;
          }
          // 播放时间在动画时间以内
          const p = CubicBezierAtTime(percent, easing, duration);
          if ((time - startTime) % (2 * duration) >= duration && loop) {
            // 反向运动
            styleUpdate(1 - p);
          } else {
            // 正向运动
            styleUpdate(p);
          }
        }
      }
    }
  };
  const endPreview = () => {
    asset.setTempData({
      rt_style: undefined,
      rt_previewStayEffect: false,
    });
    clearInterval(interval.current);
    previewTime.current = 0;
  };
  const preview = () => {
    if (previewTime.current <= endTime) {
      setAnimationByTime(previewTime.current + startTime);
      previewTime.current += 5;
    } else {
      endPreview();
    }
  };
  // 展示的style计算
  const style = useCreation(() => {
    let tmpStyle = stylePath;
    // 当rt_style被清空时，样式也需要清空
    if (!isPreviewMovie && !rt_style) {
      tmpStyle = rt_style;
    }

    if (stayEffect?.attach) {
      if (needAni) {
        tmpStyle = styleWhirl;
      } else {
        tmpStyle = undefined;
      }
    }
    if (tmpStyle?.width) {
      const mainStyle: CSSProperties = {
        position: 'absolute',
        width: tmpStyle.width,
        height: tmpStyle.height,
        left: tmpStyle.posX,
        top: tmpStyle.posY,
        opacity: (tmpStyle.opacity ?? 100) / 100,
      };
      if (tmpStyle.rotate > 0) {
        mainStyle.transform = `rotate(${tmpStyle.rotate}deg)`;
      }
      const styleScale: CSSProperties = {
        transform: `scale(${tmpStyle.width / width},${
          tmpStyle.height / height
        }) translateZ(0px)`,
        transformOrigin: '0 0 0',
      };
      return { calcStyle: mainStyle, styleScale };
    }
    return { calcStyle: undefined, styleScale: undefined };
  }, [JSON.stringify(styleWhirl), JSON.stringify(stylePath), rt_style]);

  useEffect(() => {
    const dom = document.getElementById('hc-path-container');
    // 如果有路径动画信息
    if (!raphaelBox.current && stayEffect?.graph && dom && !aniPath.current) {
      if (!raphaelBox.current) {
        raphaelBox.current = Raphael('hc-path-container', 0, 0);
      }
      if (!aniPath.current) {
        buildPath(raphaelBox);
      }
    }
  }, [stayEffect]);

  useEffect(() => {
    if (raphaelBox.current && aniPath.current && stayEffect) {
      if (stayEffect?.graph) {
        updatePath(stayEffect?.graph);
      }
    }
  }, [stayEffect?.graph?.points, width, height, posX, posY]);

  useEffect(() => {
    if (stayEffect) {
      setAnimationByTime(currentTime);
    }
    // 处于进出场动画的时间
    if (
      (currentTime < startTime || currentTime > endTime || !needAni) &&
      !stayEffect?.graph
    ) {
      asset.setTempData({
        rt_style: undefined,
      });
    }
  }, [currentTime]);

  // 预览
  useEffect(() => {
    if (rt_previewStayEffect) {
      previewTime.current = 0;
      interval.current = setInterval(() => {
        preview();
      }, 1);
    } else {
      clearInterval(interval.current);
    }
    return () => {
      clearInterval(interval.current);
    };
  }, [rt_previewStayEffect]);
  useEffect(() => {
    if (playStatus !== 1) {
      clearInterval(interval.current);
    }
  }, [playStatus]);
  return { style };
};
export default useStayEffectStyle;
