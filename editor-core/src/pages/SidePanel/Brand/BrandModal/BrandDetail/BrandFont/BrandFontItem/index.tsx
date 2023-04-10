import React, { useState } from 'react';
import { Dropdown } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import FontSet from '../FontSet';
import styles from './index.less';

function BrandFontItem(props: {
  type: string;
  item: any;
  updateFontDetail: () => void;
  fontList: any[];
  defaultFontSize: number;
}) {
  const { type, item, updateFontDetail, fontList, defaultFontSize } = props;

  const [visible, _visible] = useState(false);

  const bindText = (txt: string) => {
    if (item?.source_type === 1) {
      return `${txt}, ${item?.fontInfo?.values?.name}, ${item.font_size}`;
    }
    if (item?.source_type === 2) {
      return `${txt}, ${item?.fontInfo?.name}, ${item.font_size}`;
    }
    return `点击定义${txt}字体`;
  };

  const gitText = () => {
    switch (type) {
      case '1':
        return bindText('标题');
      case '2':
        return bindText('正文文本');
      case '3':
        return bindText('带底色');
    }
  };

  const getFontFamily = () => {
    return item?.source_type === 1
      ? `webfont-${item?.fontInfo?.font_id} ,font130`
      : item?.fontInfo?.font_id;
  };

  return (
    <Dropdown
      overlay={
        <FontSet
          type={type}
          data={item}
          updateFontDetail={updateFontDetail}
          fontList={fontList}
          defaultFontSize={defaultFontSize}
        />
      }
      visible={visible}
      onVisibleChange={visible => {
        _visible(visible);
      }}
      getPopupContainer={() => document.getElementById('brandDetailWarp')}
      placement="topRight"
      overlayClassName={styles.brandFontDropdown}
      trigger={['click']}
    >
      <div
        className={styles.brandFontStyleItem}
        style={{
          fontSize: item?.font_size || defaultFontSize,
          fontFamily: getFontFamily(),
        }}
        onClick={() => {
          _visible(!visible);
        }}
      >
        <span className={styles.leftSpan}>{gitText()}</span>
        <span className={styles.rightSpan}>
          <EditOutlined />
        </span>
      </div>
    </Dropdown>
  );
}

export default BrandFontItem;
