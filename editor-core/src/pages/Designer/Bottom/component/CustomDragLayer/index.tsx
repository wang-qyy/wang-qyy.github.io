import { useEffect } from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { observer } from '@hc/editor-core';

import { updateAlignAsset } from '@/store/adapter/useDesigner';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';
import { calcTimeToPx, calcPxToTime } from '@/pages/Designer/Bottom/handler';

import { calcAssetAlign } from '@/pages/Designer/Bottom/Assets/Item/handler';
import './index.less';

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'block',
    };
  }
  const { x, y } = currentOffset;

  // const transform = `translate(${x - 87 + offset.x}px,calc(${y}px)`;

  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform,
  };
}

function CustomDragLayer() {
  const unitWidth = useGetUnitWidth();

  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer(monitor => {
      return {
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        // getInitialClientOffset: monitor.getInitialClientOffset(),
        // getClientOffset: monitor.getClientOffset(),
        // getDifferenceFromInitialOffset:
        //   monitor.getDifferenceFromInitialOffset(),
        isDragging: monitor.isDragging(),
      };
    });

  function getPreviewWidth() {
    if (!item || (itemType === 'audio' ? !item.endTime : !item.asset)) {
      return 0;
    }

    if (itemType === 'audio') {
      return `${calcTimeToPx(item.endTime - item.startTime, unitWidth)}px`;
    }

    const { startTime, endTime } = item.asset.assetDuration;
    const assetDuration = endTime - startTime;

    return `${calcTimeToPx(assetDuration, unitWidth)}px`;
  }

  useEffect(() => {
    if (item && item.source && currentOffset && initialOffset) {
      let { startTime: dragAssetStartTime, endTime: dragAssetEndTime } =
        item.asset.assetDuration;

      const duration = dragAssetEndTime - dragAssetStartTime;

      const moveX = initialOffset?.x - currentOffset.x;

      dragAssetStartTime -= calcPxToTime(moveX, unitWidth);
      dragAssetEndTime = duration + dragAssetStartTime;

      const {
        start: baseStartTime,
        end: baseEndTime,
        absolute,
      } = calcAssetAlign(
        {
          startTime: dragAssetStartTime,
          endTime: dragAssetEndTime,
        },
        item.asset,
      );

      updateAlignAsset([
        baseStartTime ? baseStartTime + absolute : undefined,
        baseEndTime ? baseEndTime + absolute : undefined,
      ]);
    }
  }, [currentOffset, item?.templateIndex]);

  console.log();

  return (
    <>
      <div className="designer-drag-layer">
        <div
          style={{
            width: getPreviewWidth(),
            ...getItemStyles(initialOffset, currentOffset),
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {item?.preview}
        </div>
      </div>
    </>
  );
}

export default observer(CustomDragLayer);
