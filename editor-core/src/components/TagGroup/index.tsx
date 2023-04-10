import { useState, PropsWithChildren } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Tag, Input } from 'antd';
import { stopPropagation } from '@/utils/single';

const colors = ['lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];

interface TagGroupProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export default function TagGroup(props: PropsWithChildren<TagGroupProps>) {
  const { value = [], onChange } = props;

  const [inputting, setInputting] = useState(false);
  const [inputValue, setInputValue] = useState('');

  function showInput() {
    setInputting(true);
  }

  function onInputConfirm(e: any) {
    let targetValue = e.target.value;
    targetValue = targetValue.replace(/\s+/g, '');

    if (inputValue) {
      onChange && onChange([...value, targetValue]);
    }
    setInputValue('');
  }

  function onDeleteTag(index: number) {
    value.splice(index, 1);

    onChange && onChange(value);
  }

  return (
    <>
      {value.map((tag, index) => (
        <Tag
          key={`tag_${index}`}
          color={colors[index % 6]}
          closable
          onClose={() => onDeleteTag(index)}
        >
          {tag}
        </Tag>
      ))}
      {inputting ? (
        <Input
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
          }}
          size="small"
          className="tag-input"
          onBlur={e => {
            onInputConfirm(e);
            setInputting(false);
          }}
          onPressEnter={onInputConfirm}
          onKeyDown={stopPropagation}
          onPaste={stopPropagation}
          style={{ width: 100 }}
          autoFocus
        />
      ) : (
        <Tag className="site-tag-plus" onClick={showInput}>
          <PlusOutlined /> 添加
        </Tag>
      )}
    </>
  );
}
