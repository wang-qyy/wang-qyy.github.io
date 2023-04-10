import { PropsWithChildren } from 'react';
import XiuIcon from '@/components/XiuIcon';

import classNames from 'classnames';
import styles from './index.modules.less';

const menus: { [key: string]: any } = {
  ShiPinHao: {
    typeDesc: '视频号',
    back: true,
    search: true,
    user: true,
    menu: [
      { key: '1', name: '关注' },
      { key: '2', name: '朋友' },
      { key: '3', name: '推荐', active: true },
    ],
  },

  DouYin: {
    typeDesc: '抖音',
    search: true,
    menu: [
      { key: '1', name: '浦东' },
      { key: '2', name: '关注' },
      { key: '3', name: '推荐', active: true },
    ],
  },
  KuaiShou: {
    typeDesc: '快手',
    search: true,
    menu: [
      { key: '1', name: '关注' },
      { key: '2', name: '发现' },
      { key: '3', name: '精选', active: true },
    ],
  },
};

interface TopMenuProps {
  type: string;
}

export default function TopMenu({ type }: PropsWithChildren<TopMenuProps>) {
  const { menu, back, search, user } = menus[type];

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div hidden={!back} className={styles.back}>
          {'<'}
        </div>
      </div>

      <div className={styles.menu}>
        {menu.map(item => (
          <div key={item.key} className={item.active ? styles.active : ''}>
            {item.name}
          </div>
        ))}
      </div>

      <div className={styles.right}>
        {search && (
          <span className={styles.search}>
            <XiuIcon type="iconshipinhaosousuo" />
          </span>
        )}
        {user && (
          <span className={styles.user}>
            <XiuIcon type="iconshipinhaowode" />
          </span>
        )}
      </div>
    </div>
  );
}
