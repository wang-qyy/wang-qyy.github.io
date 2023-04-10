import { useState } from 'react';
import classNames from 'classnames';
import ColorPickup from '@/components/ColorPickup';
import { RGBA, GradientColor } from '@/kernel';
import { DEFAULT_GRADIENT_COLOR } from '@/kernel/utils/assetHelper/const';

import Gradient from './Gradient';
import styles from './index.less';

const ColorSetModal = (props: {
  gradientColorChange: (color: GradientColor) => void; // 渐变色颜色更新
  colorPickupChange: (color: { rgb: RGBA }) => void; // 纯色颜色更新
  color: RGBA | GradientColor;
  type: 'radial' | 'linear' | 'solid';
}) => {
  const {
    gradientColorChange,
    colorPickupChange,
    color,
    type = 'solid',
  } = props;

  const [colorType, _colorType] = useState(type);

  return (
    <div className={styles.colorPopover}>
      <div className={styles.colorTab}>
        {[
          { key: 'solid', name: 'Solid', include: ['solid'] },
          { key: 'gradient', name: 'Gradient', include: ['linear', 'radial'] },
        ].map((item) => {
          return (
            <div
              key={item.key}
              onClick={() => {
                if (item.key === 'gradient') {
                  gradientColorChange(DEFAULT_GRADIENT_COLOR);
                }
                _colorType(item.include[0]);
              }}
              className={classNames(styles.colorTabItem, {
                [styles.colorTabItemActive]: item.include.includes(colorType),
              })}
            >
              {item.name}
            </div>
          );
        })}
      </div>

      {colorType === 'solid' ? (
        <div style={{ padding: '10px' }}>
          <ColorPickup color={color} onChange={colorPickupChange} />
        </div>
      ) : (
        <Gradient
          type={colorType}
          value={color as GradientColor}
          onChange={gradientColorChange}
          setType={_colorType}
        />
      )}
    </div>
  );
};
export default ColorSetModal;
