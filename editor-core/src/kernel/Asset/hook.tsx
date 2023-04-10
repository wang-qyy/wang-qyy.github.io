import { CubicBezierAtTime } from '@/kernel/utils/pathAnimation';
import { useEffect, CSSProperties, useState } from 'react';
import {
  fromString,
  inverse,
  compose,
  toCSS,
  Matrix,
  fromTransformAttribute,
  fromDefinition,
} from 'transformation-matrix';
import { AssetProps } from '.';
import { getCanvasInfo, getTemplateList } from '../store';
import CameraState from '../store/assetHandler/template/camera';
import { Camera } from '../typing';
import { deepCloneJson } from '../utils/single';

function stringToMatrix(transformString: string) {
  const atest = toCSS(
    compose(fromDefinition(fromTransformAttribute(transformString))),
  );
  return atest;
}
/**
 * 获取默认镜头尺寸
 * @returns
 */
function getDefaultCamera() {
  const { width, height } = getCanvasInfo();
  return new CameraState({
    width,
    height,
    scale: 1,
    startTime: 0,
    endTime: 0,
    easing: 'linear',
    posX: 0,
    posY: 0,
  });
}
/**
 * 计算播放的进度
 * @param currentTime 当前已经播放的时间
 * @param easing  速度曲线
 * @param duration 动画总时长
 * @returns
 */
function calcPercent(currentTime: number, easing: number, duration: number) {
  // 播放时间在动画时间以内
  const p = CubicBezierAtTime(currentTime / duration, easing, duration);
  return p;
}
/**
 * 计算当前播放的镜头
 * @param cameras 所有镜头
 * @param currentTime 当前时间
 */
export function calcCurrentCamera(cameras: CameraState[], currentTime: number) {
  const resultDefault = {
    last: {
      camera: getDefaultCamera(),
      index: -1,
    },
    current: { camera: getDefaultCamera(), index: -1 },
    next: { camera: getDefaultCamera(), index: -1 },
  };
  const result = deepCloneJson(resultDefault);
  for (let index = 0; index < cameras.length; index++) {
    const item = cameras[index];
    const { startTime, endTime } = item.camera;
    // 处于某个镜头时间
    if (startTime <= currentTime && endTime >= currentTime) {
      result.current = {
        camera: item,
        index,
      };
      if (index === 0) {
        result.last = resultDefault.last;
      } else {
        result.last = {
          camera: cameras[index - 1],
          index: index - 1,
        };
      }
      result.next = resultDefault.next;
      break;
    }
    if (startTime > currentTime && index === 0) {
      // 没开始播放
    } else if (currentTime > endTime) {
      // 播放结束
      if (index === 0 && index !== cameras.length - 1) {
        result.last = { camera: item, index };
        result.current = resultDefault.current;
        result.next = {
          camera: cameras[index + 1],
          index: index + 1,
        };
        // console.log('执行1=======', result);
      } else if (index === cameras.length - 1) {
        result.last = {
          camera: cameras[index - 1],
          index: index - 1,
        };
        result.current = {
          camera: item,
          index,
        };
        result.next = {
          camera: item,
          index,
        };
        // console.log('执行2=======', result);
      } else {
        result.current = resultDefault.current;
        result.last = {
          camera: item,
          index,
        };
        result.next = {
          camera: cameras[index + 1],
          index: index + 1,
        };
        // console.log('执行3=======', result);
      }
    }
  }
  // console.log('result==========', result, currentTime);
  return result;
}
/**
 * 根据镜头计算图片放大的位置信息
 * @param camera
 */
function getCameraInnerSize(camera: Camera) {
  return {
    x: camera.posX * camera.scale,
    y: camera.posY * camera.scale,
  };
}
/**
 *获取2个相邻镜头的距离信息
 * @param cameras
 * @param currentIndex
 */
function getPointByAdjacentCamera(a: CameraState, b: CameraState) {
  const innerA = getCameraInnerSize(a.camera);
  const innerB = getCameraInnerSize(b.camera);
  return {
    before: innerA,
    after: innerB,
    dis: {
      x: innerB.x - innerA.x,
      y: innerB.y - innerA.y,
    },
  };
}
export const useCameras = (props: AssetProps) => {
  const {
    templateIndex,
    manualPreview,
    videoStatus,
    showOnly,
    isTranstionRender = false,
  } = props;
  const { currentTime, playStatus } = videoStatus;
  //   所有的片段数据
  const templateList = getTemplateList();
  //   当前片段
  const currentTemplate = templateList[templateIndex];
  //   当前片段的所有镜头数据
  const { cameras = [] } = currentTemplate;
  // 当前样式信息
  const [style, setStyle] = useState<CSSProperties | null>({});
  // 是否处于播放中  手动播放 也为播放
  const isPlaying = playStatus === 1 || manualPreview || isTranstionRender;
  const calcDistance = (time: number) => {
    const cameraMap = calcCurrentCamera(cameras, time);
    // console.log('当前播放的镜头====', cameraMap, time);
    if (cameraMap.current.index !== -1) {
      const current = cameraMap.current.camera;
      const currentScale = current.camera.scale;
      const innerCurrent = getCameraInnerSize(current.camera);
      const tmpStyle: CSSProperties = {
        transform: `scale(${currentScale}) translateZ(0px)`,
        left: -innerCurrent.x,
        top: -innerCurrent.y,
      };
      const stringStyle = `scale(${currentScale}) translate(${
        -innerCurrent.x / currentScale
      },${-innerCurrent.y / currentScale})`;
      setStyle({
        transform: `${stringToMatrix(stringStyle)} translateZ(0px)`,
      });
      return;
      // 正在播放某一个镜头
    }
    if (cameraMap.last.index !== -1 && cameraMap.next.index !== -1) {
      const last = cameraMap.last.camera;
      const { endTime: endTimeLast, scale: scaleLast } = last.camera;
      const next = cameraMap.next.camera;
      const { startTime: startTimeNext, scale: scaleNext } = next.camera;
      // 正处于2个镜头之间 执行移动过程

      // 距离差值
      const { before, dis: center } = getPointByAdjacentCamera(last, next);
      // 缩放差值
      const scaleDis = scaleNext - scaleLast;

      // 2个镜头移动的总时长
      const duration = startTimeNext - endTimeLast;

      // 当前动画时间
      const nowTime = time - endTimeLast;

      // 当前执行运动过程的百分比
      const p = calcPercent(nowTime, 1, duration);

      // 当前缩放值
      const currentScale = scaleLast + scaleDis * p;

      // 当前节点的中心点
      const currentCenter = {
        x: before.x + center.x * p,
        y: before.y + center.y * p,
      };
      const tmpStyle: CSSProperties = {
        transform: `scale(${currentScale}) translateZ(0px)`,
        left: -currentCenter.x,
        top: -currentCenter.y,
      };
      const stringStyle = `scale(${currentScale}) translate(${
        -currentCenter.x / currentScale
      },${-currentCenter.y / currentScale})`;
      setStyle({
        transform: `${stringToMatrix(stringStyle)} translateZ(0px)`,
      });
      return;
    }
    setStyle({});
  };
  useEffect(() => {
    if (isPlaying && !showOnly) {
      calcDistance(currentTime);
    } else {
      setStyle({});
    }
  }, [currentTime, isPlaying]);
  return { style };
};
