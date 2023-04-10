import ColorPickup from '@/components/ColorPickup';
import classNames from 'classnames';

import GradientColor from '@/pages/Designer/Sider/Text/GradientColor';
import { stopPropagation } from '@/utils/single';
import styles from './index.less';

const ColorSetModal = (props: {
  gradientColorChange: (col: any) => void; // 渐变色颜色更新
  colorPickupChange: (col: any) => void; // 纯色颜色更新
  color: any;
  type: string;
  setType: (type: string) => void; // 颜色切换
}) => {
  const { gradientColorChange, colorPickupChange, color, type, setType } =
    props;

  return (
    <div className={styles.colorPopover} onClick={stopPropagation}>
      <div className={styles.colorTab}>
        {[
          { key: 'color', name: '纯色' },
          { key: 'gradient', name: '渐变' },
        ].map(item => {
          return (
            <div
              key={item.key}
              onClick={e => {
                setType(item.key);
              }}
              className={classNames(styles.colorTabItem, {
                [styles.colorTabItemActive]: item.key === type,
              })}
            >
              {item.name}
            </div>
          );
        })}
      </div>

      {type === 'color' ? (
        <div style={{ padding: '10px' }}>
          <ColorPickup
            color={color || ''}
            onChange={(val: { rgb: {} }) => {
              colorPickupChange(val);
            }}
          />
        </div>
      ) : (
        <div
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <GradientColor
            type="svgEffect"
            value={color}
            onChange={val => {
              gradientColorChange(val);
            }}
          />
        </div>
      )}
    </div>
  );
};
export default ColorSetModal;
