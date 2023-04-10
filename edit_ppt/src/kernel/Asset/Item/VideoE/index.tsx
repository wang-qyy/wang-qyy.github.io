import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps, VideoStatus } from '@kernel/typing';
import VideoPlayer from '@kernel/Components/VideoPlayer';
import { useVideoPlayer } from '@kernel/Components/VideoPlayer/utils';
import PreviewVideo from '@kernel/Components/PreviewVideo';

export default observer(
  ({ asset, showOnly, videoStatus, assetStyle, videoInfo }: AssetItemProps) => {
    const { horizontalFlip, verticalFlip } = asset.transform;
    const { rt_frame_file = '', rt_total_frame, rt_url = '' } = asset.attribute;
    const { defaultProps } = useVideoPlayer(asset, videoStatus);

    const props = {
      ...defaultProps,
      className: 'video-element',
      style: {
        width: '100%',
        height: '100%',
      },
    };
    const isWebm = useMemo(() => {
      return rt_url.indexOf('.webm') > -1;
    }, [rt_url]);

    return (
      <div
        className="videoEContainer"
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
            videoUrl={isWebm ? rt_frame_file : rt_url}
            videoStatus={videoStatus}
            id={asset.id}
          />
        ) : (
          <VideoPlayer
            {...props}
            key={props.url}
            speed={videoInfo.speed}
            id={asset.id}
          />
        )}
      </div>
    );
  },
);
