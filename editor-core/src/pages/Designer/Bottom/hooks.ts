import { sortBy } from 'lodash-es';
import randomString from 'crypto-random-string';

import {
  useAllTemplateVideoTimeByObserver,
  AssetClass,
  AssetType,
} from '@hc/editor-core';
import { useSetTimeScale } from '@/store/adapter/useDesigner';

import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';
import { calcTimeToPx, calcPxToTime } from './handler';

export const createTrackId = () => randomString({ length: 6 });

export function useTimeAxis() {
  const { timeRuleScale } = useSetTimeScale();
  const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();

  const unitWidth = useGetUnitWidth();

  const clientWidth = calcTimeToPx(allTemplateVideoTime, unitWidth);

  const scaleEndTime = calcPxToTime(clientWidth, unitWidth);

  return {
    endTime: allTemplateVideoTime,
    scaleEndTime,
    clientWidth,
    timeRuleScale,
  };
}

export interface AssetTrack {
  trackId: string;
  accept: AssetType[];
  assets: AssetClass[];
}

export function formatAssets(data: AssetClass[]) {
  const allAsset = data.filter(asset => asset?.meta?.type !== '__module');

  const assets = allAsset.filter(
    item => !item.meta.isBackground && !item.meta.isTransfer,
  );

  const sortAssets = sortBy([...assets], o => -o.transform.zindex);
  // console.log(sortAssets);

  const temp: AssetTrack[] = [];
  sortAssets.forEach(asset => {
    const track = temp.find(item => item.trackId === asset.meta.trackId);
    const { startTime, endTime } = asset.assetDuration;

    if (endTime - startTime >= 100) {
      if (track) {
        track.assets.push(asset);
      } else {
        let { trackId } = asset.meta;

        if (!trackId) {
          trackId = createTrackId();
          asset.meta.trackId = trackId;
        }

        // 可以作为背景的元素
        const backgroundTrack: AssetType[] = ['pic', 'videoE'];

        temp.push({
          trackId,
          accept: backgroundTrack.includes(asset.meta.type)
            ? backgroundTrack
            : [asset.meta.type],
          assets: [asset],
        });
      }
    }
  });

  return {
    comAssets: temp,
  };
}
