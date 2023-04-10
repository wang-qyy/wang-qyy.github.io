import {
  AssetClass,
  TemplateClass,
  activeEditableAsset,
  addAssetClassInTemplate,
  updateAssetZIndex,
  setTemplateEndTime,
  getTemplateIndexById,
  removeAssetInTemplate,
  createAssetClass,
  getAbsoluteCurrentTime,
  getTemplateTimeScale,
} from '@hc/editor-core';
import { reportChange } from '@/kernel/utils/config';
import { useGetUnitWidth, getUnitWidth } from '@/pages/Content/Bottom/handler';
import {
  getAlignAsset,
  getTimeScale,
  clearAlignAsset,
} from '@/store/adapter/useDesigner';

import AssetItemState from '@/kernel/store/assetHandler/asset';
import { AssetTrack, createTrackId } from '@/pages/Designer/Bottom/hooks';
import { calcPxToTime } from '@/pages/Designer/Bottom/handler';
import { TrackData } from '../Track';

export interface DropResult {
  offsetX: number;
  track: TrackData;
  template: TemplateClass;
}

interface useAssetDragOpt {
  asset: AssetClass;
  trackIndex: number;
  assets: AssetTrack[];
}

/**
 * @description 元素重排（不包括背景元素）
 * @description 删除多余素材
 */
export function reconcileAssets(template: TemplateClass) {
  const { allAnimationTime: pageTime } = template.videoInfo;

  [...template.assets].forEach(asset => {
    const { startTime, endTime } = asset.assetDuration;

    let duration = { startTime, endTime };

    if (!asset.meta.isBackground) {
      if (endTime > pageTime) {
        duration = { startTime, endTime: pageTime };
        if (duration.endTime - startTime < 300) {
          asset.template?.autoRemoveAsset(asset.id);
        } else {
          asset.setAssetDuration([0, pageTime - endTime]);
        }
        // asset.setAssetDuration([0, pageTime - endTime]);
      }
    }
  });
}

/**
 * @description 判断是否需要辅助线
 */
function needAuxiliary(targetTime: number, dragTime: number) {
  const unitWidth = getUnitWidth(getTimeScale());

  return Math.abs(dragTime - targetTime) < calcPxToTime(10, unitWidth);
}

/**
 * @description
 */
export function calcAssetAlign(
  point: { startTime: number; endTime: number },
  asset: AssetClass,
) {
  const assets = asset.template?.assets;

  if (!assets) return {};

  const { startTime: dragAssetStartTime, endTime: dragAssetEndTime } = point;

  const currentTime = getAbsoluteCurrentTime();

  let start;
  let end;
  let absolute = 0;

  if (asset.template) {
    const index = getTemplateIndexById(asset.template.id);
    absolute = getTemplateTimeScale()[index][0];
  }

  if (needAuxiliary(currentTime, dragAssetStartTime)) {
    start = currentTime;
  } else if (needAuxiliary(dragAssetEndTime, currentTime)) {
    end = currentTime;
  } else if (dragAssetStartTime < 0) {
    start = 0;
  } else {
    assets.forEach(item => {
      const { startTime, endTime } = item.assetDuration;

      if (asset.id !== item.id) {
        if (needAuxiliary(startTime, dragAssetStartTime)) {
          start = startTime;
        }
        if (needAuxiliary(endTime, dragAssetStartTime)) {
          start = endTime;
        }

        if (needAuxiliary(dragAssetEndTime, startTime)) {
          end = startTime;
        }
        if (needAuxiliary(dragAssetEndTime, endTime)) {
          end = endTime;
        }
      }
    });
  }

  return { start, end, absolute };
}

/**
 * @description 元素拖拽
 */
