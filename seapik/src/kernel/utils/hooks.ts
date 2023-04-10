import { MouseEvent, useRef, useEffect } from 'react';
import { AssetClass } from '@kernel/typing';
import { stopPropagation } from '@kernel/utils/single';
import {
  assetIsEditable,
  isNonEditable,
  assetIsSelectable,
  isTempModuleType,
  isModuleType,
} from '@kernel/utils/assetChecker';
import { setAssetActiveHandler } from '@kernel/store/assetHandler/adapter';
import { config, reportChange } from '@kernel/utils/config';
import { setReplaceStatus } from '@kernel/store';
import { holdKey } from '@kernel/utils/listener';
import { stopDragEvent } from '@kernel/utils/mouseHandler';
import { getAssetParent } from '@kernel/store/assetHandler/utils';
import { getTopAsset } from './StandardizedTools';

import { startCrop } from '@kernel/store/assetHandler/adapter/Handler/Updater';

export function isMultiSelect() {
  // todo 多选待优化 mouseEvent有个shiftKey,metaKey，ctrlKey进行优化
  return (
    holdKey.key && ['Meta', 'Ctrl', 'Control', 'Shift'].includes(holdKey.key)
  );
}

/**
 * 操作asset的公共方法
 * @param asset
 */
export function useAssetAction(asset: AssetClass | undefined) {
  // 清空移动状态
  const ref = useRef<{
    timer?: number;
    fn?: any;
  }>({});

  function canEdit() {
    if (asset) {
      return assetIsEditable(asset) && !isModuleType(asset);
    }
    return false;
  }

  function canSelect() {
    if (asset) {
      return assetIsSelectable(asset) && !isModuleType(asset);
    }
    return false;
  }

  function onClick(e: MouseEvent) {
    if (!canSelect()) {
      return;
    }

    stopPropagation(e);

    if (e.button !== 0) return;
    if (isMultiSelect()) {
      return;
    }
    setAssetActiveHandler.setEditActive(asset);
    clearTimeout(ref.current.timer);
    if (ref.current.fn) {
      window.removeEventListener('mouseup', ref.current.fn);
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (!canEdit() || asset?.meta.isBackground) {
      return;
    }
    stopPropagation(e);

    // 只有左键点击时触发
    if (e.button === 0) {
      // TODO: 组的问题没有解决暂时取消
      // 如果按下了多选按键，此处逻辑要走多选，
      // if (isMultiSelect()) {
      //   // TODO: 是否过滤所有锁定元素
      //   if (isTempModuleType(asset) || isNonEditable(asset)) {
      //     return;
      //   }
      //   let moduleItem = getAssetParent(asset) || asset;
      //   if (isTempModuleType(moduleItem)) {
      //     moduleItem = asset;
      //   }
      //   setAssetActiveHandler.toggleSelect(moduleItem);
      // } else {
      //   setAssetActiveHandler.setMoveActive(asset);
      // }
      setAssetActiveHandler.setMoveActive(asset);

      ref.current.fn = () => {
        // @ts-ignore
        ref.current.timer = setTimeout(() => {
          asset?.setTempData({
            rt_inMoving: false,
          });
          setAssetActiveHandler.clearMoveActive();
          if (ref.current.fn) {
            window.removeEventListener('mouseup', ref.current.fn);
          }
        });
      };
      window.addEventListener('mouseup', ref.current.fn);
    }
  }

  function onMouseEnter(e: MouseEvent) {
    if (!canEdit()) {
      return;
    }
    stopPropagation(e);
    setAssetActiveHandler.setHoverActive(asset);
  }

  function onMouseLeave() {
    setAssetActiveHandler.clearHoverActive();
  }

  function onDoubleClick(e: MouseEvent) {
    if (!canEdit() || isMultiSelect()) {
      return;
    }

    e.stopPropagation();
    const type = asset?.meta?.type ?? '';
    if (config.canUseTextEditor.includes(type)) {
      stopPropagation(e);
      setAssetActiveHandler.setTextEditActive(asset);
      reportChange('setTextEditActive', false);
    }
    // if (config.replaceable.includes(type)) {
    //   stopPropagation(e);
    //   setAssetActiveHandler.setEditActive(asset);
    //   reportChange('setEditActive', false);
    //   setReplaceStatus(true);
    // }

    if (['image', 'mask'].includes(type)) {
      startCrop();
    }
  }

  function onContextMenu(e: MouseEvent) {
    if (!canEdit()) {
      stopPropagation(e);
      e.preventDefault();
      e.nativeEvent.preventDefault();
      return;
    }

    const target = getTopAsset(asset);
    if (target?.meta.type === '__module') return;

    setAssetActiveHandler.setEditActive(asset);
  }
  // 删除时候，也要清楚移动状态
  useEffect(() => {
    return () => {
      clearTimeout(ref.current.timer);
      if (ref.current.fn) {
        window.removeEventListener('mouseup', ref.current.fn);
      }
    };
  }, []);
  return {
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onDoubleClick,
    onClick,
    onContextMenu,
    onDragStart: stopDragEvent,
    onDragEnd: stopDragEvent,
    onDrag: stopDragEvent,
  };
}
