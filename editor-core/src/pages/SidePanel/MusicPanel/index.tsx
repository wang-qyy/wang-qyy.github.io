import { useState, useEffect } from 'react';
import { Tabs, Button } from 'antd';
import {
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { useSetMusic } from '@/hooks/useSetMusic';
import {
  useAudioSetModal,
  useLeftSideInfo,
} from '@/store/adapter/useGlobalStatus';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import Search from '@/components/Search';
import SidePanelWrap from '@/components/SidePanelWrap';
import { getLocalStorage, setLocalstorage } from '@/utils/single';
import { XiuIcon } from '@/components';
import { clickActionWeblog } from '@/utils/webLog';
import LocalUpload from './LocalUpload';

import styles from './index.module.less';
import MusicLibrary from './MusicLibrary';
import List from './MusicLibrary/list';
import More from './MusicLibrary/more';

const { TabPane } = Tabs;

const MusicPanel = () => {
  const { updateMusicStatus } = useMusicStatus();
  const { visible } = useAudioSetModal();
  const [tip, setTip] = useState(false);
  const { checkLoginStatus } = useCheckLoginStatus();
  const [activeKey, setActiveKey] = useState('1');
  const [keyword, setKeyword] = useState(''); // 搜索关键词
  const { BGMList } = useSetMusic();
  const audio = BGMList[0] || null;
  const [playingId, setPlayingId] = useState<string | undefined>();

  const { leftSideInfo, openSidePanel } = useLeftSideInfo();
  useEffect(() => {
    updateMusicStatus({
      musicType: 'bgm',
      musicItem: JSON.parse(JSON.stringify(audio)),
    });
  }, [audio]);

  useEffect(() => {
    if (!visible) {
      updateMusicStatus({
        musicType: 'bgm',
        musicItem: JSON.parse(JSON.stringify(audio)),
      });
    }
  }, [visible]);
  useEffect(() => {
    if (!getLocalStorage('musicGuide')) {
      setTip(true);
    }
  }, []);
  return (
    <SidePanelWrap
      search={
        <Search
          searchKey="keyword"
          placeholder="搜索你需要的音乐"
          onChange={({ keyword }) => {
            openSidePanel();
            setKeyword(keyword);
            clickActionWeblog('action_music_search');
          }}
          defaultValue={{ class_id: '' }}
          className={styles['music-categories']}
        />
      }
      bottom={
        tip ? (
          <div className={styles['music-guide']}>
            <ExclamationCircleOutlined
              style={{ color: '#FF5A21', fontSize: 14, marginRight: 5 }}
            />
            {/* 应授权方要求， */}
            音频中所含“猴子音悦”人声水印，下载后消失。
            <span
              className={styles.close}
              onClick={() => {
                setTip(false);
                setLocalstorage('musicGuide', true);
              }}
            >
              知道了
            </span>
          </div>
        ) : null
      }
    >
      <LazyLoadComponent visible={!leftSideInfo.submenu}>
        {!keyword ? (
          <Tabs
            className={styles.musicTabs}
            defaultActiveKey="1"
            activeKey={activeKey}
            onChange={activeKey => {
              setPlayingId(undefined);
              if (activeKey === '3') {
                const loginStatus = checkLoginStatus();
                if (loginStatus) {
                  return;
                }
                setActiveKey(activeKey);
              } else {
                setActiveKey(activeKey);
              }
              clickActionWeblog('action_music_tabs', {
                action_label: activeKey,
              });
            }}
          >
            <TabPane tab="音乐" key="1">
              <MusicLibrary filter_id="1230883" pid="1025" resource_flag="GA" />
            </TabPane>
            <TabPane tab="音效" key="2">
              <MusicLibrary filter_id="1230860" pid="1026" resource_flag="GA" />
            </TabPane>
            <TabPane tab="我的音频" key="3">
              <LocalUpload playingId={playingId} setPlayingId={setPlayingId} />
            </TabPane>
          </Tabs>
        ) : (
          <List keyword={keyword} />
        )}
      </LazyLoadComponent>
      <LazyLoadComponent visible={Boolean(leftSideInfo.submenu && !keyword)}>
        <More />
      </LazyLoadComponent>
    </SidePanelWrap>
  );
};

export default MusicPanel;
