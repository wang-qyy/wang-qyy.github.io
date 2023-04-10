import { Popover } from 'antd';
import classNames from 'classnames';

import { useSetRoleMoreName } from '@/store/adapter/useDesigner';

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
  const { updateRoleMoreName } = useSetRoleMoreName();

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
    >
      <div className={styles.simpleShowTop}>
        <div className={styles.simpleShowTopLeft}>{title}</div>

        {buttonShow && (
          <div
            className={styles.simpleShowTopRight}
            onClick={() => {
              !isMore && updateRoleMoreName({ id, class_name: title });
              bindClickMore(isMore ? 'role' : 'role-more');
            }}
          >
            {isMore ? '<返回' : '查看更多>'}
          </div>
        )}
      </div>

      <div className={styles.simpleShowContent}>
        {data.map((item: any) => {
          return (
            <Popover
              content={content(item)}
              key={item.id}
              placement="rightBottom"
              overlayClassName={styles.rolePopover}
            >
              <div className={styles.item}>
                <img
                  src={item.preview}
                  alt=""
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
