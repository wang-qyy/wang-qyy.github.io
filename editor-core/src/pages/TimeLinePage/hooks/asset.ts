import { runInAction } from 'mobx';

import { AssetClass } from '@/kernel';
import { TrackChangeInfo } from '@/components/TimeLine/types';
import { reportChange } from '@/kernel/utils/config';

import { startZIndex } from '../options';
import timeLinePageStore from '../store';

export const reSortAsset = (info: TrackChangeInfo) => {
  const { record, trackId, index } = info;
  const { templateId, id } = record;
  const { templates } = timeLinePageStore;
  // 查找对应的的模板数据
  const currentTemp = templates.find(t => t.id === templateId);
  if (!currentTemp) return;
  const sortAssets = [...currentTemp.assets];
  // 替换位置
  const assetIndex = sortAssets.findIndex(t => t.id === id);

  const item = sortAssets.splice(assetIndex, 1)[0];
  if (!item) return;
  sortAssets.splice(index, 0, item);
  // 替换原数据的zindex，数据越靠前zindex值越大
  runInAction(() => {
    (item.asset as AssetClass).meta.trackId = trackId;
    sortAssets.forEach((asset, i) => {
      // 因为老数据基本没有 trackId 字段，这里同步下同轨道元素的 trackId
      if (asset.trackId === trackId) {
        (asset.asset as AssetClass).meta.trackId = trackId;
      }
      // 普通元素z-index从2开始 1未背景元素
      (asset.asset as AssetClass).transform.zindex =
        sortAssets.length - i + startZIndex;
    });
    // TODO: 这里需要把背景元素的zindex重置为 startZIndex - 1
  });

  reportChange('reSortAsset', true);
};
