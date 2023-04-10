import { CSSProperties, PropsWithChildren, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { sortBy } from 'lodash-es';
import { useDragDropManager } from 'react-dnd';

import {
  observer,
  AssetType,
  TemplateClass,
  getTemplateIndexById,
  useGetAllTemplateByObserver,
  useGetCurrentInfoByObserver,
} from '@hc/editor-core';

import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import { formatAssets } from '@/pages/Designer/Bottom/hooks';
import { calcTimeToPx } from '../handler';
import { BackgroundAsset } from '../BackgroundAssets';

import AssetItemComponent from './Item';
import { Track, TrackGroup, TrackData } from './Track';

import styles from './index.modules.less';

export interface DropResult {
  offsetX: number;
  track: TrackData;
  template: TemplateClass;
}

interface AssetListProps {
  style?: CSSProperties;
  template: TemplateClass;
  isLast?: boolean;
}

const defaultAccept: AssetType[] = [
  'image',
  'pic',
  'lottie',
  'text',
  'videoE',
  'SVG',
  'module',
  'mask',
  'effect',
];

const AssetList = observer((props: PropsWithChildren<AssetListProps>) => {
  const { template, isLast } = props;
  const { currentAsset: activeAsset } = useGetCurrentInfoByObserver();

  const { allAnimationTime: templateEndTime } = template.videoInfo;
  const { comAssets: assets } = formatAssets(template.assets);

  const templateIndex = getTemplateIndexById(template.id);

  const unitWidth = useGetUnitWidth();

  const { allAnimationTime: pageTime } = template.videoInfo;

  const width = useMemo(() => {
    return calcTimeToPx(pageTime, unitWidth);
  }, [unitWidth, pageTime]);

  return (
    <div
      className="template-assets"
      style={{
        width,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        borderRight: '1px dashed rgb(52, 52, 64)',
        // overflow: 'hidden',
      }}
    >
      {/* 轨道 */}
      <Track
        template={template}
        accept={defaultAccept}
        className="addTrack"
        data={{ trackIndex: 0, type: 'asset' }}
      >
        <div className="addLineInner" />
      </Track>

      {assets?.map((track, index) => {
        const { trackId, accept, assets: trackAssets } = track;

        const sortAssets = sortBy(trackAssets, o => o.assetDuration.startTime);

        return (
          <TrackGroup
            key={trackId}
            template={template}
            isLast={index === assets.length - 1}
            itemData={{
              type: 'asset',
              trackIndex: index,
              trackId,
              children: trackAssets,
            }}
            accept={accept}
            className={classNames(styles['asset-track'], {
              [styles['asset-track-large']]: ['pic', 'videoE'].includes(
                accept[0],
              ),
            })}
          >
            <>
              {sortAssets.map((item, assetIndex) => (
                <AssetItemComponent
                  key={`AssetItem-${trackId}-${item.id}`}
                  assets={assets}
                  data={{
                    trackIndex: index,
                    asset: item,
                    templateIndex,
                    preAssetEndTime:
                      sortAssets[assetIndex - 1]?.assetDuration.endTime || 0,
                    nextAssetStartTime:
                      sortAssets[assetIndex + 1]?.assetDuration.startTime ||
                      templateEndTime,
                  }}
                  active={
                    (item.parent && item.parent.id === activeAsset?.id) ||
                    item.id === activeAsset?.id
                  }
                  templateEndTime={templateEndTime}
                />
              ))}
            </>
          </TrackGroup>
        );
      })}

      <BackgroundAsset isLast={isLast} template={template} />
    </div>
  );
});

function Assets() {
  const { templates } = useGetAllTemplateByObserver();

  // const dragDropManager = useDragDropManager();
  // const monitor = dragDropManager.getMonitor();
  // const actions = dragDropManager.getActions();
  // function updateCollected() {
  //   console.log('getTargetIds', monitor.getSourceId());
  //   // console.log('updateCollected', monitor.getSourceId(), monitor.getItem());
  // }
  // useEffect(() => monitor.subscribeToOffsetChange(updateCollected));
  // useEffect(() => monitor.subscribeToStateChange(updateCollected));

  return (
    <div className="designer-template">
      {templates.map((template, index) => (
        <AssetList
          key={`assets-${template.id}`}
          template={template}
          isLast={templates.length === index + 1}
        />
      ))}
    </div>
  );
}

export default observer(Assets);
