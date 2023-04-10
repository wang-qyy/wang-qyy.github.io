import { useSvgColorsByObserver, observer } from '@hc/editor-core';
import { getBackgroundByEffect } from '@/pages/Designer/Sider/Text/GradientColor/util';
import { RGBAToString } from '@/kernel/utils/single';

import styles from './index.modules.less';

const SvgColor = () => {
  const [value, updateColor] = useSvgColorsByObserver();
  // color:纯色 gradient：渐变
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

  return (
    <>
      {renderColor().data.map(every => {
        return (
          <div key={every.key} className={styles.basicRow}>
            <div
              className={styles.basicRowContent}
              style={{ flexWrap: 'wrap' }}
            >
              <div className={styles.chooseColorGradientWrap}>
                <div
                  className={styles.chooseColorGradient}
                  style={{
                    background: every?.background,
                  }}
                >
                  {every?.color?.background}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
export default observer(SvgColor);
