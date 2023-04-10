import { CSSProperties, PropsWithChildren, useRef, useState } from 'react';
import { Input, InputNumber, AutoComplete } from 'antd';
import classnames from 'classnames';
import { useFontSizeByObserver, observer } from '@hc/editor-core';
import OverwritePopover from '@/components/OverwritePopover';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { clickActionWeblog } from '@/utils/webLog';

import styles from './index.modules.less';
import { stopPropagation } from '@/utils/single';

const OptionalSize = [
  12, 14, 16, 18, 22, 36, 40, 50, 80, 120, 140, 160, 180, 200, 250, 300, 350,
  400, 500, 600,
];

export interface FontSizeListProps {
  onSelect: (fontSize: number) => void;
  selected: number;
  className?: string;
  style?: CSSProperties;
}

export function List({ selected, onSelect }: FontSizeListProps) {
  return (
    <OverlayScrollbarsComponent>
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
              e.stopPropagation();
              onSelect(fontSize);
            }}
          >
            {fontSize}
          </div>
        ))}
      </div>
    </OverlayScrollbarsComponent>
  );
}
export interface FontSizeProps {
  className?: string;
  style?: CSSProperties;
}
function FontSize(props: PropsWithChildren<FontSizeProps>) {
  const { ...others } = props;
  const timeOutTimer = useRef<any>(null);
  const intervalTimer = useRef<any>(null);
  const [open, _open] = useState(false);

  const [fontSize, updateFontSize] = useFontSizeByObserver();

  const onSelect = (value: string | number) => {
    const max = 600;
    const min = 12;
    const newSize = Number(value);
    let fontFize = newSize;

    if (newSize > max) {
      fontFize = max;
    } else if (newSize < min) {
      fontFize = min;
    }
    if (newSize !== fontSize) {
      updateFontSize(fontFize);
    }
  };

  const stepHandle = (step: number) => {
    clickActionWeblog('tool_fontSize');
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
      <div {...others}>
        <span
          className={styles.action}
          onMouseDown={e => stepHandle(-1)}
          onMouseUp={onMouseUp}
        >
          -
        </span>

        <InputNumber
          value={Math.floor(Number(fontSize ?? 0))}
          max={600}
          min={12}
          className={styles['input-number']}
          onChange={v => {
            onSelect(v);
            clickActionWeblog('QuickActions1');
          }}
          onKeyDown={stopPropagation}
          onPaste={stopPropagation}
        />

        <span
          className={styles.action}
          onMouseDown={e => stepHandle(1)}
          onMouseUp={onMouseUp}
        >
          +
        </span>
      </div>
    </AutoComplete>
  );
}

export default observer(FontSize);
