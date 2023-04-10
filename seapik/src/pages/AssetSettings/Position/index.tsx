import { Button } from 'antd';
import { observer } from 'mobx-react';
import { getCanvasInfo } from '@/kernel';
import { DefaultSettingProps } from '../typing';
import Icon from '@/components/Icon';
import './index.less';

const positionX = [
  { key: 'left', icon: 'iconzuoduiqi' },
  { key: 'center', icon: 'iconshuxiangjuzhongduiqi' },
  { key: 'right', icon: 'iconyouduiqi' },
];
const positionY = [
  { key: 'top', icon: 'icondingbuduiqi' },
  { key: 'middle', icon: 'iconhengxiangjuzhongduiqi' },
  { key: 'bottom', icon: 'icondibuduiqi' },
];

function PositionItem({
  item,
  onClick,
}: {
  item: any;
  onClick: HTMLButtonElement['click'];
}) {
  return (
    <div className="position-item">
      <Button type="text" key={item.key} onClick={onClick}>
        <Icon type={item.icon} />
      </Button>
      <span className="position-item-label">{item.key}</span>
    </div>
  );
}

function AssetPosition(props: DefaultSettingProps) {
  const { asset } = props;

  const { scale, width, height } = getCanvasInfo();

  // 设置水平位置
  function setXPosition(position: string) {
    let posX = 0;

    const {
      horizontal: { start, end },
    } = asset.auxiliary;
    const w = (end - start) / scale;

    if (position === 'left') {
      posX = (w - asset.attribute.width) / 2;
    } else if (position === 'center') {
      posX = (width - asset.attribute.width) / 2;
    } else {
      posX = width - w + (w - asset.attribute.width) / 2;
    }

    asset?.update({ transform: { posX } });
  }

  // 设置垂直位置
  function setYPosition(position: string) {
    let posY = 0;

    const {
      vertical: { start, end },
    } = asset.auxiliary;

    const h = (end - start) / scale;

    if (position === 'top') {
      posY = (h - asset.attribute.height) / 2;
    } else if (position === 'middle') {
      posY = (height - asset.attribute.height) / 2;
    } else {
      posY = height - h + (h - asset.attribute.height) / 2;
    }

    asset?.update({ transform: { posY } });
  }

  return (
    <div className="mb-24">
      <label className="label">Position:</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="flex-box">
          {positionX.map((pos) => (
            <PositionItem
              key={pos.key}
              item={pos}
              onClick={() => setXPosition(pos.key)}
            />
          ))}
        </div>
        <div className="flex-box">
          {positionY.map((pos) => (
            <PositionItem
              key={pos.key}
              item={pos}
              onClick={() => setYPosition(pos.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default observer(AssetPosition);
