import XiuIcon from '@/components/XiuIcon';
import {
  assetUpdater,
  Attribute,
  getCanvasInfo,
  getCurrentAsset,
} from '@hc/editor-core';
import styles from './index.modules.less';
import { options } from './constants';
import { clickActionWeblog } from '@/utils/webLog';

const padding = 10;

const AssetPosition = () => {
  const onClick = (direction: string) => {
    let currentAsset = getCurrentAsset();
    if (!currentAsset) return;
    if (currentAsset.parent) {
      currentAsset = currentAsset.parent;
    }
    const { width: canvasW, height: canvasH, scale } = getCanvasInfo();
    const offset = padding / scale;
    const { width, height } = currentAsset?.attribute!;
    const transform = {
      posX: (canvasW - width) / 2,
      posY: (canvasH - height) / 2,
    };
    const attribute: Partial<Attribute> = { textAlign: 'center' };

    direction.split('').forEach(t => {
      switch (t) {
        case 'L':
          transform.posX = offset;
          attribute.textAlign = 'left';
          break;
        case 'R':
          transform.posX = canvasW - width - offset;
          attribute.textAlign = 'right';
          break;
        case 'T':
          transform.posY = offset;
          break;
        case 'B':
          transform.posY = canvasH - height - offset;
          break;
        default:
          break;
      }
    });

    assetUpdater(currentAsset, {
      transform,
      attribute,
    });
    // 点击点位
    clickActionWeblog('tool_assetPosition');
  };

  return (
    <div className={styles.AssetPosition}>
      {options.map(item => (
        <div
          key={item.key}
          className={styles.item}
          onClick={() => onClick(item.key)}
        >
          <XiuIcon
            style={{
              transform: `rotate(${item.iconRotate}deg)`,
              ...item.styles,
            }}
            className={styles.icon}
            type={item.iconType || 'iconfangxiang'}
          />
        </div>
      ))}
    </div>
  );
};

export default AssetPosition;
