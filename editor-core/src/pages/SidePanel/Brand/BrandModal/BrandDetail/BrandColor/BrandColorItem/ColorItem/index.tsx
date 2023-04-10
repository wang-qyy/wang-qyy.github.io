import React, { useState, useEffect } from 'react';
import { Popover, Tooltip } from 'antd';
import { rbgaObjToHex } from '@/utils/single';
import { colorToRGBAObject } from '@kernel/utils/single';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';
import ColorPickup from '@/components/ColorPickup';
import XiuIcon from '@/components/XiuIcon';
import styles from './index.less';

function ColorItem(props: {
  item: string;
  id: string;
  show: boolean;
  _isAdd: (bol: boolean) => void;
  getColorList: () => void;
}) {
  const { show, id, item, _isAdd, getColorList } = props;
  const [visible, _visible] = useState(show);
  const [color, _color] = useState(colorToRGBAObject(item));
  const { delColor, addColor } = useBrand();

  useEffect(() => {
    _color(colorToRGBAObject(item));
  }, [item]);
  return (
    <Popover
      visible={visible}
      trigger="click"
      overlayClassName="color-picker"
      onVisibleChange={visible => {
        _visible(visible);
        if (!visible) {
          addColor(id, rbgaObjToHex(color), item, () => {
            getColorList();
          });
          _isAdd(false);
        }
      }}
      getTooltipContainer={trigger => trigger}
      destroyTooltipOnHide
      content={
        <div style={{ width: '250px', padding: '10px' }}>
          <ColorPickup
            color={color}
            onChange={(color: { rgb: {} }) => {
              _color(color.rgb);
            }}
            notOpc
          />
        </div>
      }
    >
      <Tooltip
        placement="bottom"
        mouseEnterDelay={0.5}
        title={rbgaObjToHex(color)}
      >
        <div className={styles.colorItem}>
          <div
            className={styles.itemColor}
            style={{ background: rbgaObjToHex(color) }}
          >
            {!show && (
              <div
                className={styles.colorItemClose}
                onClick={e => {
                  e.stopPropagation();
                  delColor(id, rbgaObjToHex(color), () => {
                    getColorList();
                  });
                }}
              >
                <XiuIcon type="close-small" />
              </div>
            )}
          </div>
        </div>
      </Tooltip>
    </Popover>
  );
}

export default ColorItem;
