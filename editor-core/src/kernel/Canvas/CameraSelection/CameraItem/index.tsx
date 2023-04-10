import {
  getCanvasInfo,
  getCurrentCamera,
  getPreTemplate,
  getTemplateList,
  setAssetActiveHandler,
} from '@/kernel/store';
import TemplateState from '@/kernel/store/assetHandler/template';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import { Camera } from '@/kernel/typing';
import { mouseMoveDistance } from '@/kernel/utils/single';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo, useRef } from 'react';
import { useCamera } from '../hooks';

const CameraItem = ({
  data,
  index,
  template,
}: {
  data: CameraState;
  index: number;
  template: TemplateState;
}) => {
  const currentCamera = getCurrentCamera();
  const { style, styleScale, isTimeChoosed } = useCamera(data);
  const { scale, width: canvasWidth, height: canvasHeight } = getCanvasInfo();
  const templateList = getTemplateList();
  // 初始数据缓存
  const originCamera = useRef<Camera>();
  /**
   * 检查移动的位置是否超出画布
   * @param left
   * @param top
   */
  const checkLimitPosition = (
    left: number,
    top: number,
    width: number,
    height: number,
  ) => {
    if (left < 0) {
      left = 0;
    }
    if (top < 0) {
      top = 0;
    }
    if (left + width > canvasWidth) {
      left = canvasWidth - width;
    }
    if (top + height > canvasHeight) {
      top = canvasHeight - height;
    }
    return {
      left,
      top,
    };
  };
  // 移动镜头
  const moveCamera = (e: MouseEvent) => {
    e.stopPropagation();

    setAssetActiveHandler.setEditCamera(data);
    originCamera.current = data.getCameraCloned();

    mouseMoveDistance(
      e,
      (x: number, y: number) => {
        if (originCamera.current) {
          const { posX, posY } = originCamera.current;
          const position = checkLimitPosition(
            posX + x / scale,
            posY + y / scale,
            data.camera.width,
            data.camera.height,
          );
          data.update({
            ...data.camera,
            posX: position.left,
            posY: position.top,
          });
        }
      },
      () => {},
    );
  };

  const Title = () => {
    let tmpIndex = index;
    let num = 0;

    const cIndex = templateList.findIndex(item => item.id === template.id);
    templateList.forEach((item, i) => {
      if (i < cIndex) {
        num += item.cameras.length;
      }
    });
    tmpIndex += num;
    const style = {
      right: 20 / data.camera.scale,
      top: 20 / data.camera.scale,
    };
    if (tmpIndex === 0) {
      return (
        <div className="camera-item-title" style={style}>
          默认镜头
        </div>
      );
    }
    return (
      <div className="camera-item-title" style={style}>
        镜头{tmpIndex}{' '}
      </div>
    );
  };
  return (
    <div
      className={classNames('hc-core-camera-item', {
        'hc-core-camera-item-current': isTimeChoosed,
        'hc-core-camera-item-choosed': currentCamera?.id === data.id,
      })}
      style={style}
      onMouseDown={moveCamera}
    >
      <Title />
      <div style={styleScale}>
        <div className="hc-camera-item-r-t" />
        <div className="hc-camera-item-l-t" />
        <div className="hc-camera-item-r-b" />
        <div className="hc-camera-item-l-b" />
      </div>
    </div>
  );
};
export default observer(CameraItem);
