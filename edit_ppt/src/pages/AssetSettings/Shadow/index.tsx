import { Popover, Switch, Slider, SliderSingleProps } from 'antd';
import { observer } from 'mobx-react';
import ColorPicker from '@/components/ColorPicker';
import { DefaultSettingProps } from '../typing';
import { updateShadow } from '@kernel/index';
import { DEFAULT_SHADOW } from '@/kernel/utils/assetHelper/const';
import { StringToRGBA, RGBAToString } from '@/kernel/utils/single';

import { adjustList } from './const';

function CustomerSlider({
  label,
  value,
  ...others
}: { label: string } & SliderSingleProps) {
  return (
    <div>
      <label>{label}</label>
      <div className="flex-box items-center">
        <Slider
          tooltip={{ open: false }}
          className="flex-1"
          value={value}
          {...others}
        />
        <span style={{ marginLeft: 8 }}>{value}</span>
      </div>
    </div>
  );
}

/**
 * @description 元素投影
 */
function Shadow(props: DefaultSettingProps) {
  const { asset } = props;

  const { dropShadow } = asset.attribute;

  const hasDropShadow = !!dropShadow?.color;

  return (
    <div className="mb-24">
      <label className="label" htmlFor="">
        Shadow:
        <Switch
          size="small"
          style={{ marginLeft: 8 }}
          checked={hasDropShadow}
          onChange={(v) => {
            if (v) {
              updateShadow({ params: DEFAULT_SHADOW });
            } else {
              updateShadow({ params: undefined, replace: true });
            }
          }}
        />
      </label>
      {hasDropShadow && (
        <div className="flex-box">
          <Popover
            placement="bottom"
            overlayClassName="popover-no-padding"
            trigger="click"
            content={
              <ColorPicker.Solid
                color={StringToRGBA(dropShadow.color)}
                onChange={(color) => {
                  console.log(color);
                  updateShadow({ params: { color: RGBAToString(color) } });
                }}
              />
            }
          >
            <div
              className="outline-color"
              style={{ background: dropShadow.color }}
            />
          </Popover>

          <div className="flex-1">
            {adjustList.map((item) => (
              <CustomerSlider
                key={item.key}
                label={item.label}
                value={dropShadow[item.key]}
                min={item.range[0]}
                max={item.range[1]}
                onChange={(v) => {
                  const params = { [item.key]: v };
                  updateShadow({ params });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default observer(Shadow);
