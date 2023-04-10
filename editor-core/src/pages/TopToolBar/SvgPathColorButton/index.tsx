import { GradientType, observer, RGBA, useSvgPathFill } from '@hc/editor-core';
import { getBackgroundByEffect } from '@/pages/Designer/Sider/Text/GradientColor/util';
import { RGBAToString } from '@/kernel/utils/single';

import styles from './index.modules.less';

const SvgPathColorButton = () => {
  const { fill } = useSvgPathFill();

  if (!fill) {
    return null;
  }

  const color = (fill as GradientType).colorStops
    ? getBackgroundByEffect(fill)
    : RGBAToString(fill as RGBA);

  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowContent} style={{ flexWrap: 'wrap' }}>
        <div className={styles.chooseColorGradientWrap}>
          <div
            className={styles.chooseColorGradient}
            style={{
              background: color,
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default observer(SvgPathColorButton);
