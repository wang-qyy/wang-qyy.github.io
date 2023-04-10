import { debounce } from 'lodash-es';

import AssetItemState from '@/kernel/store/assetHandler/asset';
import assetHandler from '@kernel/store/assetHandler';
import audioHandler from '@kernel/store/audioHandler';
import { buildPureTemplatesWithRender } from '@kernel/utils/assetHelper/formater/dataBuilder';
import historyStore from './store/history';

// 判断当前元素是否为背景元素
export const isBackground = (asset: AssetItemState) => {
  const { isBackground: isBG, type } = asset.meta;
  return isBG && type === 'video';
};

/**
 * @description 记录当前操作
 */
// export const recordHistory = debounce(() => {
//   historyStore.addRecord({
//     templates: buildPureTemplatesWithRender(assetHandler.templates),
//     audios: audioHandler.multiAudios,
//   });
// }, 300);
