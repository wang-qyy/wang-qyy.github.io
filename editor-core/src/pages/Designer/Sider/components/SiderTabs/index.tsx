import { PropsWithChildren } from 'react';
import { Tabs, TabsProps } from 'antd';
import classNames from 'classnames';
import { CloseOutlined } from '@ant-design/icons';
import { assetBlur } from '@hc/editor-core';
import { audioBlur } from '@/store/adapter/useAudioStatus';

import styles from './index.modules.less';

interface SiderTabsProps extends TabsProps {
  closeable?: boolean;
}

export function SiderTabs({
  onChange,
  children,
  className,
  closeable = true,
  ...reset
}: PropsWithChildren<SiderTabsProps>) {
  return (
    <Tabs
      onChange={onChange}
      tabBarExtraContent={
        <div hidden={!closeable} className={styles.textTabsView}>
          <div
            className={styles.txtCloseIcon}
            onMouseDown={() => {
              assetBlur();
              audioBlur();
            }}
          >
            <CloseOutlined />
          </div>
        </div>
      }
      className={classNames('xdd-designer-sider-tab', className)}
      {...reset}
    >
      {children}
    </Tabs>
  );
}
export const { TabPane } = Tabs;