export function useAssetDrag(opt: useAssetDragOpt) {
  const { asset, trackIndex, assets } = opt;

  let { startTime, endTime } = asset.assetDuration;
  const assetDuration = endTime - startTime;
  const unitWidth = useGetUnitWidth();

  // 跨片段拖拽
  function dropDifferentTemplate(drop: { template: TemplateClass }) {
    const { template } = drop;

    const newAsset = createAssetClass(asset.getAssetCloned());
    const duration = {
      startTime: 0,
      endTime: Math.min(0 + assetDuration, template.videoInfo.allAnimationTime),
    };

    newAsset.updateAssetDuration(duration);
    const active = template.addAsset(newAsset);

    asset.template?.removeAsset(asset.id);

    if (active) {
      activeEditableAsset(active);
    }

    reportChange('dropDifferentTemplate', true);
  }

  /**
   * @description 元素拖拽到背景轨道
   * 视频元素拖拽到背景轨道 以视频时长为准
   * 图片元素拖拽到轨道 保持片段时长
   * */
  function assetToBackground(drop: { template: TemplateClass }) {
    const { template } = drop;
    const { allAnimationTime: pageTime } = template.videoInfo;

    const duration = { startTime: 0, endTime: pageTime };

    if (['video', 'videoE'].includes(asset.meta.type)) {
      duration.endTime = Math.min(assetDuration, pageTime);
    }
    const newAsset = new AssetItemState(asset.getAssetCloned());

    newAsset.updateAssetDuration(duration);
    newAsset.update({
      meta: { isBackground: true },
      transform: { zindex: template.zIndex.max },
    });

    // removeAsset(asset);
    removeAssetInTemplate(asset.template, asset);
    // 删除原来的背景元素
    if (template.backgroundAsset) {
      // removeAsset(template.backgroundAsset);

      removeAssetInTemplate(template, template.backgroundAsset);
    }
    addAssetClassInTemplate(newAsset, template);

    updateAssetZIndex({
      asset: newAsset,
      direction: 'bottom',
    });

    const newPageTime = duration.endTime - duration.startTime;

    setTemplateEndTime(newPageTime, getTemplateIndexById(template.id));

    if (newPageTime < pageTime) {
      // 重新计算元素
      reconcileAssets(template);
    }
  }

  function assetDrop(drop: DropResult) {
    const assetAlign = getAlignAsset();

    const [baseStartTime, baseEndTime] = assetAlign;

    // const baseStartTime = assetAlign[0];
    // const baseEndTime = assetAlign[1];

    const {
      track: { trackIndex: targetTrackIndex, trackId, children },
      offsetX,
    } = drop;

    const min = -startTime;
    const max = (asset.template?.videoInfo.allAnimationTime ?? 0) - endTime;

    let changeTime = calcPxToTime(offsetX, unitWidth);
    let absolute = 0;

    if (asset.template) {
      const index = getTemplateIndexById(asset.template.id);
      absolute = getTemplateTimeScale()[index][0];
    }

    if (baseStartTime) {
      changeTime = baseStartTime - absolute - startTime;
    } else if (baseEndTime) {
      changeTime = baseEndTime - absolute - endTime;
    }

    if (changeTime < min) {
      changeTime = min;
    } else if (changeTime > max) {
      changeTime = max;
    }

    startTime += changeTime;
    endTime += changeTime;

    function addTrack() {
      assets[trackIndex].assets = assets[trackIndex].assets.filter(
        item => item.meta.id !== asset.meta.id,
      );
      const newTrackId = createTrackId();

      asset.meta.trackId = newTrackId;
      assets.splice(targetTrackIndex, 0, {
        trackId: newTrackId,
        accept: [asset.meta.type],
        assets: [asset],
      });
    }

    if (trackId && children) {
      let sign = false;
      for (let index = 0; index < children.length; index++) {
        const compare = children[index];

        const { startTime: start, endTime: end } = compare.assetDuration;

        if (
          asset.meta.id !== compare.meta.id &&
          ((startTime < start && endTime > start) ||
            (startTime >= start && endTime <= end) ||
            (startTime < end && endTime > end))
        ) {
          addTrack();
          sign = true;
          break;
        }
      }

      if (!sign) {
        asset.meta.trackId = trackId;
        assets[trackIndex].assets = assets[trackIndex].assets.filter(
          item => item.meta.id !== asset.meta.id,
        );
        assets[targetTrackIndex].assets.push(asset);
      }
    } else {
      addTrack();
    }

    const newAsset: AssetClass[] = [];

    let zIndex = asset.template?.minZIndex ?? 0;

    // 重新梳理元素层级
    for (let index = assets.length - 1; index > -1; index -= 1) {
      const track = assets[index];

      // eslint-disable-next-line no-loop-func
      track.assets.forEach(item => {
        zIndex += 1;
        item.transform.zindex = zIndex;

        if (item.meta.id === asset.meta.id) {
          item.updateAssetDuration?.({ startTime, endTime });
          item.meta.trackId = asset.meta.trackId;
        }

        newAsset.push(item);
      });
    }

    if (asset.template?.backgroundAsset) {
      newAsset.push(asset.template?.backgroundAsset);
    }

    asset.template?.replaceAssetClasses(newAsset);

    reportChange('dropUpdateAsset', true);
  }

  function onDrop(drop: DropResult) {
    const {
      template,
      track: { type },
    } = drop;

    if (type === 'background') {
      assetToBackground({ template });
    } else if (template.id !== asset.template?.id) {
      dropDifferentTemplate({ template });
    } else {
      assetDrop(drop);
    }

    // 清空对齐线
    clearAlignAsset();
  }

  return {
    data: {},
    onDrop,
  };
}
