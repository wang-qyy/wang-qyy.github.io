import { useEventListener, useKeyPress } from 'ahooks';
import {
  observer,
  useGetCurrentAsset,
  assetBlur,
  useHistoryRecordByObserver,
  ungroupModule,
  groupModule,
  useGetCurrentInfoByObserver,
  isModuleType,
  isTempModuleType,
  getCurrentTemplate,
  getVideoCurrentTime,
  setCurrentTime,
  getAllTemplateVideoTime,
} from '@hc/editor-core';

import {
  getActiveAudio,
  setActiveAudioInCliping,
  updateActiveAudio,
} from '@/store/adapter/useAudioStatus';

import { manualSave } from '@/utils/userSave';

import { copyAndPaste, pasteAsset, pasteAudio } from '@/utils/single';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { useRemoveAsset } from '@/hooks/useAssetActions';

import { useSetMusic } from '@/hooks/useSetMusic';
import { useReference } from '@/hooks/useReferenceLine';

import useClipboardPaste from '@/hooks/useClipboardPaste';
import { deleteTemplate } from '@/utils/templateHandler';
import { buildCopyData } from '@/utils/assetHandler';

import { useDesignerReferenceLine } from '@/store/adapter/useGlobalStatus';

export default observer(() => {
  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();
  const asset = useGetCurrentAsset();
  const { handleRemoveAsset } = useRemoveAsset();
  const { bindRemoveAudio } = useSetMusic();

  const { value, goNext, goPrev } = useHistoryRecordByObserver();
  const { multiSelect } = useGetCurrentInfoByObserver();
  const { clipboardPaste, analyPaste } = useClipboardPaste();

  const { _show, show } = useDesignerReferenceLine();

  // 播放
  useKeyPress(['space'], event => {
    event.preventDefault();
    if (document.getElementsByClassName('preview-video')?.length <= 0) {
      assetBlur();
      if (isPlaying) {
        pauseVideo();
      } else {
        playVideo();
      }
    }
  });

  // 删除 [元素、音频]
  useKeyPress(['backspace', 'delete'], event => {
    event.preventDefault();

    const activeAudio = getActiveAudio();

    if (activeAudio) {
      bindRemoveAudio(activeAudio.rt_id);
      updateActiveAudio();
      setActiveAudioInCliping(-1);
    } else if (document.getElementsByClassName('preview-video')?.length <= 0) {
      if (asset) {
        if (!asset.meta.locked) {
          handleRemoveAsset(asset);
        }
      } else {
        const currentTemplate = getCurrentTemplate();

        // 当前片段为空片段
        if (currentTemplate.validAssets.length < 1) {
          deleteTemplate(currentTemplate);
        }
      }
    }
  });

  // 保存
  useKeyPress(['ctrl.s', 'meta.s'], event => {
    event.preventDefault();
    manualSave();
  });

  useKeyPress(['ctrl.d', 'meta.d'], event => {
    event.preventDefault();
    const activeAudio = getActiveAudio();
    if (activeAudio) {
      pasteAudio(activeAudio);
    }
  });

  // 撤销
  useKeyPress(['ctrl.z', 'meta.z'], event => {
    event.preventDefault();
    goPrev();
  });

  // 反撤销
  useKeyPress(['ctrl.y', 'meta.y'], event => {
    event.preventDefault();
    goNext();
  });

  // 剪切Ctrl.X｜Meta.X
  useKeyPress(['ctrl.x', 'meta.x'], event => {
    if (asset && !isTempModuleType(asset) && !asset.meta.locked) {
      const data = buildCopyData();
      if (data) {
        copyAndPaste.copy(data.type, data.data);
      }

      handleRemoveAsset(asset);
    }
  });

  // 参考线显示
  useKeyPress(['ctrl.;', 'meta.;'], event => {
    _show(!show);
  });

  // 拆分组meta+Shift+G｜Ctrl+Shift+G
  useKeyPress(['shift.ctrl.g', 'shift.meta.g'], event => {
    if (isModuleType(asset)) {
      ungroupModule(asset);
    }
  });

  // 成组 Meta+G | Ctrl+G
  useKeyPress(['ctrl.g', 'meta.g'], event => {
    event.preventDefault();
    if (!event.shiftKey) {
      if (multiSelect?.length) {
        groupModule();
      }
    }
  });

  useKeyPress(['ctrl.c', 'meta.c'], async e => {
    // event.preventDefault();
    const data = buildCopyData();
    if (data) {
      copyAndPaste.copy(data);
    }
  });

  useEventListener('paste', async e => {
    // 解析剪切板里的图片数据
    const blob = await analyPaste(e);
    if (!blob) {
      // 粘贴图层
      pasteAsset();
    }
  });

  useKeyPress(37, () => {
    // 方向键左
    if (!asset) {
      setCurrentTime(Math.max(getVideoCurrentTime() - 400, 0), false);
    }
  });
  useKeyPress(39, () => {
    // 方向键右
    if (!asset) {
      setCurrentTime(
        Math.min(getVideoCurrentTime() + 400, getAllTemplateVideoTime()),
        false,
      );
    }
  });

  return <></>;
});
