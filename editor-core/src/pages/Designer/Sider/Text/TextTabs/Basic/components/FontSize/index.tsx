import { stopPropagation } from '@/utils/single';
import { useFontSizeByObserver, observer } from '@hc/editor-core';
import { Input, InputNumber, Popover } from 'antd';
import classnames from 'classnames';

import { OptionalSize } from '@/config/basicVariable';

import styles from './index.modules.less';

export interface FontSizeProps {
  onSelect: (fontSize: number) => void;
  selected: number;
}

function List({ selected, onSelect }: FontSizeProps) {
  return (
    <div className={classnames(styles['size-list'])}>
      {OptionalSize.map(fontSize => (
        <div
          key={`fontSize-${fontSize}`}
          className={classnames(
            styles.size,
            selected === fontSize ? styles.active : '',
          )}
          onClick={e => {
            e.preventDefault();
            onSelect(fontSize);
          }}
        >
          {fontSize}
        </div>
      ))}
    </div>
  );
}
const FontSizeDesiger = () => {
  const [fontSize, updateFontSize] = useFontSizeByObserver();

  const handleUpdateFontSize = (num: number) => {
    const max = 600;
    const min = 12;

    if (num > max) {
      updateFontSize(max);
    } else if (num < min) {
      updateFontSize(min);
    } else {
      updateFontSize(num);
    }
  };
  return (
    <div style={{ width: 149 }}>
      <Popover
        placement="bottom"
        overlayClassName={styles['popover-styles']}
        content={
          <List
            selected={fontSize}
            onSelect={val => {
              handleUpdateFontSize(val);
            }}
          />
        }
      >
        <Input.Group compact className={styles.inputDesiger}>
          <span
            className={styles.action2}
            onClick={() => {
              handleUpdateFontSize(Number(fontSize ?? 0) - 1);
            }}
          >
            -
          </span>
          <InputNumber
            value={Math.floor(Number(fontSize ?? 0))}
            max={600}
            min={12}
            className={styles['input-number-desiger']}
            onChange={size => handleUpdateFontSize(size)}
            onKeyDown={stopPropagation}
            onPaste={stopPropagation}
          />
          <span
            className={styles.action2}
            onClick={() => {
              handleUpdateFontSize(Number(fontSize ?? 0) + 1);
            }}
          >
            +
          </span>
        </Input.Group>
      </Popover>
    </div>
  );
};
export default observer(FontSizeDesiger);
