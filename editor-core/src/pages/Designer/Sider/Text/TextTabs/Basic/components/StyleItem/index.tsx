import { XiuIcon } from '@/components';
import { useHover } from 'ahooks';
import classNames from 'classnames';
import { useRef } from 'react';
import styles from './index.modules.less';

export const StyleItem = props => {
  const { icon, isActive = false, onCall } = props;

  const ref = useRef(null);
  const isHovering = useHover(ref);
  const onclickItem = () => {
    if (onCall) {
      onCall();
    }
  };
  return (
    <div
      ref={ref}
      onClick={onclickItem}
      className={classNames(styles.styleItem, {
        [styles.active]: isActive || isHovering,
      })}
    >
      <XiuIcon type={icon} />
    </div>
  );
};
export default StyleItem;
