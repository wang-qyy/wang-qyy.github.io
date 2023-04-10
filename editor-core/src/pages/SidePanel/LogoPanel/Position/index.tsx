import { clickActionWeblog } from '@/utils/webLog';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useUpdateLogoPosition, observer, toJS } from '@hc/editor-core';
import classNames from 'classnames';

import styles from './index.less';

const options = [
  { rotate: 325, position: 'nw', desc: '左上' },
  { rotate: 0, position: 'north', desc: '中上' },
  { rotate: 45, position: 'ne', desc: '右上' },
  { rotate: 270, position: 'west', desc: '左中' },
  { rotate: -1, position: 'center', desc: '中部' },
  { rotate: 90, position: 'east', desc: '右中' },
  { rotate: 225, position: 'sw', desc: '左下' },
  { rotate: 180, position: 'south', desc: '中下' },
  { rotate: 135, position: 'se', desc: '右下' },
];
const PositionWarp = () => {
  const [value, update] = useUpdateLogoPosition();

  return (
    <div className={styles.positionWarp}>
      {options.map(item => (
        <div
          key={item.rotate}
          className={classNames(styles.positionWarpItem, {
            [styles.positionWarpItemActive]: item.position === value,
          })}
          onClick={() => {
            update(item.position);
            clickActionWeblog('action_logo_position');
          }}
        >
          {item.rotate !== -1 ? (
            <ArrowUpOutlined rotate={item.rotate} />
          ) : (
            <div className={styles.dot} />
          )}
        </div>
      ))}
    </div>
  );
};

export default observer(PositionWarp);
