import { useMemo } from 'react';
import OperationSlider from '@/pages/Designer/Sider/Text/TextTabs/Basic/components/SliderText';
import {
  useSVGStrokesByObserver,
  useGetCurrentAsset,
  observer,
} from '@hc/editor-core';
import styles from '../index.modules.less';

const OutlineWidth = () => {
  const { svgStroke, changeStrokeWidth } = useSVGStrokesByObserver();
  const asset = useGetCurrentAsset();
  const { width, height } = asset?.attribute || {};
  const maxStrokeWidth = useMemo(() => {
    return Math.floor((Math.min(width, height) / 2) * 0.5) || 50;
  }, [width, height]);
  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowName}>描边宽度</div>
      <div className={styles.basicRowContent}>
        <OperationSlider
          step={1}
          min={0}
          max={maxStrokeWidth}
          defaultValue={svgStroke?.strokeWidth}
          value={svgStroke?.strokeWidth}
          onChange={val => {
            changeStrokeWidth(val);
          }}
        />
      </div>
    </div>
  );
};
export default observer(OutlineWidth);
