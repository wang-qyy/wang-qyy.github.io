import { PropsWithChildren } from 'react';
import { SiderTabs } from '@/pages/Designer/Sider/components/SiderTabs';
import SiderTabPanel from '@/pages/Designer/Sider/components/SiderTabPanel';
import { observer, setFadeIn, setFadeOut } from '@hc/editor-core';
import { Slider } from 'antd';
import {
  useSetActiveAudio,
  updateAudioVolume,
  updateAudioFade,
} from '@/store/adapter/useAudioStatus';
import { useSetMusic } from '@/hooks/useSetMusic';

import styles from './index.modules.less';

const BasicItem = (props: PropsWithChildren<{ title: string }>) => {
  const { children, title } = props;
  return (
    <div className={styles.opacity}>
      <div className={styles.label}>{title}</div>
      {children}
    </div>
  );
};
const AudioController = ({ data = {} }: any) => {
  const { activeAudio } = useSetActiveAudio();
  const { bindSetVolume } = useSetMusic();
  return (
    <SiderTabs>
      <SiderTabPanel tab="基础" key="1">
        <div className={styles.basics}>
          <div className={styles.bottom}>
            <BasicItem title="声音大小">
              <div className={styles.progress}>
                <Slider
                  value={activeAudio?.volume}
                  onChange={value => {
                    bindSetVolume(value, activeAudio?.rt_id);
                    updateAudioVolume(value);
                  }}
                />
              </div>
              <div className={styles.number}>{activeAudio?.volume}</div>
            </BasicItem>

            <BasicItem title="声音淡入">
              <div className={styles.progress}>
                <Slider
                  tipFormatter={null}
                  value={activeAudio?.fadeIn}
                  max={5000}
                  onChange={value => {
                    setFadeIn(value, activeAudio?.rt_id);
                    updateAudioFade({ fadeIn: value });
                  }}
                />
              </div>
              <div className={styles.number}>
                {(activeAudio?.fadeIn / 1000).toFixed(1)}秒
              </div>
            </BasicItem>
            <BasicItem title="声音淡出">
              <div className={styles.progress}>
                <Slider
                  value={activeAudio?.fadeOut}
                  max={5000}
                  tipFormatter={null}
                  onChange={value => {
                    setFadeOut(value, activeAudio?.rt_id);
                    updateAudioFade({ fadeOut: value });
                  }}
                />
              </div>
              <div className={styles.number}>
                {(activeAudio?.fadeOut / 1000).toFixed(1)}秒
              </div>
            </BasicItem>
          </div>
        </div>
      </SiderTabPanel>
    </SiderTabs>
  );
};

export default observer(AudioController);
