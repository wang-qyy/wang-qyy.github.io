import { observer } from 'mobx-react';
import SplitPane from 'react-split-pane';
import { Tabs } from 'antd';
import { useKeyPress } from 'ahooks';

import { assetBlur, useCameraByObeserver, useVideoHandler } from '@/kernel';
import { audioBlur } from '@/store/adapter/useAudioStatus';

import { clickActionWeblog } from '@/utils/webLog';
import Tools from './components/Tools';
import Timeline from './components/Timeline';
import Stage from './components/Stage';
import Header from './components/Header';
import timeLinePageStore from './store';
import { useObserverPartKey, useObserverTemplates } from './hooks/observer';
import styles from './index.less';
import './resizer.less';
import { SplitPaneSize } from './options';

interface IProps {
  partKey: number;
  onClose: () => void;
}

const TimeLinePage: React.FC<IProps> = props => {
  const { partKey, onClose } = props;
  const { clearStatus } = useCameraByObeserver();
  const {
    canvasHeight,
    setCanvasHeight,
    templates,
    activePartKey,
    setActivePartKey,
  } = timeLinePageStore;

  useObserverTemplates();
  // useObserverAudios();
  useObserverPartKey(partKey);

  const close = () => {
    // 清空镜头展现状态
    clearStatus();
    onClose();
    clickActionWeblog('Timeline2');
  };

  useKeyPress(['esc'], () => {
    close();
  });

  const switchTime = (key: string) => {
    const value = Number(key);
    setActivePartKey(value);
    clickActionWeblog('Timeline6');
  };

  return (
    <div
      className={styles.TimeLine}
      onMouseDown={() => {
        audioBlur();
        assetBlur();
      }}
    >
      <Header onBack={close} />
      <div className={styles.content}>
        <SplitPane
          split="horizontal"
          size={canvasHeight}
          minSize={SplitPaneSize.minSize}
          maxSize={SplitPaneSize.maxSize}
          primary="second"
          pane1Style={{ height: 0 }}
          pane2Style={{
            maxHeight: SplitPaneSize.maxSize,
            minHeight: SplitPaneSize.minSize,
          }}
          onChange={setCanvasHeight}
        >
          {/** 画布 */}
          <Stage />
          <div className={styles.bottom}>
            <Tools />
            <div className={styles.tabs}>
              <Tabs
                activeKey={activePartKey?.toString()}
                type="card"
                size="small"
                onChange={switchTime}
              >
                <Tabs.TabPane tab="所有片段" key={-1} />
                {templates.map((temp, i) => (
                  <Tabs.TabPane
                    tab={`片段 ${i < 9 ? 0 : ''}${i + 1}`}
                    key={temp.id}
                  />
                ))}
              </Tabs>
            </div>
            {/** 时间轴 */}
            <Timeline />
          </div>
        </SplitPane>
      </div>
    </div>
  );
};

export default observer(TimeLinePage);
