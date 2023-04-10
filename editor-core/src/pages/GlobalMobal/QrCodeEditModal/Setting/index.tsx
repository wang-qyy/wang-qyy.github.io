import { QrcodeInfo } from '@/kernel';
import { Tabs } from 'antd';
import { observer } from 'mobx-react';

import ContentSet from './ContentSet';
import StyleSet from './StyleSet';
import styles from './index.less';

const Setting = ({
  state,
  dispatch,
}: {
  state: QrcodeInfo;
  dispatch: React.Dispatch<Partial<QrcodeInfo>>;
}) => {
  return (
    <div className={styles.Setting}>
      <div className={styles.title}>二维码设置</div>
      <div className={styles.content}>
        <Tabs>
          <Tabs.TabPane tab="内容" key="text">
            <ContentSet state={state} dispatch={dispatch} />
          </Tabs.TabPane>
          {/* 样式设置 */}
          <Tabs.TabPane tab="样式" key="style">
            <StyleSet state={state} dispatch={dispatch} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default observer(Setting);
