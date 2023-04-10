import { useEffect, useState } from 'react';
import { ChromePicker, AlphaPicker, SliderPicker } from 'react-color';
import { colorToRGBAObject, rgbaObjToHex } from '@kernel/utils/single';
import { RGBA } from '@/kernel';

import { Input, InputNumber } from 'antd';
import Icon from '@/components/Icon';
import styles from './index.less';

const ColorPickup = (props: {
  color: RGBA;
  onChange: (color: { rgb: RGBA }) => void;
  notOpc?: boolean;
}) => {
  const { color, onChange, notOpc = false } = props;

  const [show, setShow] = useState(false);
  const [colValue, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(100);

  useEffect(() => {
    if ('EyeDropper' in window) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, []);

  // 拾色器
  const bindClick = async () => {
    try {
      const eye = new EyeDropper();
      const result = await eye.open();
      // The user selected a pixel, here is its color:
      const colorHexValue = result.sRGBHex;
      onChange({ rgb: colorToRGBAObject(colorHexValue) });
    } catch (err) {
      // The user escaped the eyedropper mode.
    }
  };
  // 是否包含rgba
  const containRGBA = (obj: any) => {
    if (
      obj.r != undefined &&
      obj.g != undefined &&
      obj.b != undefined &&
      obj.a != undefined
    ) {
      return true;
    }
    return false;
  };

  const bindPressEnter = (value: string) => {
    if (containRGBA(colorToRGBAObject(value))) {
      onChange({ rgb: colorToRGBAObject(value) });
      setColor(rgbaObjToHex(colorToRGBAObject(value)));
    } else {
      onChange({ rgb: color });
      setColor(rgbaObjToHex(color));
    }
  };

  const bindOpcPressEnter = (value: string | number, bol: boolean) => {
    const num = bol ? `${value}`!.replace('%', '') : value;
    const col = containRGBA(color) ? color : { r: 0, g: 0, b: 0, a: 0 };
    const newCol = JSON.parse(JSON.stringify(col));
    newCol.a = (Number(num) / 100).toFixed(2);
    onChange({ rgb: newCol });
  };

  useEffect(() => {
    const col =
      typeof color === 'string' && color?.length > 0
        ? colorToRGBAObject(color)
        : color;

    if (containRGBA(col)) {
      setOpacity(Math.round(col.a > 1 ? 100 : col.a * 100));
      setColor(rgbaObjToHex(col));
    }
  }, [color]);
  return (
    <div className={styles.colorPickup}>
      <ChromePicker
        disableAlpha
        width="100%"
        color={color}
        onChange={onChange}
      />
      <div className={styles.huePicker}>
        <SliderPicker
          color={color}
          onChange={(color) => {
            onChange(color);
          }}
          pointer={() => <div className={styles.pointer} />}
        />
      </div>
      {!notOpc && (
        <div className={styles.alphaPicker}>
          <AlphaPicker
            color={color}
            height="10px"
            onChange={onChange}
            pointer={() => <div className={styles.pointer} />}
          />
        </div>
      )}
      <div
        className={styles.colorPickupFooter}
        //   style={{ width }}
      >
        {show && (
          <div className={styles.left} onClick={bindClick}>
            <Icon type="iconxiguan" />
          </div>
        )}
        <Input
          onBlur={(e) => bindPressEnter(e.target.value)}
          onChange={(e) => {
            setColor(e.target.value);
          }}
          className={styles.content}
          value={colValue}
        />
        {!notOpc && (
          <InputNumber
            className={styles.right}
            min={0}
            max={100}
            formatter={(value) => `${value}%`}
            onBlur={(e) => bindOpcPressEnter(e.target.value, true)}
            onChange={(e) => {
              setOpacity(e);
            }}
            onPressEnter={(e) => {
              e.target.blur();
            }}
            onStep={(e) => {
              bindOpcPressEnter(e, false);
            }}
            value={opacity}
          />
        )}
      </div>
    </div>
  );
};

export default ColorPickup;
