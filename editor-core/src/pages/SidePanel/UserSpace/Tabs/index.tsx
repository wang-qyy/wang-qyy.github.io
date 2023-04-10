import classname from 'classnames';

import styles from './index.modules.less';

interface TabsItem {
  key: string;
  name: string;
}

interface TabsProps {
  tabs: Array<TabsItem>;
  active: string;
  onChange: (active: string) => void;
}

const Tabs = ({ tabs, active, onChange }: TabsProps) => {
  return (
    <div className={styles.wrap}>
      {tabs.map(tab => (
        <div
          key={tab.key}
          className={classname(styles.item, {
            [styles.active]: active === tab.key,
          })}
          onClick={() => onChange(tab.key)}
        >
          {tab.name}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
