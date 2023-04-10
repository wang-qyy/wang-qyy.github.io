import {
  CSSProperties,
  useRef,
  ReactElement,
  useState,
  PropsWithChildren,
} from 'react';
import classNames from 'classnames';

import { getAllAudios, observer } from '@hc/editor-core';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import { stopPropagation } from '@/utils/single';
import getUrlParams from '@/utils/urlProps';

import Contextmenu from './Contextmenu';
import { formatAudiosTrack } from './handler';

import Audio from './Audio';

import './index.less';

interface AudiosProps {
  className?: string;
  style?: CSSProperties;
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
  contextmenuTheme?: 'dark' | 'light';
  collapsed?: boolean;
  empty?: ReactElement;
  autoScroll?: boolean;
}

/**
 * @param collapsed 音乐轨道收起功能 当没有选中音频时收起
 * @param contextmenuTheme 右键菜单样式
 * */
const Audios = (props: PropsWithChildren<AudiosProps>) => {
  const { className, style, contextmenuTheme, empty, autoScroll } = props;
  const containerRef = useRef(null);

  const allAudios = getAllAudios();

  const { activeAudio, inCliping } = useSetActiveAudio();
  const [auxiliaryLine, setAuxiliaryLine] = useState(-1);

  const [trackZIndex, setTrackZIndex] = useState<number>(-1);

  const audios = formatAudiosTrack([...allAudios]);
  const isEmpty = !allAudios.length && empty;

  return (
    <Contextmenu theme={contextmenuTheme} trigger={['contextMenu']}>
      <div className={classNames(className)} style={{ ...style }}>
        {isEmpty ? (
          <> {empty}</>
        ) : (
          <div
            className="audio-wrap"
            ref={containerRef}
            // style={{ ...style }}
          >
            <div
              hidden={auxiliaryLine < 0}
              className={classNames('audio-auxiliary-line')}
              style={{ left: auxiliaryLine }}
            />
            {audios.map((track, index) => {
              return (
                <div
                  key={`audio-track-${index}`}
                  className={classNames('audio-track', {
                    'audio-track-incliping': inCliping === index,
                  })}
                  style={{ zIndex: trackZIndex === index ? 100 : 2 }}
                  onMouseDown={e => {
                    if (inCliping === index) {
                      stopPropagation(e);
                    }
                  }}
                >
                  {track.map(bgm => {
                    return (
                      <Audio
                        connect={getUrlParams().redirect !== 'designer'}
                        trackIndex={index}
                        key={bgm.rt_id}
                        data={bgm}
                        active={bgm.rt_id === activeAudio?.rt_id}
                        setAuxiliaryLine={setAuxiliaryLine}
                        autoScroll={autoScroll}
                        setTrackZIndex={setTrackZIndex}
                        style={{
                          opacity:
                            inCliping === index &&
                            bgm.rt_id !== activeAudio?.rt_id
                              ? 0
                              : 1,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Contextmenu>
  );
};

const AudioList = observer(Audios);

export { AudioList as Audios };
