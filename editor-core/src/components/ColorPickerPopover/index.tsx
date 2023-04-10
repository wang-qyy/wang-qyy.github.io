import { useState } from 'react';
import { observer, GradientType, RGBA } from '@hc/editor-core';
import { Popover, PopoverProps } from 'antd';
import ColorSetModal from '@/components/ColorSetModal';

import { getBackgroundByEffect } from '@/pages/Designer/Sider/Text/GradientColor/util';
import { RGBAToString } from '@/kernel/utils/single';
import classNames from 'classnames';
import styles from './index.modules.less';
import ColorPickup from '../ColorPickup';

type ChangeFc = (value: RGBA | GradientType) => void;
type SingleChangeFc = (value: RGBA) => void;

interface IProps extends PopoverProps {
  value: RGBA | GradientType;
  onChange: ChangeFc | SingleChangeFc;
  style?: React.CSSProperties;
  single?: boolean;
  buttonClassName?: string;
}

const ColorPickerPopover = (props: IProps) => {
  const { value, onChange, single, style, buttonClassName, ...other } = props;
  const [visible, setVisible] = useState(false);

  const isGradient = !!(value as GradientType).colorStops;

  const background = isGradient
    ? getBackgroundByEffect(value)
    : RGBAToString(value as RGBA);

  // color:纯色 gradient：渐变
  const [type, setType] = useState('color');

  if (!value) {
    return null;
  }

  const gradientColorChange = (val: any) => {
    const linear: GradientType = {
      type: 'linear',
      colorStops: val.colorStops,
      coords: val.coords,
      angle: val.angle,
    };
    (onChange as ChangeFc)(linear);
  };

  const colorPickupChange = (val: any) => {
    onChange(val.rgb);
  };

  return (
    <Popover
      getTooltipContainer={trigger => trigger}
      onVisibleChange={v => {
        setVisible(v);
      }}
      destroyTooltipOnHide
      visible={visible}
      trigger="click"
      placement="bottomLeft"
      overlayInnerStyle={{ left: 0 }}
      {...other}
      content={
        !single ? (
          <ColorSetModal
            color={value || ''}
            gradientColorChange={val => {
              gradientColorChange(val);
            }}
            colorPickupChange={val => {
              colorPickupChange(val);
            }}
            type={type}
            setType={setType}
          />
        ) : (
          <ColorPickup color={value || ''} onChange={colorPickupChange} />
        )
      }
    >
      <div
        className={classNames(styles.basicRow, buttonClassName)}
        style={{
          background,
          ...style,
        }}
        onClick={() => {
          setVisible(!visible);
          setType(type);
        }}
      />
    </Popover>
  );
};

ColorPickerPopover.defaultProps = {
  single: false,
  style: undefined,
  buttonClassName: undefined,
};

export default observer(ColorPickerPopover);
