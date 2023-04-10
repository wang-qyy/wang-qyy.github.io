import { Tabs } from 'antd';
import { PropsWithChildren } from 'react';
import styles from './index.modules.less';

const { TabPane } = Tabs;

const SiderTabPanel = ({ children, ...reset }: PropsWithChildren<any>) => {
  return (
    <TabPane className={styles.desigerSideTabPanel} {...reset}>
      {children}
    </TabPane>
  );
};
export default SiderTabPanel;
