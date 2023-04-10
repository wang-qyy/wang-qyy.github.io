import { getAllAsset, assetUpdater } from '@hc/editor-core';

/**
 * @description 插入背景
 * @param insertTime 插入或删除的元素的startTime
 * @param  duration   大于0 插入背景 小于0 删除背景（或将背景元素改为普通元素）
 * */
export function updateBackgroundAsset(insertTime: number, duration: number) {
  const allAsset = getAllAsset();
  allAsset.forEach(item => {
    const { startTime, endTime } = item.assetDuration;
    // console.log('updateBackgroundAsset', { insertTime, duration });

    if (startTime >= insertTime && item.meta.isBackground) {
      assetUpdater(item, {
        attribute: {
          startTime: startTime + duration,
          endTime: endTime + duration,
        },
      });
    }
  });
}

/**
 * 将时间转换成px
 * */
export function calcTimeToPx(time: number, unitWidth: number) {
  return (time / 1000) * unitWidth;
}

/**
 * 将时间转换成px
 * */
export function calcPxToTime(px: number, unitWidth: number) {
  return Math.ceil((px / unitWidth) * 1000);
}
