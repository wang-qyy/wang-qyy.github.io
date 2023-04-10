import { PropsWithChildren, useRef } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';

import { AssetClass, TemplateClass, AssetType } from '@hc/editor-core';

import { AssetTrack } from '@/pages/Designer/Bottom/hooks';

import './index.less';

export interface TrackData {
  trackId?: string;
  trackIndex: number;
  type: 'asset' | 'background';
  children?: AssetClass[];
}
interface TrackProps {
  className?: string;
  data: TrackData;
  accept: AssetType[];
  template: TemplateClass;
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
];

export function Track(props: PropsWithChildren<TrackProps>) {
  const { children, className, data, accept, template } = props;

  const trackRef = useRef<HTMLDivElement>(null);

  const [{ isOverCurrent }, drop] = useDrop({
    accept,
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        item: monitor.getItem(),
      };
    },
    drop: (dragItem: any, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        const delta = monitor.getDifferenceFromInitialOffset();

        if (dragItem.finish) {
          dragItem.finish({
            offsetX: delta?.x,
            track: data,
            template,
          });
        }
      }
    },
  });

  drop(trackRef);

  return (
    <>
      <div
        className={classNames('assetTrack', className, {
          'asset-track-isOverCurrent': isOverCurrent,
        })}
        ref={trackRef}
      >
        {children}
      </div>
    </>
  );
}

interface TrackGroupProps {
  isLast: boolean;
  className?: string;
  template: TemplateClass;
  itemData: TrackData;
  accept: AssetType[];
}

export function TrackGroup(props: PropsWithChildren<TrackGroupProps>) {
  const { isLast, template, accept, itemData, ...others } = props;

  const { trackIndex } = itemData;

  return (
    <>
      <Track template={template} accept={accept} data={itemData} {...others} />
      <Track
        template={template}
        accept={defaultAccept}
        className="addTrack"
        data={{ trackIndex: trackIndex + 1, type: 'asset' }}
      >
        <div className="addLineInner" />
      </Track>
    </>
  );
}
