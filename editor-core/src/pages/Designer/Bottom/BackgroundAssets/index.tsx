import { PropsWithChildren, MouseEvent, forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import { Tooltip } from 'antd';

import {
  AssetClass,
  useGetCurrentAsset,
  setTemplateEndTime,
  observer,
  activeEditableAsset,
  TemplateClass,
  getTemplateIndexById,
  addAssetClassInTemplate,
  removeAsset,
  createAssetClass,
} from '@hc/editor-core';

import {
  mouseMoveDistance,
  RGBAToString,
  stopPropagation,
  transferGradientToString,
} from '@/utils/single';
import XiuIcon from '@/components/XiuIcon';

import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import { TEMPLATE_MIN_DURATION } from '@/config/basicVariable';
import { autoCorrectionTime } from '@/utils/templateHandler';
import { setAssetEditStatus } from '@/utils/assetHandler';
import { calcTimeToPx, calcPxToTime } from '../handler';

import { reconcileAssets } from '../Assets/Item/handler';
import Contextmenu from './Contextmenu';
import Transition from '../Transition';

import ItemDrag from '../Assets/Drag';

import VideoE from '../Assets/Item/VideoE';
import Image from '../Assets/Item/Image';

import { DropResult } from '../Assets';
import './index.less';

function getAssetDom(type: string) {
  switch (type) {
    case 'video':
    case 'videoE':
      return VideoE;
    case 'pic':
    case 'image':
      return Image;
    default:
      return <></>;
  }
}

interface BackgroundAssetsProps {
  asset: AssetClass;
}

function Background({ asset }: PropsWithChildren<BackgroundAssetsProps>) {
  const currentAsset = useGetCurrentAsset();

  const AssetDom = getAssetDom(asset.meta.type);
  const { startTime, endTime } = asset.assetDuration || {};

  /**
   * @description 背景拖拽
   * 1. 背景拖拽到 普通元素轨道
   * 2. 拖拽到背景轨道
   */
  function onDrop(drop: DropResult) {
    const {
      track: { type },
      template,
    } = drop;

    const { allAnimationTime: pageTime } = template.videoInfo;

    const newAsset = createAssetClass(asset.getAssetCloned());

    let duration = { startTime, endTime };

    // 背景
    if (type === 'background') {
      if (['video', 'videoE'].includes(asset.meta.type)) {
        duration = { startTime: 0, endTime: endTime - startTime };
      } else {
        duration = { startTime: 0, endTime: pageTime };
      }
    }

    const newPageTime = duration.endTime - duration.startTime;

    newAsset.updateAssetDuration(duration);
    newAsset.update({ meta: { isBackground: type === 'background' } });

    // 删除原来的背景元素
    if (type === 'background') {
      if (template.backgroundAsset) {
        removeAsset(template.backgroundAsset);
      }
    }
    removeAsset(asset);
    addAssetClassInTemplate(newAsset, template);

    if (type === 'background') {
      setTemplateEndTime(newPageTime);

      if (newPageTime < template.videoInfo.allAnimationTime) {
        reconcileAssets(template);
      }
    }
  }

  return (
    <ItemDrag
      canDrag={!asset.meta.locked}
      // onClick={e => {
      //   if (!asset.meta.locked) {
      //     // 父级有asstBlur
      //     setTimeout(() => {
      //       activeEditableAsset(asset);
      //     });
      //   }
      // }}
      data={{
        trackIndex: 0,
        asset,
        preAssetEndTime: 0,
        nextAssetStartTime: 0,
        templateIndex: 0,
        finish: onDrop,
      }}
    >
      <AssetDom
        data={asset}
        style={{ height: 30 }}
        active={asset.id === currentAsset?.id && !asset.meta.locked}
      />
    </ItemDrag>
  );
}

const Wrap = (
  props: PropsWithChildren<{
    isLast?: boolean;
    template: TemplateClass;
  }>,
) => {
  const { template, isLast } = props;
  const { allAnimationTime: pageTime } = template.videoInfo;

  const asset = template.backgroundAsset;
  const { backgroundColor } = template.background;
  const templateIndex = getTemplateIndexById(template.id);

  const currentAsset = useGetCurrentAsset();

  const unitWidth = useGetUnitWidth();
  const width = calcTimeToPx(pageTime, unitWidth);

  const [{ hover }, drop] = useDrop({
    accept: ['image', 'pic', 'videoE'],
    collect(monitor) {
      return { hover: !!monitor.isOver() && !!monitor.canDrop() };
    },
    drop(item: any) {
      item?.finish({ template, track: { type: 'background' } });
    },
  });

  const isVideo = asset ? ['video', 'videoE'].includes(asset.meta.type) : false;

  const getClipRange = () => {
    if (!asset || !isVideo) {
      return {
        start: { max: pageTime - TEMPLATE_MIN_DURATION, min: -999999 },
        end: { max: 9999999, min: -(pageTime - TEMPLATE_MIN_DURATION) },
      };
    }

    const { cst, cet } = asset.videoClip;
    const { rt_total_time } = asset.attribute;

    return {
      start: { min: -cst, max: cet - cst - TEMPLATE_MIN_DURATION },
      end: {
        min: -(cet - cst - TEMPLATE_MIN_DURATION),
        max: rt_total_time - cet,
      },
    };
  };

  function onClip(e: MouseEvent<HTMLDivElement>, target: 'start' | 'end') {
    const { cst, cet } = asset?.videoClip || {};
    const { max, min } = getClipRange()[target];
    stopPropagation(e);
    e.preventDefault();

    mouseMoveDistance(
      e,
      distanceX => {
        let changeTime = calcPxToTime(distanceX, unitWidth);

        let videoClip = {};

        if (changeTime < min) {
          changeTime = min;
        } else if (changeTime > max) {
          changeTime = max;
        }

        if (isVideo) {
          if (target === 'start') {
            videoClip = { cst: cst + changeTime, cet };
          } else {
            videoClip = { cst, cet: cet + changeTime };
          }
        }

        let newPageTime = 0;
        if (target === 'start') {
          newPageTime = pageTime - changeTime;
        } else {
          newPageTime = pageTime + changeTime;
        }

        setTemplateEndTime(newPageTime, templateIndex);

        asset?.update({
          attribute: { startTime: 0, endTime: newPageTime, ...videoClip },
        });
      },
      () => {
        reconcileAssets(template);
        autoCorrectionTime();
      },
    );
  }

  // 选中当前背景
  function selectedCurrent() {
    if (asset && !asset.meta.locked) {
      // 父级有asstBlur
      setTimeout(() => {
        activeEditableAsset(asset);
      });
    }
  }

  // useWhyDidYouUpdate('useWhyDidYouUpdate', { ...props });

  return (
    <Contextmenu isLast={isLast} template={template}>
      <div
        ref={drop}
        className="background-asset"
        style={{ width, opacity: hover ? 0.3 : 1 }}
        // onMouseDown={stopPropagation}
        onContextMenu={e => {
          // e.preventDefault();
          selectedCurrent();
        }}
        onClick={selectedCurrent}
      >
        <div className="part-index">
          {templateIndex < 9 ? 0 : ''}
          {templateIndex + 1}
        </div>

        <div
          className={classNames('background-asset-clip', {
            'background-asset-active': asset && currentAsset?.id === asset?.id,
          })}
          style={{
            background: backgroundColor.type
              ? transferGradientToString(backgroundColor)
              : RGBAToString(backgroundColor),
            overflow: 'hidden',
          }}
        >
          {asset && <Background asset={asset} />}

          {asset && asset.meta.locked && (
            <Tooltip title="解锁">
              <div
                className="clip-asset-locked"
                onMouseDown={e => {
                  stopPropagation(e);
                  setAssetEditStatus(asset);
                }}
              >
                <XiuIcon type="iconsuozi" />
              </div>
            </Tooltip>
          )}

          <div
            className="clip-handler clip-handler-left"
            onMouseDown={e => onClip(e, 'start')}
          >
            <XiuIcon type="iconzanting" />
          </div>
          <div
            className="clip-handler clip-handler-right"
            onMouseDown={e => onClip(e, 'end')}
          >
            <XiuIcon type="iconzanting" />
          </div>
        </div>

        {!isLast && (
          <Transition
            template={template}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 0,
            }}
          />
        )}
      </div>
    </Contextmenu>
  );
};

export const BackgroundAsset = observer(Wrap);
