import { observer } from 'mobx-react';
import { useRef } from 'react';
import { defaultRender } from '../../constants';
import { useTimelineStore } from '../../context';
import { AssetType } from '../../store';
import globalStore from '../../store/globalStore';
import { calcTimeToPx } from '../../utils/track';
import DragItem from './DragItem';
import './index.less';

const Asset = (props: { asset: AssetType; height: number }) => {
  const { asset, height } = props;
  const { type, id } = asset.source;
  const { endTime, startTime } = asset;
  const assetRef = useRef<HTMLDivElement>(null);
  const timeLineStore = useTimelineStore();
  // const { scale } = globalStore;

  const {
    options: { trackTypes = [] },
    // updateAsset,
    inDragging,
    activeIds,
    scale,
  } = timeLineStore;

  const width = calcTimeToPx(endTime - startTime, scale);

  const current = trackTypes.find(t => t.types.includes(type || ''));

  const render = current?.previewRender || defaultRender;

  const active = activeIds.includes(id);

  const style: React.CSSProperties =
    inDragging && active
      ? {
          position: 'fixed',
          zIndex: 2,
          ...asset.fixedPosition,
        }
      : {
          // left: calcTimeToPx(startTime),
          // transform: `translateX(${calcTimeToPx(startTime, scale)}px)`,
          left: calcTimeToPx(startTime, scale),
        };

  return (
    <div
      className="timeLine-asset"
      ref={assetRef}
      style={{
        width,
        height,
        ...style,
        display: width <= 0 ? 'none' : 'block',
      }}
    >
      <div className="timeLine-assetContent">
        <div className="timeLine-preview">{render(asset, active)}</div>
        <DragItem asset={asset} width={width} />
      </div>
    </div>
  );
};

export default observer(Asset);
