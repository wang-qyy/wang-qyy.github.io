import { CSSProperties, PropsWithChildren, useMemo } from 'react';
import {
  AssetClass,
  observer,
  toJS,
  useAllTemplateVideoTimeByObserver,
} from '@hc/editor-core';
import Rail from '@/components/Axis/Rail';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import styles from './index.modules.less';

interface VideoEProps {
  data: AssetClass;
  active?: boolean;
  style?: CSSProperties;
}

function VideoE({ data, style }: PropsWithChildren<VideoEProps>) {
  const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();

  const unitWidth = useGetUnitWidth();

  const { cst = 0, isLoop, rt_total_time: videoDuration } = data.attribute;

  const { size, loopTimes } = useMemo(() => {
    let times = 1;
    if (isLoop) {
      times = Math.ceil(allTemplateVideoTime / videoDuration);
    }
    const width = (videoDuration / 1000) * unitWidth * times;
    return {
      loopTimes: times,
      size: { width, left: -(cst / 1000) * unitWidth },
    };
  }, [unitWidth, data.attribute.cst, isLoop, allTemplateVideoTime]);

  return (
    <div className={styles['video-wrap']} style={{ ...size, ...style }}>
      <Rail
        assetUrl={
          data.attribute?.rt_url.indexOf('.webm?') >= 0
            ? data.attribute.rt_frame_file
            : data.attribute.rt_url
        }
        assetDuation={data.attribute.rt_total_time}
        assetHeight={data.attribute.height}
        assetWidth={data.attribute.width}
        loopTimes={loopTimes}
      />
    </div>
  );
}

export default observer(VideoE);
