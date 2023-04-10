import { Button } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import Icon from '@/components/Icon';
import { useMenu } from '@/pages/store/menu';

import styles from './index.modules.less';

const MENU = [
  {
    key: 'text',
    label: 'Text',
    icon: 'iconwenzi',
  },
];

export default observer(() => {
  const { active, setActiveMenu, openMenu, open } = useMenu();

  return (
    <div className={styles.menu}>
      {MENU.map((menu) => (
        <Button
          type="text"
          key={menu.key}
          className={classNames(styles['menu-item'], {
            [styles.active]: active === menu.key && open,
          })}
          onClick={() => {
            setActiveMenu(menu.key);
            if (active === menu.key) {
              openMenu(!open);
            } else {
              openMenu(true);
            }
          }}
        >
          <Icon type={menu.icon} className={styles['menu-item-icon']} />
          <div className={styles['menu-item-label']}>{menu.label}</div>
        </Button>
      ))}
    </div>
  );
});
