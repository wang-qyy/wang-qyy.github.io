import { CSSProperties, useRef, ReactDOM, PropsWithChildren } from 'react';
import classNames from 'classnames';

import { getAllAudios, observer, toJS, MultipleAudio } from '@hc/editor-core';
import { useSetMusic } from '@/hooks/useSetMusic';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import { stopPropagation } from '@/utils/single';
import DropContainer from '@/pages/Designer/Bottom/component/DropContainer';

import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import { formatAudiosTrack } from '@/CommonModule/Audios/handler';
import Contextmenu from './Contextmenu';

import Audio from './Audio';

import './index.less';

interface AudiosProps {
  className?: string;
  style?: CSSProperties;
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
  contextmenuTheme?: 'dark' | 'light';
  collapsed?: boolean;
  empty?: ReactDOM;
}

/**
 * @param collapsed 音乐轨道收起功能 当没有选中音频时收起
 * @param contextmenuTheme 右键菜单样式
 * */
export const Audios = observer((props: PropsWithChildren<AudiosProps>) => {
  const {
    className,
    style,
    contextmenuTheme,
    empty,
    wrapStyle,
    wrapClassName,
  } = props;
  const containerRef = useRef(null);

  const unitWidth = useGetUnitWidth();

  const value = getAllAudios();

  const { bindSetAudioCut, bindSetAudioDuration, bindRemoveAudio } =
    useSetMusic();
  const { activeAudio, updateActiveAudio, inCliping } = useSetActiveAudio();

  const audios = value ? formatAudiosTrack([...value]) : [];

  function handleDrop(dragItem: MultipleAudio, { offsetX }: any) {
    const changeTime = Math.ceil((offsetX / unitWidth) * 1000);
    let { startTime, endTime } = dragItem;

    startTime += changeTime;
    endTime += changeTime;

    if (startTime < 0) return;
    bindSetAudioDuration({ startTime, endTime }, dragItem.rt_id);

    updateActiveAudio({ ...toJS(dragItem), startTime, endTime });
  }

  if (!value.length && empty) {
    return empty;
  }

  return (
    <DropContainer
      acceptType="audio"
      style={{
        position: 'relative',
        height: 'auto',
        ...wrapStyle,
      }}
      onDrop={handleDrop}
      className={wrapClassName}
    >
      <Contextmenu theme={contextmenuTheme} trigger={['contextMenu']}>
        <div
          className={classNames(className)}
          ref={containerRef}
          style={{ ...style }}
        >
          {audios.map((track, index) => (
            <div
              key={`audio-track-${index}`}
              className={classNames('audio-track')}
              onMouseDown={stopPropagation}
            >
              {track.map(bgm => {
                return (
                  <Audio
                    trackIndex={index}
                    key={bgm.rt_id}
                    data={bgm}
                    active={bgm.rt_id === activeAudio?.rt_id}
                    style={{
                      opacity:
                        inCliping === index && bgm.rt_id !== activeAudio?.rt_id
                          ? 0
                          : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </Contextmenu>
    </DropContainer>
  );
});
