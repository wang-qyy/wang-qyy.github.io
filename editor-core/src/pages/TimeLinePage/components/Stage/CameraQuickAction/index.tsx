import { XiuIcon } from '@/components';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import {
  cameraUpdater,
  getCanvasInfo,
  observer,
  toJS,
  useCameraByObeserver,
} from '@hc/editor-core';
import styles from './index.less';

const CameraQuickAction = ({
  currentCamera,
}: {
  currentCamera: CameraState;
}) => {
  const actionHeight = 32; // 操作栏高度
  const actionMargin = 8; // 操作栏距离元素的边距

  const { width: canvasWidth, height: tempHeight, scale } = getCanvasInfo();
  const canvasHeight = tempHeight * scale;
  const { posX, posY, scale: cameraScale } = currentCamera.camera;

  const { removeCamera, inCamera } = useCameraByObeserver();

  const buildStyle = () => {
    let top = posY * scale - (actionHeight + actionMargin);
    // 位置超出画布顶部时，定位到元素下方
    if (top < 0) {
      top = posY * scale + actionMargin;
    }
    // 位置超出画布底部时，定位到画布顶部
    if (top > canvasHeight - actionHeight) {
      top = 0;
    }
    return { left: Math.max(posX, 0) * scale, top };
  };
  const style = buildStyle();
  const options = [
    {
      key: 'fullScreen',
      title: '全屏',
      icon: 'iconquanping1',
      show: cameraScale !== 1,
      iconStyle: {},
      onclick: () => {
        cameraUpdater(currentCamera, {
          ...currentCamera.camera,
          width: canvasWidth,
          height: tempHeight,
          posX: 0,
          posY: 0,
          scale: 1,
        });
        clickActionWeblog('Timeline_camera_fullScreen');
      },
      render: null,
    },
    {
      key: 'delete',
      title: '删除',
      icon: 'iconshanchu',
      iconStyle: {
        fontSize: 14,
      },
      show: true,
      onclick: () => {
        removeCamera(-1, currentCamera);
        clickActionWeblog('Timeline_camera_delete');
      },
      render: null,
    },
  ];
  const currentOptions = options.filter(t => t.show);

  if (!currentOptions.length || !inCamera) return null;
  return (
    <div className={styles['camera-action']} style={style}>
      {currentOptions.map(item => {
        if (item.render) {
          return item.render();
        }
        return (
          <div
            className={styles['camera-action-item']}
            key={item.key}
            onMouseDown={stopPropagation}
            onClick={e => {
              e.stopPropagation();
              item.onclick();
            }}
          >
            <XiuIcon
              type={item.icon}
              className={styles.icon}
              style={item.iconStyle}
            />
            {item.title}
          </div>
        );
      })}
    </div>
  );
};

export default observer(CameraQuickAction);
