import { useEffect, useMemo, PropsWithChildren } from 'react';
import classNames from 'classnames';
import {
  usePreviewPlayHandlerByObserver,
  togglePreviewVideoPlay,
  observer,
} from '@hc/editor-core';
import Preview from '@/pages/Preview/PreviewVideo';

import {
  useTemplateInfo,
  getCanvasInfo,
} from '@/store/adapter/useTemplateInfo';
import { XiuIcon } from '@/components';

import Bottom from './Bottom';
import TopMenu from './TopMenu';

import styles from './index.modules.less';

function getSize(scale: number) {
  const { width, height } = getCanvasInfo();

  return { width: width * scale, height: height * scale };
}

interface VideoProps {
  type: string;
  watermark?: boolean;
}

function Video({ type, watermark }: PropsWithChildren<VideoProps>) {
  const { templateInfo } = useTemplateInfo();
  const { isPlaying, playVideo } = usePreviewPlayHandlerByObserver();

  useEffect(() => {
    setTimeout(() => {
      playVideo();
    }, 1000);
  }, []);

  const scale = useMemo(() => {
    if (type === 'default') {
      const { height } = templateInfo.canvasInfo;

      if (height === 2208) {
        return 0.18;
      }
      if (height !== 1920) {
        return 0.28;
      }
    }

    return 0.2;
  }, [type]);

  return (
    <div
      className={classNames(styles.wrap)}
      style={type === 'default' ? getSize(scale) : { width: 216, height: 424 }}
    >
      <div
        hidden={isPlaying}
        className={styles.play}
        onClick={togglePreviewVideoPlay}
      >
        <XiuIcon type="iconbofang" />
      </div>

      <div
        className={styles['video-scale']}
        style={{ transform: `scale(${scale})` }}
      >
        <div
          style={{
            ...(type === 'default'
              ? templateInfo.canvasInfo
              : { width: 1080, height: 1920 }),
            position: 'relative',
            zIndex: 1,
          }}
          onClick={togglePreviewVideoPlay}
        >
          <Preview
            watermark={watermark}
            className={classNames({
              [styles['video-bg']]: type !== 'default',
            })}
          />

          <div className={styles['video-desc']}>
            <div
              hidden={!['DouYin', 'KuaiShou'].includes(type)}
              className={styles['user-name']}
            >
              @秀多多编辑器
            </div>

            <div
              hidden={type === 'default'}
              className={classNames(styles['video-title'], styles.ellipsis)}
            >
              {templateInfo.title}
            </div>

            <div
              hidden={!['DouYin', 'KuaiShou'].includes(type)}
              className={styles.bgm}
            >
              @秀多多创作的原声
            </div>
          </div>

          {type !== 'default' && (
            <div className={styles['video-top']}>
              <TopMenu type={type} />
            </div>
          )}
        </div>

        <div
          hidden={type === 'default'}
          className={styles['video-bottom']}
          style={{
            width: 1080,
            height: 200,
            backgroundColor: '#000',
            zIndex: 2,
          }}
        >
          <Bottom type={type} />
        </div>
      </div>
    </div>
  );
}
export default observer(Video);
