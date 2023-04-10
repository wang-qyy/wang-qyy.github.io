import { useState } from 'react';
import {
  useSvgColorsByObserver,
  observer,
  useSetTemplateBackgroundColorByObserver,
  toJS,
} from '@hc/editor-core';
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
  const [value, updateColor] = useSvgColorsByObserver();
  // color:纯色 gradient：渐变
  const [type, setType] = useState('color');

  // 当前点击颜色条 用于区分打开的弹框
  const [clickKey, _ClickKey] = useState('');

  const renderColor = () => {
    const list: any[] = [];

    if (value) {
      Object.keys(value).map((key: string) => {
        const itemColor = value[key];
        const realColor = itemColor.color;
        let { id = '', color } = itemColor;
        if (key !== 'none') {
          if (realColor?.colorStops) {
            list.push({
              type: 'gradient',
              color: itemColor,
              key,
              id,
              background: getBackgroundByEffect(realColor),
            });
          } else {
            if (typeof color !== 'string') {
              color = RGBAToString(color);
            }
            list.push({
              type: 'color',
              color: itemColor,
              key,
              id,
              background: color,
            });
          }
        }
      });
    }

    return { data: list };
  };
  if (renderColor().data.length === 0) {
    return null;
  }

  const gradientColorChange = (val: any, every: any) => {
    updateColor({
      ...value,
      [every.key]: {
        id: every.id,
        color: {
          type: 'linear',
          colorStops: val.colorStops,
          coords: val.coords,
          angle: val.angle,
        },
      },
    });
  };

  const colorPickupChange = (val: any, every: any) => {
    updateColor({
      ...value,
      [every.key]: {
        id: every.id,
        color: val.rgb,
      },
    });
  };

  return (
    <>
      {renderColor().data.map(every => {
        return (
          <Popover
            getTooltipContainer={trigger => trigger}
            onVisibleChange={visible => {
              if (visible) {
                clickActionWeblog('tool_svg-color');
              }
              setPopover(visible);
            }}
            destroyTooltipOnHide
            visible={popover && clickKey === every.key}
            key={every.key}
            trigger="click"
            placement="topLeft"
            overlayClassName={styles.color}
            overlayInnerStyle={{ left: 0 }}
            content={
              <ColorSetModal
                color={every.color.color || ''}
                gradientColorChange={val => {
                  gradientColorChange(val, every);
                }}
                colorPickupChange={val => {
                  colorPickupChange(val, every);
                }}
                type={type}
                setType={setType}
              />
            }
          >
            <div
              className={styles.basicRow}
              style={{
                background: every?.background,
              }}
              onClick={() => {
                _ClickKey(every.key);
                setPopover(!popover);
                setType(every.type);
              }}
            />
          </Popover>
        );
      })}
    </>
  );
};
export default observer(SvgColor);
