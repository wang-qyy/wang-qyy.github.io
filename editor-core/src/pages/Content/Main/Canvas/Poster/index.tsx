import { useState, useEffect, CSSProperties, PropsWithChildren } from 'react';
import {
  useVideoHandler,
  useGetCurrentAsset,
  useCurrentTemplate,
  toJS,
  observer,
} from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';

import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';
import {
  useBackgroundControl,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';

import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';

function Preview(
  props: PropsWithChildren<{ style?: CSSProperties; className?: string }>,
) {
  const { style, className } = props;
  const { template } = useCurrentTemplate();
  const { isPlaying, playVideo } = useCanvasPlayHandler();
  const { currentTime } = useVideoHandler();
  const asset = useGetCurrentAsset();

  const {
    value: { panelKey: settingPanel },
  } = useSettingPanelInfo();
  const { backgroundControl } = useBackgroundControl();

  const [visible, setVisible] = useState(true);

  const { templateInfo } = useTemplateInfo();

  useEffect(() => {
    if (
      (visible && (isPlaying || settingPanel || currentTime > 0 || asset)) ||
      backgroundControl.inClipping
    ) {
      setVisible(false);
    }
  }, [
    isPlaying,
    settingPanel,
    currentTime,
    asset,
    backgroundControl.inClipping,
  ]);

  useEffect(() => {
    if (!visible) {
      setVisible(true);
    }
  }, [templateInfo.id]);

  if (!visible) return <></>;

  const poster = template?.template.preview_url || template?.template.poster;

  return (
    <div
      className={`${styles.wrap} ${className}`}
      // style={{ ...style }}
      onClick={() => {
        playVideo();
        setVisible(false);
        clickActionWeblog('canvas_play');
      }}
    >
      {poster && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              ...style,
            }}
          >
            <img src={poster} alt="preview" />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `url(${poster}) center / contain no-repeat`,
              ...style,
            }}
          />
          <div className={styles.icon}>
            <XiuIcon type="iconbofang" />
          </div>
        </>
      )}
    </div>
  );
}
export default observer(Preview);
