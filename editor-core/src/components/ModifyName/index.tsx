import React, { useEffect, useState, useRef } from 'react';
import { Input } from 'antd';
import { stopPropagation } from '@/utils/single';
import { EditOutlined } from '@ant-design/icons';
import classNames from 'classnames';

function ModifyName(props: {
  templateTitle: any;
  alterName: (val: string) => void;
  styles: any;
}) {
  const { templateTitle, alterName, styles } = props;

  const [inputValue, setInputValue] = useState('');
  const [inputShow, setInputShow] = useState(false);

  const inputRef = useRef(null);

  // 显示输入框 更新输入框的值为当前模板名
  useEffect(() => {
    if (inputShow) {
      setInputValue(templateTitle);
    }
  }, [inputShow]);

  return (
    <div
      onClick={e => {
        e.stopPropagation();
      }}
      className={classNames(styles.itemFooterTopRight, {
        [styles.itemFooterTopRightIsExport]: inputShow,
      })}
    >
      <Input
        className={styles.itemFooterTopInput}
        ref={inputRef}
        onChange={e => {
          setInputValue(e.target.value);
        }}
        onBlur={e => {
          setInputShow(false);
          alterName(e.target.value);
        }}
        onPressEnter={e => {
          setInputShow(false);
        }}
        value={inputValue}
        bordered={false}
        onKeyDown={stopPropagation}
        onPaste={stopPropagation}
      />
      <span
        className={styles.itemFooterTopRightWarp}
        onClick={e => {
          setInputShow(true);
          setTimeout(() => {
            inputRef.current!.focus({
              cursor: 'all',
            });
          }, 0);
          e.stopPropagation();
        }}
      >
        <span className={styles.itemFooterTopRightName}>{templateTitle}</span>
        <span className={styles.itemFooterTopRightIcon}>
          <EditOutlined />
        </span>
      </span>
    </div>
  );
}

export default ModifyName;
