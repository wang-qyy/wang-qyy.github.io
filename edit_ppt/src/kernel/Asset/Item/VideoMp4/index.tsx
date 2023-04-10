import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import VideoPlayer from '@kernel/Components/VideoPlayer';
import { useVideoPlayer } from '@kernel/Components/VideoPlayer/utils';
import PreviewVideo from '@kernel/Components/PreviewVideo';

export default observer(({ asset, showOnly, videoStatus }: AssetItemProps) => {
  const { defaultProps } = useVideoPlayer(asset, videoStatus);
  const { horizontalFlip, verticalFlip } = asset.transform;
  const { rt_total_frame, rt_url = '', rt_frame_file = '' } = asset.attribute;
  const props = {
    ...defaultProps,
    className: 'video-element',
  };

  const isWebm = rt_url.indexOf('.webm') > -1;

  return (
    <div
      className="movie-video-mp4-container"
      style={{
        opacity: asset.tempData?.rt_hover?.isHover ? '0.3' : 1,
        transform: `scaleX(${horizontalFlip ? -1 : 1}) scaleY(${
          verticalFlip ? -1 : 1
        })`,
      }}
    >
      {showOnly ? (
        <PreviewVideo
          isWebm={isWebm}
          totalFrame={rt_total_frame}
          isLoop={props.isLoop}
          cst={props.cst}
          cet={props.cet}
          videoUrl={isWebm ? rt_frame_file : props.url}
          videoStatus={videoStatus}
          id={asset.id}
        />
      ) : (
        <VideoPlayer {...props} key={props.url} id={asset.id} />
      )}
    </div>
  );
});
