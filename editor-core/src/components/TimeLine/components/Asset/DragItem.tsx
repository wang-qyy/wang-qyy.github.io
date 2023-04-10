import { useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { AssetType } from '../../store';
import { useMouseHandle } from '../../hooks';
import { getNodeFixedPosition } from '../../utils/common';
import { ChangeType, Position } from '../../types';
import {
  onDragAsset,
  onDragEnd,
  onDragLeft,
  onDragRight,
  onDragTimeEnd,
  structureVirtualAsset,
} from '../../utils/dragHandle';
import { useTimelineStore } from '../../context';
import globalStore from '../../store/globalStore';
import ClipItem from '../ClipItem/ClipItem';

const DragItem = (props: { asset: AssetType; width: number }) => {
  const { asset, width } = props;
  const { source } = asset;
  const { id, disableDrag } = source;
  const timeLineStore = useTimelineStore();
  const {
    replaceActiveIds,
    activeIds,
    setInDragging,
    updateAsset,
    putVirtualAsset,
    scroll,
    options,
    inDragging,
  } = timeLineStore;
  const {
    onMouseMove = () => {},
    onMouseDown = () => {},
    onMouseUp = () => {},
  } = options;
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<HTMLDivElement>(null);
  const fixedPosition = useRef<Position>(asset.fixedPosition);
  const initialScroll = useRef(scroll);

  const handleMouseDown = (changeType: ChangeType, e: MouseEvent) => {
    console.log('source', source, source.asset?.meta?.type);

    onMouseDown({
      id,
      record: source,
      changeType,
      event: e,
    });
    replaceActiveIds([id]);
  };

  //  更新元素的 fixedPosition
  const updateFixedPosition = () => {
    if (!moveRef.current) return;
    const position = getNodeFixedPosition(moveRef.current);
    updateAsset(asset, {
      fixedPosition: position,
    });
    fixedPosition.current = position;
    initialScroll.current = { ...scroll };
    return position;
  };

  useLayoutEffect(() => {
    updateFixedPosition();
  }, []);

  // 左边手柄
  useMouseHandle({
    ele: startRef,
    stopPropagation: true,
    onMouseDown: e => {
      handleMouseDown('start', e);
    },
    onMouseMove: info => {
      onDragLeft(asset, info, timeLineStore);
      onMouseMove({
        id,
        record: source,
        changeType: 'start',
        event: info.event,
      });
    },
    onMouseUp: info => {
      onDragTimeEnd(asset, timeLineStore, 'start', info);
      onMouseUp({
        id,
        record: source,
        changeType: 'start',
        event: info.event,
      });
    },
  });

  // 右边手柄
  useMouseHandle({
    ele: endRef,
    stopPropagation: true,
    onMouseDown: e => {
      handleMouseDown('end', e);
    },
    onMouseMove: info => {
      onDragRight(asset, info, timeLineStore);
      onMouseMove({
        id,
        record: source,
        changeType: 'end',
        event: info.event,
      });
    },
    onMouseUp: info => {
      onDragTimeEnd(asset, timeLineStore, 'end', info);
      onMouseUp({
        id,
        record: source,
        changeType: 'end',
        event: info.event,
      });
    },
  });

  // 拖拽当前元素
  useMouseHandle({
    ele: moveRef,
    onMouseDown: e => {
      updateFixedPosition(); // 更新当前元素的 FixedPosition
      handleMouseDown('move', e);
      setInDragging(true);
      const virtualAsset = structureVirtualAsset(asset, asset.trackId);
      putVirtualAsset(virtualAsset); // 添加到虚拟元素列表中
    },
    onMouseMove: info => {
      onMouseMove({
        id,
        record: source,
        changeType: 'move',
        event: info.event,
      });
      if (!moveRef.current || disableDrag) return;
      onDragAsset(
        asset,
        fixedPosition.current,
        initialScroll.current,
        info,
        timeLineStore,
      );
    },
    onMouseUp: info => {
      onDragEnd(asset, timeLineStore, info);
      onMouseUp({
        id,
        record: source,
        changeType: 'move',
        event: info.event,
      });
    },
  });

  return (
    <div
      className={classNames('timeLine-dragItem', {
        'timeLine-dragItem-active': activeIds.includes(id),
        'timeLine-dragItem-dragging': inDragging,
      })}
      ref={moveRef}
    >
      <ClipItem width={width} ref={startRef} time={asset.startTime} />
      <ClipItem width={width} ref={endRef} time={asset.endTime} />
    </div>
  );
};

export default observer(DragItem);
