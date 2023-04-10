import { useEffect } from 'react';
import {
  useSetTemplateBackgroundColorByObserver,
  observer,
} from '@hc/editor-core';
import ColorPopover from '@/components/ColorPopover';
import { gradientMock } from '@/pages/SidePanel/TextColor/ColorSelector/ColorSelector';
import { getdataByBackground } from '@/pages/Designer/Sider/Text/GradientColor/util';
import { useGradientColor } from '@/pages/Designer/Sider/Text/GradientColor/useGradientColor';
import { monochrome } from '@/pages/SidePanel/TextColor/ColorSelector/index';
import styles from '../index.less';

const ColorBackground = () => {
  const { backgroundColor, update } = useSetTemplateBackgroundColorByObserver();

  const { list, editFlag, getEffectColor, changeList, changeAngle } =
    useGradientColor();

  const changeMockGradient = (item: string) => {
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

  return (
    <div className={styles.colorBackground}>
      <div className={styles.title}>颜色背景</div>
      <div className={styles.content}>
        <div className={styles.top}>
          <ColorPopover
            isDesigner
            color={backgroundColor}
            colorPickupChange={update}
            gradientColorChange={update}
            changeMockGradient={changeMockGradient}
          >
            <div className={styles.colorFirstItem} />
          </ColorPopover>
          {monochrome.map(item => {
            return (
              <div
                key={item}
                onClick={e => {
                  const rgb = item.replace(/[^\d,]/g, '').split(',');
                  const tempColor = {
                    r: Number(rgb[0]),
                    g: Number(rgb[1]),
                    b: Number(rgb[2]),
                    a: 1,
                  };
                  update(tempColor);
                }}
                className={styles.colorItem}
                style={{ background: item }}
              />
            );
          })}
        </div>
        <div className={styles.top}>
          {gradientMock.map((item, index) => {
            return (
              <div
                key={item}
                onClick={() => changeMockGradient(item)}
                className={styles.colorItem}
                style={{ background: item }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default observer(ColorBackground);
