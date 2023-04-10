import {
  Asset,
  AssetClass,
  checkIsInnerMaskDragView,
  getCanvasInfo,
  getCurrentTemplate,
  Position,
  getAssetCoords,
  getEditableAssetOnCurrentTime,
  isAssetInMask,
  setAssetTempData,
  assetIsEditable,
} from '@hc/editor-core';

import { formatChildSizeByMask } from '@/kernel/utils/assetHelper/formater/dataBuilder';
import { MaskChildAssetType } from '@/kernel/utils/const';
import { getCanvasClientRect } from '@/kernel/utils/single';
import {
  getSidePanelInfo,
  getSettingPanel,
} from '@/store/adapter/useGlobalStatus';
import {
  handleAddAsset,
  handleAddModule,
  handleReplaceAsset,
} from '@/utils/assetHandler';
import { clickActionWeblog } from '@/utils/webLog';
import { useThrottleFn } from 'ahooks';
import { orderBy } from 'lodash-es';
import { useRef } from 'react';
import { DropTargetMonitor } from 'react-dnd';

export const useCanvasDrop = () => {
  const canvasRect = useRef(null);

  function filterMaskAsset(list: AssetClass[]) {
    const maskList = list.filter(
      (item: AssetClass) => item.meta.type === 'mask' && !item.meta.locked,
    );
    return orderBy(maskList, item => item.transform.zindex, 'desc');
  }
  // 左侧元素拖拽添加埋点
  function webLog(type: string) {
    const { menu } = getSidePanelInfo();
    const { panelKey: tool } = getSettingPanel();
    clickActionWeblog(`drag_${tool || menu}_add_${type}`);
  }

  const onDrop = ({ delta, dropInfo }: any) => {
    const canvasInfo = getCanvasInfo();
    if (!canvasRect.current) {
      canvasRect.current = getCanvasClientRect();
    }
    if (delta && dropInfo.offset && canvasRect.current) {
      const { left: offsetLeft, top: offsetTop } = canvasRect.current;

      if (dropInfo.meta.type == 'text') {
        delete dropInfo?.attribute?.rt_preview_url;
      }

      // 鼠标的位置
      const mousePosition = {
        x: delta?.x,
        y: delta?.y,
      };
      // 鼠标在画布里的位置
      const mousePositionCanvas = {
        left: delta?.x - offsetLeft,
        top: delta?.y - offsetTop,
      };
      // 反算真实图片的位置
      const position = {
        x:
          mousePosition.x -
          dropInfo?.attribute.width *
            canvasInfo.scale *
            dropInfo.offset.offsetLeftPercent,
        y:
          mousePosition.y -
          dropInfo?.attribute.height *
            canvasInfo.scale *
            dropInfo.offset.offsetTopPercent,
      };
      const dropAsset = {
        meta: dropInfo?.meta,
        attribute: dropInfo?.attribute,
        transform: {
          posX: (position?.x - offsetLeft) / canvasInfo.scale,
          posY: (position.y - offsetTop) / canvasInfo.scale,
        },
      };
      if (dropAsset.meta.isBackground) {
        dropAsset.transform.posX = 0;
        dropAsset.transform.posY = 0;
        const backgroundAsset = getCurrentTemplate().assets.find(
          item => item.meta.isBackground,
        );
        if (backgroundAsset) {
          handleReplaceAsset({ params: dropAsset, asset: backgroundAsset });
          // 背景埋点
          clickActionWeblog(`drag_replace_003`);
        } else {
          handleAddAsset(dropAsset);
          clickActionWeblog(`drag_add_003`);
        }
      } else if (dropAsset.meta.type === 'module') {
        handleAddModule(dropAsset.attribute.resId, dropAsset.transform);
        clickActionWeblog(`drag_module_add`);
      } else {
        handleAddAsset(dropAsset, mousePositionCanvas);
        // 埋点
        webLog(dropInfo.weblogType ?? dropAsset.meta.type);
      }
    }
  };
  const checkIsHoverInMask = (position: Position, item: Asset) => {
    let maskAsset: AssetClass;
    const assetListMask = filterMaskAsset(getEditableAssetOnCurrentTime());
    assetListMask.forEach(assetItem => {
      const mask = getAssetCoords(assetItem);
      const isHover = isAssetInMask(mask, position);
      const isMaskCenter = checkIsInnerMaskDragView(assetItem, position);
      if (isHover && !maskAsset) {
        let size;
        if (isMaskCenter) {
          size = formatChildSizeByMask(assetItem, {
            width: item.attribute.width,
            height: item.attribute.height,
          });
        }
        setAssetTempData(assetItem, {
          rt_hover: {
            isHover,
            isMaskCenter,
          },
          rt_asset: isMaskCenter
            ? {
                ...item,
                attribute: {
                  ...item.attribute,
                  ...size,
                },
              }
            : undefined,
        });
        maskAsset = assetItem;
      } else {
        setAssetTempData(assetItem, {
          rt_hover: {
            isHover: false,
            isMaskCenter: false,
          },
          rt_asset: undefined,
        });
      }
    });
  };
  const { run: onHover } = useThrottleFn(
    (item: any, monitor: DropTargetMonitor) => {
      if (
        item.meta.type &&
        MaskChildAssetType.includes(item.meta.type) &&
        !item.meta.isBackground
      ) {
        // 鼠标的位置
        const clientOffset = monitor.getClientOffset();
        canvasRect.current = getCanvasClientRect();
        if (clientOffset && canvasRect.current) {
          const { left: offsetLeft, top: offsetTop } = canvasRect.current;
          // 鼠标在画布里的位置
          const mousePositionCanvas = {
            left: clientOffset.x - offsetLeft,
            top: clientOffset.y - offsetTop,
          };
          checkIsHoverInMask(mousePositionCanvas, item);
        }
      }
    },
    { wait: 300 },
  );
  return { onDrop, onHover };
};
