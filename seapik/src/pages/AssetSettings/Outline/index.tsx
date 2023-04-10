import { Slider, Popover, Switch } from 'antd';
import { observer } from 'mobx-react';

import { useFontOutline } from '@kernel/index';
import { RGBAToString } from '@kernel/utils/single';

import ColorPicker from '@/components/ColorPicker';
import { DefaultSettingProps } from '../typing';

import './index.less';

/**
 * @description 文本边框
 */
function Outline(props: DefaultSettingProps) {
  const [value, update] = useFontOutline();

  let color = '';
  if (value?.color) {
    color = RGBAToString(value.color);
  }

  return (
    <div className="mb-24">
      <label className="label" htmlFor="">
        Outline:
        <Switch
          size="small"
          style={{ marginLeft: 8 }}
          checked={value}
          onChange={(v) => {
            if (v) {
              update({ width: 2, color: { r: 0, g: 0, b: 0, a: 1 } });
            } else {
              update(undefined);
            }
          }}
        />
      </label>
      {value?.color && (
        <div className="flex-box items-center">
          <Popover
            placement="bottom"
            overlayClassName="popover-no-padding"
            trigger="click"
            content={
              <ColorPicker.Solid
                color={value.color}
                onChange={(color) => {
                  update({ ...value, color });
                }}
              />
            }
          >
            <div className="outline-color" style={{ background: color }} />
          </Popover>
          <Slider
            tooltip={{ open: false }}
            value={value.width}
            max={100}
            min={0}
            onChange={(width) => {
              update({ ...value, width });
            }}
            style={{ flex: 1 }}
          />
          <span style={{ marginLeft: 8 }}>{value.width}</span>
        </div>
      )}
    </div>
  );
}

export default observer(Outline);
