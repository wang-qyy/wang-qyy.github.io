import React from 'react';
import { observer } from 'mobx-react';
import { VideoStatus, MultipleAudio } from '@kernel/typing';
import { useAudioAdapter } from '@kernel/store/audioHandler/adapter';
import AudioNode, { AudioProps } from '@kernel/Components/Audio';
import { getTimeScale } from '@kernel/store/assetHandler/adapter';
import { useGetPreviewVideoStatus } from '@/kernel/store';

export interface AudioBaseProps {
  videoStatus: VideoStatus;
}

export interface AudioListProps extends AudioBaseProps {
  audioList: MultipleAudio[] | undefined;
  templateIndex: number;
}

export interface AudioItemProps extends AudioBaseProps {
  audio: MultipleAudio;
  index: number;
}

export const AudioItem = observer(
  ({ videoStatus, audio, index }: AudioItemProps) => {
    let audioCut: undefined | AudioProps['audioCut'];
    const AudioAdapter = useAudioAdapter(index);
    // 预览的音量
    const { volume = 100 } = useGetPreviewVideoStatus();

    function onLoadOver(status: boolean) {
      if (index > -1) {
        if (status) {
          AudioAdapter.loadSuccess();
        } else {
          AudioAdapter.loadError();
        }
      }
    }

    if (audio.cut && audio.cut.length) {
      audioCut = {
        startTime: audio.cut[0],
        endTime: audio.cut[1],
      };
    }
    return (
      <AudioNode
        src={audio.rt_url}
        loadInfo={audio.rt_loadInfo}
        index={index}
        isLoop={audio.isLoop}
        volume={(audio.volume * volume) / 100}
        fadeIn={audio.fadeIn}
        fadeOut={audio.fadeOut}
        startTime={audio.startTime}
        endTime={audio.endTime}
        videoStatus={videoStatus}
        onLoadOver={onLoadOver}
        duration={audio.rt_duration}
        audioCut={audioCut}
        speed={audio.speed}
      />
    );
  },
);

const AudioList = observer(({ videoStatus, audioList }: AudioListProps) => {
  return (
    <div className="hc-audio-list">
      {audioList?.length ? (
        audioList.map((item: MultipleAudio, index: number) => {
          return (
            <AudioItem
              videoStatus={videoStatus}
              index={index}
              audio={item}
              key={item.rt_id}
            />
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
});

/**
 * @description 根据当前模板来拆分音频的播放时间段
 * @param props
 * @constructor
 */
export const AudioWithTimeScale = observer((props: AudioListProps) => {
  const { videoStatus, templateIndex, audioList } = props;
  const timeScale = getTimeScale();
  const [startTime] = timeScale?.[templateIndex] ?? [];
  if (typeof startTime !== 'number') {
    return <></>;
  }
  const videoStatusWithTimeScale = {
    ...videoStatus,
    currentTime: startTime + videoStatus.currentTime,
  };
  return (
    <AudioList
      audioList={audioList}
      templateIndex={templateIndex}
      videoStatus={videoStatusWithTimeScale}
    />
  );
});

export default AudioList;
