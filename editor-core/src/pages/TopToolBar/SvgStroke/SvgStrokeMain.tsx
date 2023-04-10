import { useMemo } from 'react';
import {
  useGetCurrentAsset,
  useSVGStrokesByObserver,
  observer,
  SvgInfo,
} from '@hc/editor-core';
import ChromeColorPicker from '@/components/ChromeColorPicker';
import { clickActionWeblog } from '@/utils/webLog';

import OverwriteSlider from '@/components/OverwriteSlider';
import SvgDash from './SvgDash';
import styles from './index.less';

const SvgStrokeMain = () => {
  const {
    svgStroke,
    changeColor,
    changeDashStyle,
    changeStrokeWidth,
    changeRadius,
  } = useSVGStrokesByObserver();

  const asset = useGetCurrentAsset();
  const { width, height } = asset?.attribute || {};
  const { type, shapeType } = asset?.meta || {};
  const maxStrokeWidth = useMemo(() => {
    return Math.floor((Math.min(width, height) / 2) * 0.5) || 50;
  }, [width, height]);
  return (
    // <OverwritePopover
    //   trigger="click"
    //   content={<Circle />}
    //   overlayInnerStyle={{ marginTop: 5, marginLeft: 10 }}
    // >
    <div className={styles.fontBg}>
      <div>
        <div className={styles.fontBgRow}>
          <div className={styles.fontBgRowName}>边框颜色</div>
          <ChromeColorPicker
            value={svgStroke?.stroke}
            changeColor={(color: any) => {
              clickActionWeblog('tool_image_overturn_color');
              changeColor(color);
            }}
          />
        </div>
        <SvgDash
          title="边框样式"
          onChange={(val: number) => {
            changeDashStyle(val);
            clickActionWeblog('tool_image_overturn_border');
          }}
          value={svgStroke?.strokeDashType}
        />
        <OverwriteSlider
          label="边框宽度"
          value={svgStroke?.strokeWidth}
          step={1}
          min={0}
          colon={false}
          max={maxStrokeWidth}
          onChange={(val: number) => {
            changeStrokeWidth(val);
          }}
          onAfterChange={() =>
            clickActionWeblog('tool_image_overturn_border_width')
          }
          inputNumber
          // style={{ width: 336, padding: '12px 18px' }}
          tooltipVisible={false}
        />
        {type === 'svgPath' && shapeType === 'rect' && (
          <OverwriteSlider
            label="圆角"
            value={(svgStroke as SvgInfo)?.radius || 0}
            step={1}
            min={0}
            colon={false}
            max={500}
            onChange={(val: number) => {
              // changeStrokeWidth(val);
              changeRadius(val);
            }}
            onAfterChange={() => {
              clickActionWeblog('FreeformDraw3');
            }}
            inputNumber
            // style={{ width: 336, padding: '12px 18px' }}
            tooltipVisible={false}
          />
        )}
      </div>
    </div>
  );
};
export default observer(SvgStrokeMain);
