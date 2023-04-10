import { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Popover, Button, InputNumber } from 'antd';
import { updateCanvasSize, getCanvasInfo } from '@/kernel';

import Icon from '@/components/Icon';

import { SIZE, SizeItem } from './constants';

import styles from './index.modules.less';

interface ListItemProps {
  item: SizeItem;
  onClick?: HTMLButtonElement['click'];
}

function ListItem({ item, ...others }: ListItemProps) {
  return (
    <Button className={styles['size-list-item']} type="text" {...others}>
      <div>
        <Icon type={item.icon} className={styles['item-icon']} />

        <span>{item.label}</span>
      </div>
      <span className={styles['list-item-size']}>
        {item.width}x{item.height}
        {item.unit}
      </span>
    </Button>
  );
}

function CanvasSize() {
  const { width, height } = getCanvasInfo();

  const [inputSize, _inputSize] = useState({
    width: 0,
    height: 0,
  });

  const isChanged = useMemo(() => {
    return inputSize.width !== width || inputSize.height !== height;
  }, [width, height, inputSize.width, inputSize.height]);

  useEffect(() => {
    _inputSize({ width, height });
  }, [width, height]);

  function changeCustomWidth(w: number) {
    _inputSize({ width: w, height: w / (width / height) });
  }
  function changeCustomHeight(h: number) {
    _inputSize({ width: h * (width / height), height: h });
  }

  return (
    <Popover
      trigger="click"
      overlayClassName={styles['size-list-popover']}
      content={
        <div className={styles['size-list']}>
          <div
            className="flex-box items-center gap-16"
            style={{
              paddingBottom: 16,
              marginBottom: 16,
              borderBottom: '1px solid #e4e4e4',
            }}
          >
            custom:
            <InputNumber
              value={inputSize.width}
              onChange={(w) => {
                if (w) {
                  changeCustomWidth(w);
                }
              }}
            />
            <InputNumber
              value={inputSize.height}
              onChange={(h) => {
                if (h) {
                  changeCustomHeight(h);
                }
              }}
            />
            <Button
              disabled={!isChanged}
              type="text"
              style={{ color: isChanged ? 'green' : '' }}
            >
              <Icon type="iconqueding_queren" />
            </Button>
          </div>

          {[
            ...SIZE,
            // {
            //   key: 'Original',
            //   label: 'Pinterest pin',
            //   width: 1000,
            //   height: 1500,
            //   unit: 'px',
            //   icon: 'iconpnterest',
            // },
          ].map((item) => (
            <ListItem
              key={item.key}
              item={item}
              onClick={() => updateCanvasSize(item)}
            />
          ))}
        </div>
      }
    >
      <div className={styles.size}>
        <Icon
          type="iconimage-resize-square"
          style={{ marginRight: 4, fontSize: 16 }}
        />
        Resize
      </div>
    </Popover>
  );
}

export default observer(CanvasSize);
