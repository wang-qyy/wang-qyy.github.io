import React, { useEffect, useState } from 'react';
import { observer, useSvgColorsByObserver, toJS } from '@hc/editor-core';
import ColorPopover from '@/components/ColorPopover';
import { useGradientColor } from '@/pages/Designer/Sider/Text/GradientColor/useGradientColor';
import {
  getdataByBackground,
  getBackgroundByEffect,
} from '@/pages/Designer/Sider/Text/GradientColor/util';

import { RGBAToString, stopPropagation } from '@/utils/single';
import { StringToRGBA } from '@/kernel/utils/single';

import styles from '../index.modules.less';

const OperationBasicColor = ({ colors }: { colors: any }) => {
  const [value, updateColor] = useSvgColorsByObserver();
  const {
    editFlag,
    list: svgColorList,
    changeList,
    getEffectColor,
    changeAngle,
  } = useGradientColor();
  // color:纯色 gradient：渐变
  const [type, setType] = useState('color');

  const list: any[] = [];

  if (colors) {
    Object.keys(colors).forEach((key: string) => {
      const itemColor = colors[key];
      const realColor = itemColor.color;
      const { id = '', color } = itemColor;
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

  if (list.length === 0) {
    return null;
  }

  const changeMockGradient = (item: string) => {
    const tmp = getdataByBackground(item);
    changeAngle(tmp.angle);
    changeList(tmp.list);
  };

  useEffect(() => {
    if (svgColorList.length > 0) {
      const val = getEffectColor();
      val &&
        updateColor({
          ...value,
          [Object.keys(value)[0]]: {
            id: Object.keys(value)[0],
            color: {
              type: 'linear',
              colorStops: val.colorStops,
              coords: val.coords,
              angle: val.angle,
            },
          },
        });
    }
  }, [editFlag]);

  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowName}>颜色</div>
      <div className={styles.basicRowContent} style={{ flexWrap: 'wrap' }}>
        {list.map((every, index) => {
          return (
            <ColorPopover
              key={index}
              placement="topRight"
              isDesigner
              color={StringToRGBA(every.color.color)}
              colorPickupChange={color => {
                updateColor({
                  ...colors,
                  [every.key]: {
                    id: every.id,
                    color: RGBAToString(color),
                  },
                });
              }}
              gradientColorChange={val => {
                updateColor({
                  ...colors,
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
              }}
              changeMockGradient={changeMockGradient}
            >
              <div
                onClick={() => {
                  setType(every.type);
                }}
                className={styles.chooseColorGradient}
                style={{
                  background: every.background,
                }}
              >
                {every.color.background}
              </div>
            </ColorPopover>
          );
        })}
      </div>
    </div>
  );
};
export default observer(OperationBasicColor);
