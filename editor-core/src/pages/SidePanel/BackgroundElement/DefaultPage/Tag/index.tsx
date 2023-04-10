/* eslint-disable react/display-name */
import React, { memo, useRef, useState, useEffect } from 'react';
import classnames from 'classnames';
import { CaretDownOutlined } from '@ant-design/icons';
import { useSize } from 'ahooks';
import styles from './index.less';

function SearchBar(props: any) {
  const { data, lable, bindClickTag, type } = props;
  const childRef = useRef(null);
  const wrapperRef = useRef(null);
  const { width: parentWidth }: any = useSize(wrapperRef);
  const { width: childWidth }: any = useSize(childRef);
  const [id, setId] = useState('');
  const [moreShow, _moreShow] = useState(false);

  // const
  // 自定义样式
  const [autoStyle, setAutoStyle] = useState(false);

  const seeMore = () => {
    setAutoStyle(!autoStyle);
  };

  useEffect(() => {
    if (childWidth >= parentWidth) {
      _moreShow(true);
    } else {
      _moreShow(false);
    }
  }, [parentWidth, childWidth]);

  return (
    <div className={styles.searchBypeItem} ref={wrapperRef}>
      {lable && (
        <div
          className={classnames({
            [styles.searchBypeItemTitle]: true,
            [styles.searchBypeItemTitleAc]: id == '',
          })}
          onClick={() => {
            setId('');
            bindClickTag('', type);
          }}
        >
          {lable}
        </div>
      )}
      <div
        className={classnames(
          styles.searchBypeItemChild,
          autoStyle ? styles.childWrapper : '',
        )}
        ref={childRef}
      >
        {data?.map((item: any) => {
          return (
            <div
              key={item.id}
              className={classnames({
                [styles.searchBypeItemChildli]: true,
                [styles.searchBypeItemChildChoosed]: id == item.id,
              })}
              onClick={() => {
                setId(item.id);
                bindClickTag(item.id, type);
              }}
            >
              {item?.name}
            </div>
          );
        })}
      </div>
      {moreShow && (
        <div className={styles.searchBypeItemMore} onClick={seeMore}>
          更多
          <CaretDownOutlined
            className={classnames({
              [styles.moreTag]: true,
              [styles.moreTagClose]: autoStyle,
            })}
          />
        </div>
      )}
    </div>
  );
}

export default memo(SearchBar);
