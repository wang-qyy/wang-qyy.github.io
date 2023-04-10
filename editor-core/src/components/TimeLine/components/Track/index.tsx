import { useRef } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { TrackType } from '../../store';
import Asset from '../Asset';
import './index.less';
import { calcTimeToPx } from '../../utils/track';
import { useTimelineStore } from '../../context';

const Track = ({ track }: { track: TrackType }) => {
  const { height, assets, trackId } = track;
  const timeLineStore = useTimelineStore();
  const { virtualAssets, scale } = timeLineStore;
  const trackRef = useRef<HTMLDivElement>(null);

  const currentVirtualAssets = virtualAssets.filter(
    asset => asset.trackId === trackId,
  );

  return (
    <div
      className={classNames('timelint-track', {
        'timelint-track-add-active':
          currentVirtualAssets.length && track.isAddTrack,
      })}
      ref={trackRef}
      style={{ height }}
    >
      {assets.map(asset => (
        <Asset key={asset.id} asset={asset} height={height} />
      ))}
      {!track.isAddTrack &&
        currentVirtualAssets.map(asset => (
          <div
            key={asset.id}
            className="timelint-virtual-asset"
            style={{
              left: calcTimeToPx(asset.startTime, scale),
              width: calcTimeToPx(asset.endTime - asset.startTime, scale),
            }}
          />
        ))}
    </div>
  );
};

export default observer(Track);
