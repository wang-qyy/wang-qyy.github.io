import { MouseEvent, useRef } from 'react';
import {
  AssetClass,
  multiSelectAsset,
  pauseVideo,
  activeEditableAsset,
  highlightEditableAssets,
  isTempModuleType,
  getMultiSelect,
  assetBlur,
} from '@hc/editor-core';
import { isMultiSelect } from '@/kernel/utils/hooks';

import { useDragDropManager } from 'react-dnd';

import { stopPropagation } from '@/utils/single';

import { audioBlur } from '@/store/adapter/useAudioStatus';

import {
  setAssetInDragging,
  clearDragStatus,
  setDragging,
} from '@/store/adapter/useAssetDrag';

export function stopDragEvent(e: MouseEvent) {
  e.preventDefault();
}

export function useAssetActions(opt: {
  asset: AssetClass;
  onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
}) {
  const dragDropManager = useDragDropManager();
  const actions = dragDropManager.getActions();
  const monitor = dragDropManager.getMonitor();

  const registry = dragDropManager.getRegistry();

  const { asset } = opt;
  // 清空移动状态
  const ref = useRef<{
    timer?: number;
    fn?: any;
  }>({});

  function canSelected() {
    if (asset.meta.isBackground) {
      return false;
    }

    return true;
  }

  function onClick(e: MouseEvent<HTMLDivElement>) {
    if (isMultiSelect()) return;

    stopPropagation(e);

    audioBlur();

    // TODO:多选拖拽操作需要取消assetBlur
    assetBlur();

    pauseVideo();
    if (!asset.meta.locked) {
      activeEditableAsset(asset);
    }

    setTimeout(() => {
      highlightEditableAssets([asset]);
    });
  }

  function onMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (!canSelected()) return;
    stopPropagation(e);

    // opt.onMouseDown?.(e);

    if (e.button === 0) {
      // 如果按下了多选按键，此处逻辑要走多选，
      if (isMultiSelect()) {
        e.preventDefault();

        const multiSelect = getMultiSelect();
        // 只能同时多选同一片段元素
        if (
          multiSelect[0] &&
          multiSelect[0]?.template?.id !== asset.template?.id
        ) {
          return false;
        }

        multiSelectAsset(asset);
      } else {
        // registry.addTarget();
        // actions.beginDrag(['S2', 'S5', 'S8']);
      }
    }

    ref.current.fn = () => {
      // @ts-ignore
      ref.current.timer = setTimeout(() => {
        clearDragStatus();

        if (monitor.isDragging()) {
          actions.endDrag();
        }

        if (ref.current.fn) {
          window.removeEventListener('mouseup', ref.current.fn);
        }
      });
    };

    window.addEventListener('mouseup', ref.current.fn);
  }

  return {
    onMouseDown,
    onClick,
  };
}
