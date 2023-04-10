import { AssetItemProps } from '@kernel/typing';
import { useEffect } from 'react';
import {
  calculateRotatedPointCoordinate,
  getAssetCenterPoint,
} from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { assetUpdater } from '@/kernel/storeAPI';
import { CalcPositionBydirection } from '../util';

const useWhirl = (props: AssetItemProps) => {
  const { asset, canvasInfo, videoStatus } = props;
  const { transform, attribute } = asset;
  const { width, height, stayEffect, startTime, opacity } = attribute;
  const { posX, posY } = transform;
  const { scale } = canvasInfo;
  const { duration = 0, attach } = stayEffect;
  // 图形的中心点
  const point = getAssetCenterPoint(asset);
  const { currentTime } = videoStatus;
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
      assetUpdater(asset, {
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
    width: number,
    height: number,
    left: number,
    top: number,
    speed: number,
    directio: number,
    amplitllde: number,
    current: number,
  ) => {
    // 振距
    const L = Math.min(width, height) * amplitllde;
    // 运动速度
    const v = (4 * speed * L) / 1000;
    // 运动路程
    const s = v * current;
    // 振动段数
    const N = Math.ceil(s / L);
    // 原点距离
    let M = s % L;
    if (N % 2 === 0) M = L - M;
    // 判断所处区域
    const district = N % 4;
    const result = CalcPositionBydirection(left, top, M, directio);
    // 取对称点
    if (district === 0 || district === 3) {
      result.left = 2 * left - result.left;
      result.top = 2 * left - result.top;
    }
    return result;
  };
  // 计算旋转角度
  const calcRotate = (time: number, speed: number, ccw: boolean) => {
    let rotate = 0;
    rotate = ((time * 360 * speed) / 1000) % 360;
    // 逆时针
    if (!ccw) {
      rotate -= 360;
    }
    return rotate;
  };
  useEffect(() => {
    if (
      currentTime <= startTime + duration &&
      currentTime >= startTime &&
      attach
    ) {
      const { position, speed, ccw, direction, amplitllde } = attach?.data;
      if (attach?.type == 'Whirl') {
        // 计算旋转角度
        const rotate = calcRotate(currentTime - startTime, speed, ccw);
        // 计算样式
        calcStyle(rotate, position);
      } else {
        getPosition(
          width,
          height,
          posX,
          posY,
          speed,
          direction,
          amplitllde,
          currentTime - startTime,
        );
      }
    }
  }, [currentTime, posX, posY, width, height, scale]);
  return {};
};
export default useWhirl;
