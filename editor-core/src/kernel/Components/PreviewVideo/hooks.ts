import { useEffect, useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';
import { getVideoFrameFormOss } from '@kernel/utils/StandardizedTools';
import { config } from '@kernel/utils/config';
import { PreviewVideoProps } from '@kernel/Components/PreviewVideo/index';

type UrlCallback = (res: string) => void;

interface VideoDomListItem {
  frameCache: Record<string, string>;
}

const videoDomList: Record<string, VideoDomListItem> = {};

async function getWebmFrame(
  videoSrc: string,
  currentFrame: number,
  cb: UrlCallback,
) {
  if (videoDomList[videoSrc]?.frameCache?.[currentFrame]) {
    cb(videoDomList[videoSrc].frameCache[currentFrame]);
    return;
  }
  const baseUrl = config.getApi('getWebmFrameImage');
  const frameFile = encodeURI(videoSrc);

  const res = await fetch(
    `${baseUrl}?frame_file=${frameFile}&img_count=${1}&img_step=${0}&start_frame=${Math.round(
      currentFrame,
    )}`,
    {
      credentials: 'include',
    },
  );
  const { data } = await res.json();
  if (data?.urls?.length) {
    cb(data.urls[0]);
    if (!videoDomList[videoSrc]) {
      videoDomList[videoSrc] = {
        frameCache: {},
      };
    }
    // eslint-disable-next-line prefer-destructuring
    videoDomList[videoSrc].frameCache[currentFrame] = data.urls[0];
  }
}

export function useStaticVideoPreview({
  isWebm,
  videoUrl,
  videoStatus,
  cet,
  cst,
  isLoop,
  totalFrame,
}: PreviewVideoProps) {
  const [url, setUrl] = useState('');
  const currentTime = useMemo(() => {
    let time = videoStatus.currentTime;
    if (cst !== undefined && cst >= 0 && cet) {
      time += cst;
      const duration = cet - cst;
      if (time > cet && isLoop) {
        time = (time % duration) + cst;
      }
    } else {
      if (time / 30 > totalFrame) {
        time %= totalFrame * 30;
      }
    }

    return time;
  }, [videoStatus.currentTime, cet, cst, isLoop]);

  useDebounceEffect(
    () => {
      if (isWebm) {
        const currentFrame = Math.min(
          (currentTime / 1000) * 30,
          totalFrame - 1,
        );
        getWebmFrame(videoUrl, currentFrame, res => {
          setUrl(res);
        });
      } else {
        setUrl(getVideoFrameFormOss(videoUrl, Math.round(currentTime)));
      }
    },
    [videoUrl, currentTime],
    {
      wait: 50,
    },
  );

  return url;
}
