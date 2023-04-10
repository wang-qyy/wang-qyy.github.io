import { Popover } from 'antd';
import { observer } from 'mobx-react';
import { RGBAToString, transferGradientToString } from '@kernel/utils/single';

import { useFontColor } from '@kernel/index';

import ColorSetModal from '@/components/ColorSetModal';
import { DefaultSettingProps } from '../typing';

import './index.less';

//
function FontColor(props: DefaultSettingProps) {
  const { asset } = props;
  const [value, update] = useFontColor();

  if (!value) return <></>;

  const color = value.type
    ? transferGradientToString(value)
    : RGBAToString(value);

  return (
    <Popover
      trigger="click"
      overlayClassName="font-color-popover"
      content={
        <ColorSetModal
          key={`font-color-${asset.id}`}
          color={value}
          gradientColorChange={(v) => update(v)}
          colorPickupChange={({ rgb }) => update(rgb)}
          type={value.type || 'solid'}
        />
      }
    >
      <div className="font-color" style={{ background: color }} />
    </Popover>
  );
}

export default observer(FontColor);
