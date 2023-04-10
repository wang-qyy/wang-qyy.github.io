import React, { useEffect } from 'react';
import XiuIcon from '@/components/XiuIcon';
import {
  useSetTemplateBackgroundColorByObserver,
  observer,
} from '@hc/editor-core';
import { useGradientColor } from '@/pages/Designer/Sider/Text/GradientColor/useGradientColor';
import { getdataByBackground } from '@/pages/Designer/Sider/Text/GradientColor/util';
import ColorPopover from '@/components/ColorPopover1';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';

function BackColor() {
  const { backgroundColor, update } = useSetTemplateBackgroundColorByObserver();

  const { list, editFlag, getEffectColor, changeList, changeAngle } =
    useGradientColor();

  const changeMockGradient = (item: string) => {
    // 渐变色埋点
    clickActionWeblog('bgModule_012');
    const tmp = getdataByBackground(item);
    changeAngle(tmp.angle);
    changeList(tmp.list);
  };
  // 更新背景颜色
  useEffect(() => {
    if (list.length > 0) {
      const val = getEffectColor();
      val &&
        update({
          type: 'linear',
          colorStops: val.colorStops,
          coords: val.coords,
          angle: val.angle,
        });
    }
  }, [editFlag]);
  const topColor = [
    'rgb(204, 116, 116)',
    'rgb(227, 187, 46)',
    'rgb(63, 172, 245)',
    'rgb(54, 159, 133)',
    'rgb(129, 199, 132)',
    'rgb(171, 71, 188)',
  ];

  const bottomColor = [
    'linear-gradient(180deg, rgba(151, 132, 251, 1) 0%, rgba(93, 77, 245, 1) 100%)',
    'linear-gradient(232deg, rgba(140, 254, 185, 1) 0%, rgba(247, 251, 128, 1) 100%)',
    'linear-gradient(227deg, rgba(251, 173, 125, 1) 0%, rgba(247, 202, 106, 1) 100%)',
    'linear-gradient(215deg, rgba(253, 218, 65, 1) 0%, rgba(248, 37, 38, 1) 100%)',
    'linear-gradient(211deg, rgba(232, 172, 172, 1) 0%, rgba(245, 224, 57, 1) 100%)',
  ];

  return (
    <div className={styles.backColor}>
      <div className={styles.backColorTitle}>背景颜色</div>
      <div className={styles.topColor}>
        {topColor.map(item => {
          return (
            <div
              key={item}
              style={{ background: item }}
              className={styles.colorItem}
              onClick={e => {
                const rgb = item.replace(/[^\d,]/g, '').split(',');
                const tempColor = {
                  r: Number(rgb[0]),
                  g: Number(rgb[1]),
                  b: Number(rgb[2]),
                  a: 1,
                };
                // 纯色埋点
                clickActionWeblog('bgModule_011');
                update(tempColor);
              }}
            />
          );
        })}
      </div>
      <div className={styles.topColor}>
        {bottomColor.map(item => {
          return (
            <div
              key={item}
              onClick={() => changeMockGradient(item)}
              style={{ background: item }}
              className={styles.colorItem}
            />
          );
        })}

        <ColorPopover
          isDesigner={false}
          placement="bottomRight"
          color={backgroundColor}
          colorPickupChange={col => {
            // 纯色埋点
            clickActionWeblog('bgModule_011');
            update(col);
          }}
          gradientColorChange={col => {
            // 渐变色埋点
            clickActionWeblog('bgModule_012');
            update(col);
          }}
          changeMockGradient={changeMockGradient}
        >
          <div
            className={styles.colorItem1}
            onClick={() => {
              // 自定义点击埋点
              clickActionWeblog('bgModule_010');
            }}
          >
            <XiuIcon type="iconxingzhuangjiehe6" />
          </div>
        </ColorPopover>
      </div>
    </div>
  );
}

export default observer(BackColor);
