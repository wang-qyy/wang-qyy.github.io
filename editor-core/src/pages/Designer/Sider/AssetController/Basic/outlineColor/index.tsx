import { useSVGStrokesByObserver, observer } from '@hc/editor-core';
import { SketchPicker } from 'react-color';
import { Popover } from 'antd';
import { RGBAToString } from '@/utils/single';
import styles from '../index.modules.less';

const OperationBasicColor = () => {
  const { svgStroke, changeColor } = useSVGStrokesByObserver();

  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowName}>描边颜色</div>
      <div className={styles.basicRowContent} style={{ flexWrap: 'wrap' }}>
        <Popover
          trigger="click"
          overlayClassName={styles.color}
          content={
            <div className={styles.colorPopover}>
              <SketchPicker
                width={280}
                color={svgStroke?.stroke}
                onChange={(val: { rgb: {} }) => {
                  changeColor(val.rgb);
                }}
              />
            </div>
          }
        >
          <div
            className={styles.chooseColorGradient}
            style={{
              background: RGBAToString(svgStroke?.stroke),
            }}
          />
        </Popover>
      </div>
    </div>
  );
};
export default observer(OperationBasicColor);
