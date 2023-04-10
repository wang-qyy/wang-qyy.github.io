import { observer } from 'mobx-react';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { Rail } from '@/components/Axis';
import { calcTimeToPx } from '@/components/TimeLine';
import { AssetType } from '@/components/TimeLine/store';

import timeLinePageStore from '../../store';
import styles from './index.less';

const Video = ({ asset }: { asset: AssetType }) => {
  const { timeLineScale } = timeLinePageStore;
  const { source } = asset;
  const sourceAsset = source.asset as AssetItemState;

  const {
    meta: { type },
    assetDurationWithOffset,
    attribute: {
      rt_url,
      rt_frame_file,
      rt_total_time = 0,
      width,
      height,
      isLoop,
      startTime,
      endTime,
      cst = 0,
    },
  } = sourceAsset;

  // const getLoopTimes = () => {
  //   return Math.ceil(
  //     (Math.min(assetDurationWithOffset.endTime, rt_total_time) -
  //       assetDurationWithOffset.startTime) /
  //       (endTime - startTime),
  //   );
  // };

  const getLoopTimes = () => {
    return Math.ceil(
      (endTime - startTime) /
        (Math.min(assetDurationWithOffset.endTime, rt_total_time) -
          assetDurationWithOffset.startTime),
    );
  };

  // const canClip = !isLoop;
  const loopTimes = getLoopTimes();

  return (
    <div className={styles.Video}>
      <div
        className={styles.videoOffset}
        style={{
          transform: `translateX(${-calcTimeToPx(
            asset.startTime - source.startTime,
            timeLineScale,
          )}px)`,
        }}
      >
        <Rail
          assetUrl={
            rt_url && rt_url.indexOf('.webm') > -1
              ? rt_frame_file || ''
              : rt_url
          }
          assetDuation={rt_total_time}
          assetWidth={width}
          assetHeight={height}
          loopTimes={loopTimes}
          style={{
            width: calcTimeToPx(rt_total_time * loopTimes, timeLineScale),
            left: `-${calcTimeToPx(cst, timeLineScale)}px`,
          }}
        />
      </div>
    </div>
  );
};

export default observer(Video);
