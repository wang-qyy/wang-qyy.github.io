import { useRef, useState, useEffect } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';
import {
  observer,
  Asset,
  useTextByObserver,
  useGetCurrentAsset,
} from '@hc/editor-core';
import { setAssetIntoView } from '@/utils/assetHandler';

import { stopPropagation } from '@/utils/single';

import Empty from '../Empty';
import styles from './index.modules.less';

const Item = observer(({ data }: { data: Asset }) => {
  const currentAsset = useGetCurrentAsset();
  const inputRef = useRef<any>();
  const {
    attribute: { text = [] },
  } = data;

  const textString = text?.join(' ');

  const [value, update] = useTextByObserver();
  const [isEdit, setIsEdit] = useState(false);
  const [inputValue, setInpuValue] = useState('');

  function onOk() {
    setIsEdit(false);
    update([inputValue]);
  }

  useEffect(() => {
    if (isEdit && inputRef.current) {
      inputRef.current.focus({
        cursor: 'end',
      });
    }
  }, [isEdit]);
  return (
    <div
      className={classNames(styles['text-item'], {
        [styles['text-item-active']]: currentAsset?.meta.id === data.meta.id,
      })}
      onClick={() => {
        setAssetIntoView({ asset: data });
        setIsEdit(true);
        setInpuValue(textString);
      }}
    >
      {isEdit ? (
        <Input
          ref={inputRef}
          defaultValue={textString}
          onChange={e => setInpuValue(e.target.value)}
          onBlur={onOk}
          onPressEnter={onOk}
          style={{ width: '100%' }}
          onKeyDown={stopPropagation}
        />
      ) : (
        textString
      )}
    </div>
  );
});

export default observer(({ list }: { list: Asset[] }) => {
  return (
    <div style={{ width: '100%' }}>
      <div className={styles['text-desc']}>
        单击选中文本框修改文字,为了保证模板效果,字体个数最好保持一致。
      </div>
      {list.length ? (
        <div className={styles['text-list']}>
          <div style={{ whiteSpace: 'nowrap' }}>
            {list.map(text => (
              <Item key={`text-${text.meta.id}`} data={text} />
            ))}
          </div>
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
});
