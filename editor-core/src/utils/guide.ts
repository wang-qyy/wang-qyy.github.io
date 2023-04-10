import { AssetClass, isMaskType } from '@hc/editor-core';
import {
  NoviceGuide,
  DragInMaskGuide,
  TrimDurationGuide,
} from '@/pages/Help/Guide/variable';
import {
  getGuideInfo,
  openSidePanelInfo,
  openGuide,
} from '@/store/adapter/useGlobalStatus';
import getUrlProps from '@/utils/urlProps';

import { getLocalStorage, setLocalstorageExtendStorage } from './single';

/**
 * 缓存当前执行的新手引导数据
 */
export function storageNovice() {
  const guideInfo = getGuideInfo();
  if (guideInfo?.currentStep && guideInfo.type === 1) {
    const urlProps = getUrlProps();
    let dataIndex;
    if (urlProps?.upicId) {
      return;
    }
    if (urlProps?.picId) {
      dataIndex = 0;
    } else {
      dataIndex = 1;
    }
    setLocalstorageExtendStorage('guide', {
      process: '',
    });
    setLocalstorageExtendStorage('guide', {
      process: {
        dataIndex,
        current: guideInfo?.currentStep,
      },
    });
  }
}
/**
 * 获取继续执行的新手引导
 * @returns
 */
export function getNoviceProcess() {
  const { process } = getLocalStorage('guide');
  if (process) {
    const { dataIndex, current } = process;
    return NoviceGuide[dataIndex][current];
  }
  return undefined;
}
/**
 * 执行触发式新手引导
 * @param asset
 */
export function doAssetGuide(asset: AssetClass) {
  // 新手引导相关
  const { dragInMaskGuide, assetGuide, novice } = getLocalStorage('guide');
  // 新手触发蒙版的拖拽引导
  if (isMaskType(asset)) {
    if (!dragInMaskGuide) {
      // 记录新手引导执行进度
      if (novice) {
        storageNovice();
      }
      openSidePanelInfo({ menu: 'user-space' });
      openGuide(DragInMaskGuide);
      setLocalstorageExtendStorage('guide', { dragInMaskGuide: true });
    }
  } else {
    if (!assetGuide) {
      // 记录新手引导执行进度
      if (novice) {
        storageNovice();
      }
      openGuide(TrimDurationGuide);
      setLocalstorageExtendStorage('guide', { assetGuide: true });
    }
  }
}
