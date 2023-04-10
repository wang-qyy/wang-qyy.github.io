import React from 'react';
import { observer } from 'mobx-react';
import { VideoStatus, Audio, Audios } from '@kernel/typing';
import { useAudioAdapter } from '@kernel/store/audioHandler/adapter';
import AudioNode, { AudioProps } from '@kernel/Components/Audio';

export interface AudioBaseProps {
  videoStatus: VideoStatus;
}

export interface AudioListProps extends AudioBaseProps {
  audioList: Audios | undefined;
  templateIndex: number | string;
}

export interface AudioItemProps extends AudioBaseProps {
  audio: Audio;
  index: number;
}

export const AudioItem = observer(
  ({ videoStatus, audio, index }: AudioItemProps) => {
    let audioCut: undefined | AudioProps['audioCut'];
    const AudioAdapter = useAudioAdapter(index);

    function onLoadOver(status: boolean) {
      if (index > -1) {
        if (status) {
          AudioAdapter.loadSuccess();
        } else {
          AudioAdapter.loadError();
        }
      }
    }

    if (
      typeof audio.selfStartTime === 'number' &&
      typeof audio.selfDuration === 'number'
    ) {
      audioCut = {
        startTime: audio.selfStartTime,
        endTime: audio.selfStartTime + audio.selfDuration,
      };
    }
    return (
      <AudioNode
        src={audio.rt_url}
        loadInfo={audio.rt_loadInfo}
        index={index}
        isLoop={audio.isLoop}
        volume={audio.volume}
        startTime={audio.startTime}
        endTime={audio.endTime}
        videoStatus={videoStatus}
        onLoadOver={onLoadOver}
        duration={audio.rt_duration}
        audioCut={audioCut}
      />
    );
  },
);

function AudioList({ videoStatus, audioList, templateIndex }: AudioListProps) {
  return (
    <div>
      {audioList?.length ? (
        audioList.map((item: Audio, index: number) => {
          return (
            <AudioItem
              videoStatus={videoStatus}
              index={index}
              audio={item}
              key={`${templateIndex}-${item.resId}`}
            />
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
}

export default observer(AudioList);
