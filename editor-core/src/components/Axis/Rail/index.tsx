import { memo, useRef, CSSProperties, useState, useEffect } from 'react';
import { flatten } from 'lodash-es';
import { useSize } from 'ahooks';
import { getWebMVideoFrame } from '@/api/pub';

import emptyNoColor from '@/assets/image/emptyNoColor.png';

import styles from './index.modules.less';

const getKeyframeUrl = (t: number, src: string) => {
  const formatUrl = `${src}&x-oss-process=video/snapshot,t_${t},f_jpg,w_100`;
  return formatUrl;
};

export interface RailProps {
  assetUrl: string; // 视频资源地址 MP4
  assetDuation: number; // 元素原时长
  duration?: number;
  assetWidth: number;
  assetHeight: number;
  style?: CSSProperties;
  loopTimes?: number;
  poster?: string;
}

//
function Rail(props: RailProps) {
  const {
    assetUrl,
    assetWidth,
    assetHeight,
    assetDuation,
    style,
    poster,
    loopTimes = 1,
  } = props;
  const [imgError, setImgError] = useState(false);

  const railRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(railRef);
  const [videoFrame, setVideoFrame] = useState<Array<string>>([]);

  async function getWebMFrame(params: any) {
    const res = await getWebMVideoFrame(params);

    if (res.code === 0 && res.data?.count >= 0) {
      const newImgUrls = new Array(loopTimes).fill(res.data.urls);

      setVideoFrame(flatten(newImgUrls));
    }

    // console.log(res.data.urls);
  }

  useEffect(() => {
    if (width && height && assetUrl && loopTimes > 0) {
      const containerWidth = width / loopTimes;

      const imgWidth = height * (assetWidth / assetHeight);
      const imgCount = Math.floor(containerWidth / imgWidth);
      let step = Math.floor(assetDuation / imgCount);

      if (assetUrl.indexOf('.mp4?') >= 0) {
        const imgUrls: Array<string> = [];

        for (let i = 0; i < imgCount; i++) {
          imgUrls.push(getKeyframeUrl(i * step, assetUrl));
        }
        const newImgUrls = new Array(loopTimes).fill(imgUrls);

        setVideoFrame(flatten(newImgUrls));
      } else {
        step = ((assetDuation / 1000) * 30) / imgCount;
        // console.log({
        //   imgWidth,
        //   imgCount,
        //   containerWidth: width / loopTimes,
        //   loopTimes,
        //   step,
        // });

        getWebMFrame({
          frame_file: encodeURIComponent(assetUrl),
          img_count: imgCount,
          img_step: step,
        });
      }
    }
  }, [assetUrl, height, width, loopTimes]);

  return (
    <div
      ref={railRef}
      className={styles['rail-wrap']}
      style={{
        ...style,
        background: `url(${poster}) center / auto 100% repeat-x`,
        // backgroundRepeat: 'repeat-x',
        // backgroundSize: 'auto 100%',
        // backgroundColor: '#F0F2F4',
      }}
    >
      {videoFrame.map((frame, index) => {
        return (
          <img
            key={`rail-${frame}-${index}`}
            src={imgError ? emptyNoColor : frame}
            alt="videoFrame"
            // onError={() => setImgError(true)}
          />
        );
      })}
    </div>
  );
}

export default memo(Rail);
