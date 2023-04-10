import react, { useEffect, useRef, FC, KeyboardEvent, FocusEvent } from 'react';
import { Input } from 'antd';
import { trim } from 'lodash-es';
import { stopPropagation } from '@/utils/single';

interface Prop {
  editable: boolean;
  alterName: Function;
  templateInfoTitle: string;
}
const UpdateInput: FC<Prop> = Props => {
  const inputRef = useRef<any>(null);
  const { editable, alterName, templateInfoTitle } = Props;

  const onOk = (
    e: KeyboardEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>,
  ) => {
    const defaultTitle = '未命名的设计';

    const inputValue = trim((e.target as HTMLInputElement).value);
    let title = inputValue.length ? inputValue : defaultTitle;
    alterName(title);
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
      defaultValue={templateInfoTitle}
      // onChange={onOk}
      onBlur={onOk}
      onPressEnter={onOk}
      onKeyDown={stopPropagation}
    />
  );
};

export default UpdateInput;
