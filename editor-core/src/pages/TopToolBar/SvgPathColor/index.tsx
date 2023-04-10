import { useState } from 'react';
import { observer, useSvgPathFill, GradientType, RGBA } from '@hc/editor-core';
import { Popover } from 'antd';
import ColorSetModal from '@/components/ColorSetModal';

import { getBackgroundByEffect } from '@/pages/Designer/Sider/Text/GradientColor/util';
import { RGBAToString } from '@/kernel/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.modules.less';

const SvgColor = (props: {
  popover: boolean;
  setPopover: (bol: boolean) => void;
}) => {
  const { popover, setPopover } = props;

  const { fill, updateFill } = useSvgPathFill();
  const isGradient = !!(fill as GradientType).colorStops;

  const background = isGradient
    ? getBackgroundByEffect(fill)
    : RGBAToString(fill as RGBA);

  // color:纯色 gradient：渐变
  const [type, setType] = useState('color');

  if (!fill) {
    return null;
  }

  const gradientColorChange = (val: any) => {
    const linear: GradientType = {
      type: 'linear',
      colorStops: val.colorStops,
      coords: val.coords,
      angle: val.angle,
    };
    updateFill(linear);
  };

  const colorPickupChange = (val: any) => {
    updateFill(val.rgb);
  };

  return (
    <Popover
      getTooltipContainer={trigger => trigger}
      onVisibleChange={visible => {
        if (visible) {
          clickActionWeblog('tool_svg-path-color');
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
          color={fill || ''}
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
          background,
        }}
        onClick={() => {
          setPopover(!popover);
          setType(type);
        }}
      />
    </Popover>
  );
};
export default observer(SvgColor);
