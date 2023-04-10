import { useRef, useState } from 'react';
import { Popover } from 'antd';
import classNames from 'classnames';
import { clickActionWeblog } from '@/utils/webLog';

import styles from '../index.less';
import LottieItem from './LottieItem';

const SimpleShow = (Props: {
  title: string;
  isMore: boolean;
  bindClickMore: (title: string) => void;
  data: any;
  id?: number | string;
  buttonShow?: boolean;
}) => {
  const { title, bindClickMore, data, isMore, id, buttonShow } = Props;
  const filterRef = useRef();

  const [roleMoreName, updateRoleMoreName] = useState();

  const content = (item: any) => {
    return (
      <div className={styles.rolePopoverWarp}>
        <div className={styles.rolePopoverWarpTitle}>{item.class_name}</div>

        <div className={styles.rolePopoverWarpContent}>
          {item.sub_list.map((i: any, index: number) => {
            return <LottieItem i={i} index={index} key={i.id} />;
          })}
        </div>
      </div>
    );
  };
  return (
    <div
      className={classNames(styles.simpleShow, {
        [styles.moreShow]: isMore,
      })}
      ref={filterRef}
    >
      <div className={styles.simpleShowTop}>
        <div className={styles.simpleShowTopLeft}>{title}</div>

        {buttonShow && (
          <div
            className={styles.simpleShowTopRight}
            onClick={() => {
              !isMore && updateRoleMoreName({ id, class_name: title });
              bindClickMore(isMore ? 'role' : 'role-more');
              clickActionWeblog('action_more');
            }}
          >
            {isMore ? '<返回' : '更多>'}
          </div>
        )}
      </div>

      <div
        className={styles.simpleShowContent}
        style={{ position: 'relative', overflowY: 'auto', overflowX: 'hidden' }}
      >
        {data.map((item: any, index: number) => {
          return (
            <Popover
              content={content(item)}
              key={item.id}
              placement="right"
              overlayClassName={styles.rolePopover}
              getPopupContainer={ele => ele.parentNode?.parentNode}
              zIndex={999999}
            >
              <div className={styles.item}>
                <img
                  src={item.preview}
                  alt="lottie"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </Popover>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleShow;
