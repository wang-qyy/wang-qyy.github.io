import { Popover } from 'antd';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
// import { SketchPicker } from 'react-color'
// import { CustomPicker } from 'react-color';

// import { AssetClass } from '@/kernel/typing';
import { getCurrentAsset, useFontColorByObserver } from '@hc/editor-core';
import { RGBAToString } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import DraggableModal from '@/pages/TopToolBar/DragableModal';

import commonStyles from '../common.modules.less';
import styles from './index.modules.less';
import CustomColor from '../../CustomColor';

// { asset }: { asset: AssetClass }

const Color = () => {
  const [color, updateColor] = useFontColorByObserver();
  const [visible, _visible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const currentAsset = getCurrentAsset();

  const getInitPosition = () => {
    const info = buttonRef.current?.getBoundingClientRect();
    return info
      ? { right: window.innerWidth - info.left - 120, top: info.top + 30 }
      : { right: 700, top: 120 };
  };

  useEffect(() => {
    _visible(false);
  }, [currentAsset]);

  return (
    <div className={commonStyles.item}>
      <Popover
        placement="bottom"
        trigger="click"
        visible={visible}
        onVisibleChange={_visible}
        // className={styles.ColorPopover}
        overlayClassName={styles.ColorPopover}
        content={
          <DraggableModal
            visible={visible}
            title="颜色设置"
            onCancel={() => _visible(false)}
            defaultPosition={getInitPosition()}
            className={styles.colorDraggableModal}
            style={{
              width: 'auto',
              height: 'auto',
              background: '#fff',
            }}
          >
            <CustomColor
              color={color ? RGBAToString(color) : color}
              onChange={res => {
                updateColor(res.rgb);
                clickActionWeblog('QuickActions2');
              }}
            />
          </DraggableModal>
        }
      >
        <div
          className={styles.Color}
          ref={buttonRef}
          style={{
            backgroundColor: color
              ? `rgb(${color.r},${color.g},${color.b})`
              : '#fff',
          }}
        />
      </Popover>
    </div>
  );
};

export default observer(Color);
