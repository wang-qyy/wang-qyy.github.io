import { useFontColorByObserver, observer, RGBA } from '@hc/editor-core';
import { Popover } from 'antd';
import { useState, useEffect } from 'react';
import { RGBAToString } from '@/utils/single';
import ColorPickup from '@/components/ColorPickup';
import styles from './index.modules.less';

const FontColor = () => {
  const [fontColor, updateFontColor] = useFontColorByObserver();
  const [sFontColor, setSFontColor] = useState('');
  useEffect(() => {
    if (
      fontColor?.r !== undefined &&
      fontColor?.g !== undefined &&
      fontColor?.b !== undefined &&
      fontColor?.a !== undefined
    ) {
      setSFontColor(RGBAToString(fontColor));
    }
  }, [fontColor]);

  return (
    <Popover
      trigger="click"
      overlayClassName={styles.color}
      content={
        <div style={{ width: '250px', padding: '10px' }}>
          <ColorPickup
            color={sFontColor}
            onChange={(color: { rgb: RGBA }) => {
              updateFontColor(color.rgb);
            }}
          />
        </div>
      }
    >
      <div className={styles.chooseColor} style={{ background: sFontColor }} />
    </Popover>
  );
};
export default observer(FontColor);
