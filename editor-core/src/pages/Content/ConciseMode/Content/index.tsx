import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { useSize } from 'ahooks';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { Progress, Slider } from 'antd';
import { XiuIcon } from '@/components';

import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import {
  Canvas,
  getAllTemplates,
  getCurrentAsset,
  getCurrentTemplate,
  recordHistory,
  setCurrentTimeWithThrottle,
  useBGMLoadingByObserver,
  useTemplateLoadByObserver,
  useVideoHandler,
} from '@hc/editor-core';
import { handleSave } from '@/utils/userSave';
import { msToSeconds } from '@/components/TimeLine/utils/common';
import {
  clickActionWeblog,
  templateFirstLoadTime,
  templateLoadLog,
  useEditorLog,
} from '@/utils/webLog';

import { windowsLoading } from '@/utils/single';
import getUrlProps from '@/utils/urlProps';
import styles from './index.less';
import Header from '../Header';
import conciseModeStore from '../store';
import ReplaceActions from '../ReplaceActions';

const padding = 20;

const Content = () => {
  const wrapper = useRef(null);
  const size = useSize(wrapper);
  const [poster, _poster] = useState('');

  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();
  const stageSize = getCanvasInfo();
  const { currentTime } = useVideoHandler();

  const currentTemplate = getCurrentTemplate();
  const currentAsset = getCurrentAsset();
  const { activeIndex } = conciseModeStore;

  const currentDuration =
    currentTemplate?.videoInfo.allAnimationTimeBySpeed || 0;

  useEffect(() => {
    currentTemplate?.template?.poster &&
      _poster(currentTemplate?.template?.poster);
  }, [currentTemplate]);

  useEffect(() => {
    if (isPlaying || currentAsset) _poster('');
  }, [isPlaying, currentAsset]);

  const urlParams = getUrlProps();
  const { loadComplete } = useTemplateLoadByObserver();
  const { loading: BGMLoading } = useBGMLoadingByObserver();

  useEffect(() => {
    if (getAllTemplates().length && BGMLoading && loadComplete) {
      windowsLoading.closeWindowsLoading();
      const performance = window.__EDITOR_PERFORMANCE__;
      if (!performance.completed) {
        // 资源加载结束
        performance.user_resorce_post_end = new Date().getTime();
        performance.completed = true;
      }
      if (performance.completed && !performance.sended) {
        templateLoadLog(urlParams as any);
      }

      templateFirstLoadTime(urlParams.picId, urlParams.upicId);
    }
  }, [BGMLoading, loadComplete]);

  const currentTimeInfo = msToSeconds(Math.max(currentTime, 0));
  const countInfo = msToSeconds(currentDuration);

  const scale = Math.min(
    ((size?.width || stageSize.width) - padding * 2) / stageSize.width,
    ((size?.height || stageSize.height) - padding * 2) / stageSize.height,
  );

  const clickPlay = () => {
    isPlaying ? pauseVideo() : playVideo();
    clickActionWeblog('concise24');
  };

  const buried = useEditorLog();

  return (
    <div className={styles.Content}>
      <Header />
      <div className={styles.canvasWrapper} ref={wrapper} style={{ padding }}>
        <div
          className={styles.stage}
          style={{
            width: stageSize.width * scale,
            height: stageSize.height * scale,
          }}
        >
          <div
            className={styles.poster}
            style={{
              backgroundImage: `url(${poster})`,
              display: poster ? 'block' : 'none',
            }}
            onClick={clickPlay}
          >
            <div className={styles.coverPlayer}>
              <XiuIcon
                type={isPlaying ? 'iconzanting' : 'iconbofang'}
                className={styles.coverPlayerIcon}
              />
            </div>
          </div>
          <Canvas
            onChange={(value, needSave) => {
              recordHistory();
              needSave && handleSave({ autoSave: true });
              buried(currentAsset, value);
            }}
            wholeTemplate={false}
            canvasInfo={{
              width: stageSize.width,
              height: stageSize.height,
              scale,
            }}
          />
          <ReplaceActions />
        </div>
      </div>
      <div className={styles.footer} style={{ width: stageSize.width * scale }}>
        {/* <div className={styles.slider} ref={sliderRef} onClick={setTime}>
          <Progress
            className={styles.progress}
            percent={(currentTime / currentDuration) * 100}
            showInfo={false}
            size="small"
          />
        </div> */}
        <Slider
          value={(currentTime / currentDuration) * 1000}
          tooltipVisible={false}
          className={styles.slider}
          max={1000}
          onChange={v => {
            setCurrentTimeWithThrottle((v / 1000) * currentDuration, false);
          }}
        />
        <div className={styles.partWrapper}>
          <div className={styles.partTitle}>
            <div className={styles.partButton}>
              片段{activeIndex < 9 ? 0 : ''}
              {activeIndex + 1}
            </div>
          </div>
          <div className={styles.player}>
            <div className={styles.playerIcon} onClick={clickPlay}>
              <XiuIcon
                type={isPlaying ? 'iconzanting' : 'iconbofang'}
                className={styles.icon}
              />
            </div>
            {currentTimeInfo.m}:{currentTimeInfo.s}/{countInfo.m}:{countInfo.s}
          </div>
          <div />
        </div>
      </div>
    </div>
  );
};

export default observer(Content);
