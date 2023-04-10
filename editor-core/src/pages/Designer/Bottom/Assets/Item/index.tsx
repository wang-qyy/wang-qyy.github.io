import {
  useMemo,
  PropsWithChildren,
  MouseEvent,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import { useSetState } from 'ahooks';
import { message } from 'antd';
import classNames from 'classnames';

import XiuIcon from '@/components/XiuIcon';

import {
  AssetClass,
  AssetType,
  useCurrentTemplate,
  setTemplateEndTime,
  getAllAsset,
  observer,
  setAssetDuration,
  isVideoAsset,
} from '@hc/editor-core';

import { formatNumberToTime, stopPropagation } from '@/utils/single';
import getUrlProps from '@/utils/urlProps';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';
import { updateAlignAsset, clearAlignAsset } from '@/store/adapter/useDesigner';
import { useMouseHandle } from '@/components/TimeLine/hooks';

import { calcAssetAlign } from '@/pages/Designer/Bottom/Assets/Item/handler';
import { calcTimeToPx, calcPxToTime } from '@/pages/Designer/Bottom/handler';

import { useAssetDragStatus } from '@/store/adapter/useAssetDrag';
import Contextmenu from '../Contextmenu';
import Drag from './Drag';

import { useAssetDrag } from './handler';

import ItemDrag from '../Drag';

import { DropResult } from '../index';

import Text from './Text';
import VideoE from './VideoE';
import Image from './Image';
import Lottie from './Lottie';
import Effect from './Effect';
import Group from './Group';
import Mask from './Mask';

import Clip, { OnClipParams } from '../../component/Clip';

import { useAssetActions } from './hooks';

import styles from './index.modules.less';
import './index.less';

export interface ItemData {
  trackIndex: number;
  asset: AssetClass;
  preAssetEndTime: number;
  nextAssetStartTime: number;
  templateIndex: number;
  finish: (result: DropResult) => void;
  source?: 'asset';
}

interface ItemProps {
  data: ItemData;
  templateEndTime: number;
  active?: boolean;
  onDrop?: () => void;
  onDragHover?: () => void;
  assets: [];
}

const isModule = getUrlProps()?.redirect === 'module';

const EmptyDom = () => {
  return <div />;
};

export function useAssetItem(type: AssetType) {
  return useMemo(() => {
    switch (type) {
      case 'video':
      case 'videoE':
        return VideoE;
      case 'SVG':
      case 'image':
      case 'pic':
      case 'background':
        return Image;
      case 'mask':
        return Mask;
      case 'text':
        return Text;
      case 'module':
        return Group;
      case 'lottie':
        return Lottie;
      case 'effect':
        return Effect;
      default:
        return EmptyDom;
    }
  }, [type]);
}

function Item({ assets, data, active }: PropsWithChildren<ItemProps>) {
  const { preAssetEndTime, nextAssetStartTime } = data;
  const { meta: assetMeta, minAssetDuration: assetMinDuration } = data.asset;

  const unitWidth = useGetUnitWidth();
  const actions = useAssetActions({ asset: data.asset });

  const itemRef = useRef<HTMLDivElement>(null);
  const [assetItemStyle, setAssetItemStyle] = useSetState<{
    top?: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  const AssetDom = useAssetItem(assetMeta.type);

  const { onDrop } = useAssetDrag({
    asset: data.asset,
    trackIndex: data.trackIndex,
    assets,
  });

  const { template } = useCurrentTemplate();

  const { cst, cet, totalTime } = data.asset.videoClip;

  const clipRange = useMemo(() => {
    const { startTime, endTime } = data.asset.assetDuration;

    const tempDuration = Math.min(
      template?.videoInfo.endTime,
      data.nextAssetStartTime,
    );

    const start = {
      min: -Math.min(startTime, startTime - preAssetEndTime),
      max: endTime - assetMinDuration - startTime,
    };
    const end = {
      min: -(endTime - assetMinDuration - startTime),
      max: Math.min(tempDuration - endTime, nextAssetStartTime - endTime),
    };

    if (totalTime) {
      start.min = Math.max(start.min, -cst);
      start.max = Math.min(start.max, cet - assetMinDuration - cst);
      end.min = Math.max(end.min, -(cet - assetMinDuration - cst));
      end.max = Math.min(end.max, totalTime - cet);
    }

    return { start, end };
  }, [
    cst,
    cet,
    data.asset.assetDuration.startTime,
    data.asset.assetDuration.endTime,
    template?.videoInfo.endTime,
    assetMinDuration,
  ]);

  // 裁剪结束更新 数据
  const onClipFinish = ({ target, extra }: any) => {
    if (extra) {
      const { endTime } = data.asset.assetDuration;

      const [start, end] = extra;

      //  组件生产
      if (isModule) {
        // eslint-disable-next-line prefer-spread
        const max = Math.max.apply(
          Math,
          getAllAsset().map(item =>
            item.meta.id === assetMeta.id
              ? endTime + end
              : item.assetDuration.endTime,
          ),
        );

        if (max) {
          setTemplateEndTime(max);
        }
      }

      setAssetDuration(data.asset, [start, end]);

      if (cst - start <= 0 && target === 'start' && isVideoAsset(data.asset)) {
        message.info('视频已经到头了');
      }
    }
    clearAlignAsset();
  };

  // 调整开始时间
  function clipStart(changeTime: number) {
    let { left = 0, width = 0 } = assetItemStyle;
    const { startTime, endTime } = data.asset.assetDuration;

    const { start, end, absolute } = calcAssetAlign(
      { startTime: startTime + changeTime, endTime },
      data.asset,
    );
    if (start) {
      changeTime = start - startTime;
    }

    if (!isModule) {
      const { min, max } = clipRange.start;

      if (changeTime > max) {
        changeTime = max;
      }
      if (changeTime < min) {
        changeTime = min;
      }
    }
    const changeDistance = calcTimeToPx(changeTime, unitWidth);

    width -= changeDistance;
    left += changeDistance;
    setAssetItemStyle({ left, width });

    updateAlignAsset([start ? start + absolute : undefined, undefined]);

    return [changeTime, 0];
  }

  // 调整结束时间
  function clipEnd(changeTime: number) {
    let { width = 0 } = assetItemStyle;
    const { endTime, startTime } = data.asset.assetDuration;

    const { start, end, absolute } = calcAssetAlign(
      { startTime, endTime: endTime + changeTime },
      data.asset,
    );

    if (end) {
      changeTime = end - endTime;
    }

    if (!isModule) {
      const { min, max } = clipRange.end;

      if (changeTime > max) {
        changeTime = max;
      }
      if (changeTime < min) {
        changeTime = min;
      }
    }

    const changeDistance = calcTimeToPx(changeTime, unitWidth);

    width += changeDistance;
    setAssetItemStyle({ width });

    updateAlignAsset([undefined, end ? end + absolute : undefined]);

    return [0, changeTime];
  }

  const handleClip = ({ distance, target }: OnClipParams) => {
    const changeTime = calcPxToTime(distance, unitWidth);

    if (target === 'start') {
      return clipStart(changeTime);
    }
    return clipEnd(changeTime);
  };

  useEffect(() => {
    let left = 0;
    let width = 0;

    const { startTime, endTime } = data.asset.assetDuration;
    const assetDuration = endTime - startTime;

    left = calcTimeToPx(startTime, unitWidth);
    width = calcTimeToPx(assetDuration, unitWidth);

    setAssetItemStyle({ left, width });
  }, [unitWidth, data.asset.assetDuration]);

  // useLayoutEffect(() => {
  //   if (active) {
  //     itemRef.current?.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'center',
  //       inline: 'start',
  //     });
  //   }
  // }, [active]);

  const assetDuration =
    data.asset.assetDuration.endTime - data.asset.assetDuration.startTime;

  // return (
  //   <Drag
  //     onDrop={() => {}}
  //     data={data.asset}
  //     style={{
  //       position: 'absolute',
  //       // height: '100%',
  //       left: assetItemStyle.left,
  //       width: assetItemStyle.width,
  //       top: 0,
  //       cursor: 'pointer',
  //     }}
  //     className=""
  //   >
  //     <Contextmenu>
  //       <Clip
  //         active={active}
  //         isLocked={assetMeta.locked}
  //         onClip={handleClip}
  //         onClipFinish={onClipFinish}
  //         style={{
  //           height: ['videoE', 'pic'].includes(data.asset.meta.type) ? 34 : 20,
  //           overflow: 'hidden',
  //         }}
  //         duation={
  //           ['video', 'videoE', 'pic'].includes(assetMeta.type)
  //             ? assetDuration
  //             : 0
  //         }
  //         asset={data.asset}
  //       >
  //         {active && !['video', 'videoE', 'pic'].includes(assetMeta.type) && (
  //           <div className={styles.duration}>
  //             {formatNumberToTime(parseInt(`${assetDuration / 1000}`, 10))}
  //           </div>
  //         )}
  //         <AssetDom
  //           active={active}
  //           data={data.asset}
  //           style={{ height: '100%' }}
  //         />
  //       </Clip>
  //     </Contextmenu>
  //   </Drag>
  // );

  return (
    <ItemDrag
      canDrag={!data.asset.meta.locked}
      ref={itemRef}
      data={{ ...data, source: 'asset', finish: onDrop }}
      style={{
        position: 'absolute',
        height: '100%',
        left: assetItemStyle.left,
        width: assetItemStyle.width,
        top: 1,
        cursor: 'pointer',
      }}
      {...actions}
    >
      <Contextmenu>
        <Clip
          active={active}
          isLocked={assetMeta.locked}
          onClip={handleClip}
          onClipFinish={onClipFinish}
          style={{
            height: ['videoE', 'pic'].includes(data.asset.meta.type) ? 34 : 20,
            overflow: 'hidden',
            position: 'relative',
          }}
          asset={data.asset}
        >
          {active && (
            <div className={styles.duration}>
              {formatNumberToTime(parseInt(`${assetDuration / 1000}`, 10))}
            </div>
          )}
          <AssetDom
            active={active}
            data={data.asset}
            style={{
              height: '100%',
              background: !['video', 'videoE', 'pic', 'image'].includes(
                data.asset.meta.type,
              )
                ? 'linear-gradient(134deg, #BF7CFF 0%, #6B87FF 100%)'
                : '#293A8F',
            }}
          />

          {data.asset.meta.hidden && <div className="asset-hide-mask" />}
          <div
            className={classNames('asset-aeA-wrap', {
              'asset-aeA-wrap-fixed': ![
                'video',
                'videoE',
                'pic',
                'image',
              ].includes(data.asset.meta.type),
            })}
          >
            <div
              hidden={!data.asset.animationItemDuration.i}
              className="asset-aeA asset-aeA-in"
              style={{
                width: calcTimeToPx(
                  data.asset.animationItemDuration.i,
                  unitWidth,
                ),
              }}
            >
              <div className="asset-aeA-line" />
              <XiuIcon type="iconbofang" className="asset-aeA-icon" />
            </div>

            <div
              hidden={!data.asset.animationItemDuration.o}
              className="asset-aeA asset-aeA-out"
              style={{
                width: calcTimeToPx(
                  data.asset.animationItemDuration.o,
                  unitWidth,
                ),
              }}
            >
              <XiuIcon type="iconbofang" className="asset-aeA-icon" />
              <div className="asset-aeA-line" />
            </div>
            <div
              hidden={!data.asset.animationItemDuration.s}
              className="asset-aeA asset-aeA-stay"
              style={{
                width: '100%',
              }}
            >
              <XiuIcon type="iconbofang" className="asset-aeA-icon" />
              <div className="asset-aeA-line" />
              <XiuIcon type="iconbofang" className="asset-aeA-icon" />
            </div>
          </div>
        </Clip>
      </Contextmenu>
    </ItemDrag>
  );
}

export default observer(Item);
