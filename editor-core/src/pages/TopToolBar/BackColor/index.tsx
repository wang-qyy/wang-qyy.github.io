import { useState } from 'react';
import {
  observer,
  useSetTemplateBackgroundColorByObserver,
  toJS,
} from '@hc/editor-core';
import { Popover } from 'antd';
import ColorSetModal from '@/components/ColorSetModal';

import { RGBAToString, transferGradientToString } from '@/kernel/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.modules.less';

const BackColor = (props: {
  popover: boolean;
  setPopover: (bol: boolean) => void;
}) => {
  const { popover, setPopover } = props;
  const { backgroundColor, update } = useSetTemplateBackgroundColorByObserver();

  // 是否包含rgba
  const containRGBA = (obj: any) => {
    if (obj.r != undefined && obj.g != undefined && obj.b != undefined) {
      return true;
    }
    return false;
  };
  // 是否渐变
  const isGradient = !containRGBA(backgroundColor);

  // color:纯色 gradient：渐变
  const [type, setType] = useState('color');

  // 渐变色设置
  const gradientColorChange = (val: any) => {
    update(val);
  };

  // 纯色设置
  const colorPickupChange = (val: any) => {
    update(val?.rgb);
  };

  return (
    <>
      <Popover
        getTooltipContainer={trigger => trigger}
        onVisibleChange={visible => {
          if (visible) {
            clickActionWeblog('tool_template_background_color');
          }
          setPopover(visible);
        }}
        destroyTooltipOnHide
        visible={popover}
        trigger="click"
        placement="topLeft"
        overlayClassName={styles.color}
        overlayInnerStyle={{ left: 0 }}
        content={
          <ColorSetModal
            color={backgroundColor || ''}
            gradientColorChange={val => {
              gradientColorChange(val);
            }}
            colorPickupChange={val => {
              colorPickupChange(val);
            }}
            type={type}
            setType={setType}
          />
        }
      >
        <div
          className={styles.basicRow}
          style={{
            background: isGradient
              ? transferGradientToString(backgroundColor)
              : RGBAToString(backgroundColor),
          }}
          onClick={() => {
            setPopover(!popover);
            setType(isGradient ? 'gradient' : 'color');
          }}
        />
      </Popover>
    </>
  );
};
export default observer(BackColor);
