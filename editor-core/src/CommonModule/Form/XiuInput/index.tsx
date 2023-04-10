import react, { useEffect, useRef, FC, KeyboardEvent, FocusEvent } from 'react';
import { Input } from 'antd';
import { trim } from 'lodash-es';
import { stopPropagation } from '@/utils/single';

interface Prop {
  defaultValue?: string,
  editable: boolean;
  onChange: Function;
}
const XiuInput: FC<Prop> = Props => {
  const inputRef = useRef<any>(null);
  const { editable, onChange, defaultValue = '双击编辑文字' } = Props;

  const onOk = (
    e: KeyboardEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>,
  ) => {
    const inputValue = trim((e.target as HTMLInputElement).value);
    let title = inputValue.length ? inputValue : defaultValue;
    onChange(title);
  };

  useEffect(() => {
    if (editable && inputRef.current) {
      inputRef.current.focus({
        cursor: 'all',
      });
    }
  }, [editable]);
  return (
    <Input
      ref={inputRef}
      style={{ width: '100%' }}
      // width="100%"
      //  value={templateInfo.title}
      // onChange={e => {
      //   handleChenge(e.target.value);
      // }}
      defaultValue={defaultValue}
      // onChange={onOk}
      onBlur={onOk}
      onPressEnter={onOk}
      onKeyDown={stopPropagation}
    />
  );
};

export default XiuInput;
