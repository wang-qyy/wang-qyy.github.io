import {
  AssetClass,
  AssetSizeAndPosition,
  AssetStoreUpdateParams,
  AssetTime,
  Coordinate,
  Position,
} from '@kernel/typing';
import assetHandler from '@kernel/store/assetHandler';

import {
  assetBlur,
  getEditableAssetOnCurrentTime,
  getModuleData,
} from '@kernel/store/assetHandler/adapter';

import AssetItemState from '@kernel/store/assetHandler/asset';
import { isModuleType, isTempModuleType } from '@/kernel';
import { getRectCenter } from '@kernel/utils/mouseHandler/reactHelper';
import { relativeToAbsoluteByTempModule } from '@kernel/store/assetHandler/moduleHelper';

export interface RectCoords {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export function calcRectCoords(rect: AssetSizeAndPosition): RectCoords {
  const { left, top, width, height } = rect;
  const xMax = left + width;
  const yMax = top + height;
  return {
    xMin: left,
    xMax,
    yMin: top,
    yMax,
  };
}

export function getAssetCoords(asset: AssetClass) {
  const { containerSizeScale, assetPositionScale } = asset;
  const rect = {
    ...containerSizeScale,
    ...assetPositionScale,
  };
  return calcRectCoords(rect);
}

export function isAssetInSelectBox(a: RectCoords, b: RectCoords) {
  return !(
    a.xMax < b.xMin ||
    a.xMin > b.xMax ||
    a.yMax < b.yMin ||
    a.yMin > b.yMax
  );
}

export function isAssetInMask(a: RectCoords, position: Position) {
  return (
    a.xMax > position.left &&
    a.xMin < position.left &&
    a.yMax > position.top &&
    a.yMin < position.top
  );
}

/**
 * @description 根据多选数据，更新缓存组的子元素
 */
export const setTempModuleInfo = (module: AssetClass, assets: AssetClass[]) => {
  module.setChildren(assets);
  module.setModuleStyleByChildren();
};
/**
 * @description 根据多选数据，更新缓存组的子元素
 */
const setModuleChildrenTempData = (module: AssetClass) => {
  module.assets.forEach((asset) => {
    asset.setRtRelativeByParent();
  });
};
export const MultiSelectHandler = {
  toggleSelect: (asset: AssetClass) => {
    const { currentTemplate, active, setEditActive } = assetHandler;

    if (currentTemplate.multiSelect.size === 0) {
      if (!active) {
        setEditActive(asset);
      } else if (active !== currentTemplate.tempModule) {
        currentTemplate.addMultiSelect(active);
        currentTemplate.addMultiSelect(asset);
        setEditActive(currentTemplate.tempModule);
        setModuleChildrenTempData(currentTemplate.tempModule);
      }
    } else {
      if (currentTemplate.multiSelect.has(asset)) {
        currentTemplate.removeMultiSelect(asset);
      } else {
        currentTemplate.addMultiSelect(asset);
      }
      setEditActive(currentTemplate.tempModule);
      setModuleChildrenTempData(currentTemplate.tempModule);
    }
  },
  clear: () => {
    const { currentTemplate } = assetHandler;
    currentTemplate?.clearMultiSelect();
  },
  deleteMultiSelect: () => {
    const { currentTemplate } = assetHandler;
    if (currentTemplate) {
      currentTemplate.multiSelect.forEach((item) => {
        currentTemplate.removeAsset(item.id);
      });
      currentTemplate.clearMultiSelect();
    }
  },
  addAsset: (asset: AssetClass) => {
    const { currentTemplate } = assetHandler;
    currentTemplate?.addMultiSelect(asset);
  },
  removeAsset: (asset: AssetClass) => {
    const { currentTemplate } = assetHandler;
    currentTemplate?.removeMultiSelect(asset);
  },
};
/**
 * @description 将元素的绝对位置转换为相对于父元素的相对位置
 */
export const assetAbsoluteToRelative = (
  module: AssetClass,
  asset: AssetClass,
) => {
  const { left, top } = asset.assetPosition;
  const { left: pLeft, top: pTop } = module.assetPosition;
  asset.update({
    transform: {
      posX: left - pLeft,
      posY: top - pTop,
    },
  });
};
/**
 * @description 将元素相对于父元素的相对位置转化为绝对位置
 */
export const assetRelativeToAbsolute = (
  module: AssetClass,
  asset: AssetClass,
) => {
  const { posX: pLeft, posY: pTop, rotate: pRotate = 0 } = module.transform;
  let moduleCenter: Coordinate | undefined;
  const hasRotate = pRotate % 360 > 0;
  if (hasRotate) {
    moduleCenter = getRectCenter({
      ...module.assetSize,
      ...module.assetPosition,
    });
  }
  const { posX, posY, rotate = 0 } = asset.transform;
  const newData: AssetStoreUpdateParams = {
    transform: {
      posX: posX + pLeft,
      posY: posY + pTop,
      rotate: rotate + pRotate,
    },
  };

  // 如果是tempModule，需要额外处理相对数据转化为绝对数据的逻辑
  if (moduleCenter) {
    const result = relativeToAbsoluteByTempModule(asset, module, moduleCenter);
    Object.assign(newData.transform, result);
  }
  asset.update(newData);
};

// 多选元素转换为module
export const multiSelectToModule = () => {
  const { currentTemplate, setEditActive } = assetHandler;
  if (currentTemplate) {
    const { removeAsset, multiSelect, tempModule } = currentTemplate;
    const list = Array.from(multiSelect);
    const module = new AssetItemState(getModuleData(tempModule));
    const assetTime: AssetTime = {
      startTime: -1,
      endTime: -1,
    };
    list.forEach((item) => {
      if (
        assetTime.startTime < 0 ||
        item.assetDuration.startTime > assetTime.startTime
      ) {
        assetTime.startTime = item.assetDuration.startTime;
      }
      if (
        assetTime.endTime < 0 ||
        item.assetDuration.endTime < assetTime.endTime
      ) {
        assetTime.startTime = item.assetDuration.startTime;
      }
      item.setParent(module);
      // 由于父元素尺寸以来辅助线计算，所以此处需要在把绝对定位转换为相对定位前，先更新辅助线数据，方便父元素重新计算自身样式
      item.autoUpdateAuxiliary();
    });
    module.update({
      attribute: assetTime,
    });
    module.setChildren([...list], false);
    module.setModuleStyleByChildren();

    list.forEach((item) => {
      assetAbsoluteToRelative(module, item);
      // 当父元素样式计算完毕，则根据当前父元素的值，计算出相对数据
      item.setRtRelativeByParent();
      // 合并到module后，元素都需要在template中删除
      removeAsset(item.id);
    });
    currentTemplate.clearMultiSelect(false);
    currentTemplate.addAssets([module]);
    setEditActive(module);
    return module;
  }
};
// module转换为多选元素
export const moduleToMultiSelect = (moduleAsset: AssetClass) => {
  if (!isModuleType(moduleAsset)) {
    return;
  }
  const { setEditActive } = assetHandler;

  const currentTemplate = moduleAsset.template;

  if (currentTemplate) {
    const { tempModule, setMultiSelect, addAssets, removeAsset } =
      currentTemplate;

    const assets = [...moduleAsset.assets];

    assets.forEach((item) => {
      item.setParent(tempModule);
      assetRelativeToAbsolute(moduleAsset, item);
      item.autoUpdateAuxiliary();

      item.transform.zindex = currentTemplate.zIndex.max + 1;
    });
    // 因为module的子数据都保存在自己的assets中，所以这里需要把module的子数据添加到template中
    addAssets(assets);
    // 将字数据重新选中到虚拟组
    setMultiSelect(assets);
    setTimeout(() => {
      assets.forEach((item) => {
        item.setRtRelativeByParent();
      });
    }, 10);

    removeAsset(moduleAsset.id);
    setEditActive(tempModule);
  }
};

export const boxSelection = (box: AssetSizeAndPosition) => {
  const boxRect = calcRectCoords(box);
  const assets = getEditableAssetOnCurrentTime();
  assets.forEach((item) => {
    if (!isTempModuleType(item)) {
      const itemRect = getAssetCoords(item);
      if (isAssetInSelectBox(itemRect, boxRect)) {
        MultiSelectHandler.addAsset(item);
      } else {
        MultiSelectHandler.removeAsset(item);
      }
    }
  });
};
export const boxSelectionEnd = () => {
  const { currentTemplate, setEditActive } = assetHandler || {};
  if (!currentTemplate) {
    return;
  }
  const { multiSelect, tempModule } = currentTemplate;
  if (multiSelect.size === 0) {
    assetBlur();
  } else if (multiSelect.size === 1) {
    multiSelect.forEach((item) => {
      setEditActive(item);
    });
    MultiSelectHandler.clear();
  } else {
    setModuleChildrenTempData(tempModule);
    setEditActive(tempModule);
  }
};
