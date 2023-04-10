import { useMemo } from 'react';

import {
  setTemplateEndTime,
  useTemplateClip,
  getCurrentTemplateIndex,
  useGetCurrentAsset,
  useSetTemplateBackgroundAsset,
  getAllTemplates,
  assetUpdater,
  getCurrentTemplate,
  addAssetInTemplate,
} from '@hc/editor-core';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import { useRemoveAsset } from '@/hooks/useAssetActions';
import { handleAddAsset, handleReplaceAsset } from '@/utils/assetHandler';
import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';

export function useBackgroundSet() {
  const [value, update] = useTemplateClip(getCurrentTemplateIndex());
  const {
    value: { width: canvasWidth, height: canvasHeight } = {
      width: 1,
      height: 1,
    },
  } = useUpdateCanvasInfo();

  const { activeAudio } = useSetActiveAudio();
  const asset = useGetCurrentAsset();

  const {
    value: backgroundAsset,
    setHorizontalFlip,
    setVerticalFlip,
    setSize,
    setPosition,
    setOpacity,
    setVolume,
  } = useSetTemplateBackgroundAsset();

  const { handleRemoveAsset } = useRemoveAsset();

  // 是否背景
  const isBackground = asset?.meta.isBackground && !activeAudio;

  const { meta, attribute, transform } = backgroundAsset || {};
  const { width = 1, height = 1 } = attribute || {};

  // 背景视频替换
  function onVideoReplace(
    clip: { cst: number; cet: number },
    data: {
      type: 'video' | 'videoE';
      width: number;
      height: number;
      resId: string;
      rt_url: string;
    },
    callback: () => void,
  ) {
    if (!data) return;

    const clipDuration = clip.cet - clip.cst;
    const params = {
      meta: { type: 'videoE', isBackground: true },
      attribute: { ...data, startTime: 0, endTime: clipDuration, ...clip },
    };

    setTemplateEndTime(clipDuration);
    if (backgroundAsset) {
      handleReplaceAsset({ params, asset: backgroundAsset });
    } else {
      handleAddAsset(params);
    }

    setTimeout(() => {
      update([0, 0]);
    });

    callback();
  }

  // 图片背景替换
  const onImgReplace = (data: any, callback: () => void) => {
    const params = {
      meta: { type: 'image', isBackground: true },
      attribute: data,
    };

    if (backgroundAsset) {
      handleReplaceAsset({ params, asset: backgroundAsset });
    } else {
      Object.assign(params.attribute, {
        startTime: 0,
        endTime: getCurrentTemplate().videoInfo.pageTime,
      });
      handleAddAsset(params);
    }
    callback();
  };

  // 背景删除
  const backgroundDel = () => {
    handleRemoveAsset(backgroundAsset);
  };

  // 背景透明度设置
  const backgroundTransparent = (num: number) => {
    setOpacity(num);
  };

  // 背景锁定
  const backgroundLock = () => { };

  // 背景水平翻转
  const updateBackHorizontalFlip = (horizontalFlip: boolean) => {
    setHorizontalFlip(horizontalFlip);
  };

  // 背景垂直翻转
  const updateBackVerticalFlip = (verticalFlip: boolean) => {
    setVerticalFlip(verticalFlip);
  };

  const updatePosition = (positioin: { left: number; top: number }) => {
    setPosition({ posY: positioin.top, posX: positioin.left });
  };

  // 背景大小
  const getSize = (num: number) => {
    let newWidth = 0;
    let newHeight = 0;

    const scale = width / height;
    if (canvasWidth > canvasHeight) {
      newWidth = canvasWidth * num;
      newHeight = newWidth / scale;
    } else {
      newHeight = canvasHeight * num;
      newWidth = newHeight * scale;
    }

    setSize({ width: newWidth, height: newHeight });
  };

  /**
   * 背景适中
   * */
  const backgroundModerate = () => {
    if (backgroundAsset) {
      let { width, height } = backgroundAsset.attribute;

      const scale = width / height;
      width = canvasWidth;
      height = width / scale;

      if (height > canvasHeight) {
        height = canvasHeight;
        width = height * scale;
      }

      setSize({ width, height });
    }
  };

  // 背景填充
  const backgroundFill = () => {
    if (backgroundAsset) {
      let { width, height } = backgroundAsset.attribute;

      const scale = width / height;
      width = canvasWidth;
      height = width / scale;

      if (height < canvasHeight) {
        height = canvasHeight;
        width = height * scale;
      }
      setSize({ width, height });
    }
  };

  // 应用所有场景
  const applyAll = (callback: () => void) => {
    getAllTemplates().forEach(item => {
      const { assets } = item;

      // 锁定的元素跳过
      const background = assets.find(item => item.meta.isBackground);
      if (background) {
        if (!background.meta.locked) {
          const { startTime, endTime, ...others } = attribute || {};
          assetUpdater(background, {
            meta: { type: meta?.type },
            attribute: { ...others, isLoop: true },
            transform,
          });
        }
      } else {
        // todo 待确认没有背景是否添加背景
      }
    });
    callback();
  };

  // 确认
  const bindOk = (callback: () => void) => { };

  const backSize = useMemo(() => {
    let scale = 1;
    if (backgroundAsset) {
      const { width, height } = backgroundAsset.attribute;

      if (canvasWidth > canvasHeight) {
        scale = width / canvasWidth;
      } else {
        scale = height / canvasHeight;
      }
    }
    return Math.round(Number(scale.toFixed(2)) * 100);
  }, [backgroundAsset?.attribute.width, canvasWidth]);

  return {
    onVideoReplace,
    onImgReplace,
    backgroundDel,
    backgroundTransparent,
    backgroundLock,
    updateBackHorizontalFlip,
    updateBackVerticalFlip,
    updateSize: getSize,
    backgroundModerate,
    backgroundFill,
    applyAll,
    bindOk,
    backOpacity: backgroundAsset?.transform.alpha ?? 100, // 背景透明度
    backHorizontalFlip: backgroundAsset?.transform.horizontalFlip, // 是否水平翻转
    backVerticalFlip: backgroundAsset?.transform.verticalFlip, // 是否垂直翻转
    isBackground, // 是否选中背景
    backSize, // 背景大小
    backgroundAsset,
    updatePosition,
    position: { left: transform?.posX ?? 0, top: transform?.posY ?? 0 },
    setVolume,
  };
}
