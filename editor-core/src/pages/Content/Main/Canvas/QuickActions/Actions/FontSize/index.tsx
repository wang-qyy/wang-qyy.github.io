import { AutoComplete, InputNumber } from 'antd';
import { useRef, useState } from 'react';

// import { AssetClass } from '@/kernel/typing';
import { useFontSizeByObserver } from '@hc/editor-core';
import { OptionalSize } from '@/config/basicVariable';
import { clickActionWeblog } from '@/utils/webLog';

// import commonStyles from '../common.modules.less';
import styles from './index.modules.less';
import { stopPropagation } from '@/utils/single';

const FontSize = () => {
  const [fontSize, updateFontSize] = useFontSizeByObserver();
  const timeOutTimer = useRef<any>(null);
  const intervalTimer = useRef<any>(null);
  const [open, _open] = useState(false);

  const onSelect = (value: string | number) => {
    const newSize = Number(value);
    // const currentAsset = getCurrentAsset();

    if (newSize !== fontSize) {
      updateFontSize(newSize);
    }
  };

  const stepHandle = (step: number) => {
    clickActionWeblog('QuickActions1');
    onSelect((fontSize ?? 0) + step);
    timeOutTimer.current = setTimeout(() => {
      let time = 1;
      intervalTimer.current = setInterval(() => {
        onSelect((fontSize ?? 0) + time * step);
        time += 1;
      }, 100);
    }, 400);
  };

  const onMouseUp = () => {
    clearTimeout(timeOutTimer.current);
    clearInterval(intervalTimer.current);
  };

  return (
    <AutoComplete
      options={OptionalSize.map(t => ({
        label: t,
        value: `${t}`,
        key: t,
      }))}
      onSelect={v => {
        onSelect(v);
        clickActionWeblog('QuickActions1');
      }}
      open={open}
      onDropdownVisibleChange={o => {
        if (!o) _open(false);
      }}
      onFocus={() => _open(true)}
    >
      <div className={styles.FontSize}>
        <div
          className={styles.item}
          onMouseDown={() => stepHandle(-1)}
          onMouseUp={onMouseUp}
        >
          -
        </div>
        <div className={styles.select}>
          <InputNumber
            value={fontSize ? window.parseInt(fontSize.toString()) : fontSize}
            onChange={v => {
              onSelect(v);
              clickActionWeblog('QuickActions1');
            }}
            style={{ width: 32, height: 26 }}
            onKeyDown={stopPropagation}
            onPaste={stopPropagation}
          />
        </div>
        <div
          className={styles.item}
          onMouseDown={() => stepHandle(1)}
          onMouseUp={onMouseUp}
        >
          +
        </div>
      </div>
    </AutoComplete>
  );
};

export default FontSize;
