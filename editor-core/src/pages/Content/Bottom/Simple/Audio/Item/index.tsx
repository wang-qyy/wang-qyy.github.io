import { SyntheticEvent, useRef } from 'react';
import { useSize } from 'ahooks';
import { Modal } from 'antd';

import {
  observer,
  MultipleAudio,
  useAllTemplateVideoTimeByObserver,
  toJS,
} from '@hc/editor-core';
import Wavesurfer from '@/components/Wavesurfer';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import { setBottomMode } from '@/store/adapter/useGlobalStatus';

import './index.less';
import classNames from 'classnames';
import { stopPropagation } from '@/utils/single';

export default observer(({ audio }: { audio: MultipleAudio }) => {
  const { rt_id, rt_title, startTime, endTime, rt_sourceType } = audio;

  const { activeAudio, updateActiveAudio } = useSetActiveAudio();

  const audioRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useSize(audioRef);

  const [pageTime] = useAllTemplateVideoTimeByObserver();

  function handleActive(e: SyntheticEvent) {
    stopPropagation(e);
    if (rt_sourceType === 2) {
      Modal.confirm({
        title: 'ai语音需要在时间轴模式下调整',
        okText: '切换至时间轴模式',
        cancelText: '关闭',
        onOk() {
          setBottomMode('timeline');
        },
      });
    } else {
      updateActiveAudio(toJS(audio));
    }
  }

  return (
    <div ref={audioRef} className="audio-item-wrap">
      <div
        className={classNames('audio-item', {
          'audio-item-active': activeAudio?.rt_id === rt_id,
        })}
        style={{
          width: `${((endTime - startTime) / pageTime) * 100}%`,
          // left: `${(startTime / pageTime) * 100}%`,
          background: Number(rt_sourceType) === 2 ? '#51DB86' : '#5646ED',
        }}
        onClick={handleActive}
      >
        <Wavesurfer
          height={28}
          src={audio.rt_url}
          style={{
            position: 'absolute',
            height: '100%',
            width,
            zIndex: 1,
          }}
          waveColor="rgba(255,255,255,0.8)"
        />

        <div className="audio-item-title">{rt_title}</div>
        <div className="audio-item-duration">
          {((endTime - startTime) / 1000).toFixed(1)}s
        </div>
      </div>
    </div>
  );
});
