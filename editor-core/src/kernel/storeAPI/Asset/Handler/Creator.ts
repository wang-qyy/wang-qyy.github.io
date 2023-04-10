import { Asset, Assets, PageAttr } from '@kernel/typing';
import assetHandler from '@kernel/store/assetHandler';
import historyRecord from '@kernel/store/historyRecord';

/**
 * @description 初始化元素列表
 * @param works
 * @param pageAttr
 */
export function initAssetWorks(works: Assets[], pageAttr: PageAttr) {
  if (works?.length) {
    historyRecord.initRecord();
    setTimeout(() => {
      assetHandler.setCurrentTemplate(0);
    });
  }
}
