import { useEventListener, useKeyPress } from 'ahooks';
import {
  observer,
  useGetCurrentAsset,
  assetBlur,
  getCurrentAssetCopy,
  useHistoryRecordByObserver,
  ungroupModule,
  groupModule,
  useGetCurrentInfoByObserver,
  isModuleType,
  isTempModuleType,
  getCurrentAsset,
  getCurrentTemplate,
  getVideoCurrentTime,
  setCurrentTime,
  getAllTemplateVideoTime,
  useCameraByObeserver,
  getCurrentCamera,
} from '@hc/editor-core';

import {
  getActiveAudio,
  setActiveAudioInCliping,
  updateActiveAudio,
} from '@/store/adapter/useAudioStatus';

import { clickActionWeblog } from '@/utils/webLog';

import { manualSave } from '@/utils/userSave';

import {
  copyAndPaste,
  pasteAsset,
  pasteAudio,
  stopPropagation,
} from '@/utils/single';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { useRemoveAsset } from '@/hooks/useAssetActions';

import { useSetMusic } from '@/hooks/useSetMusic';
import { useReference } from '@/hooks/useReferenceLine';

import { useCanvasScale } from '@/pages/Content/Main/CanvasScale/handler';
import useClipboardPaste from '@/hooks/useClipboardPaste';
import { useEditMode } from '@/store/adapter/useGlobalStatus';
import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { buildCopyData } from '@/utils/assetHandler';

export default observer(() => {
  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();

  const asset = useGetCurrentAsset();
  const { handleRemoveAsset } = useRemoveAsset();
  const { bindRemoveAudio } = useSetMusic();
  const { showLine } = useReference();
  const { isConcise } = useEditMode();

  const { update, scale = 1 } = useCanvasScale({
    container: document.querySelector('.xiudodo-main') as HTMLElement,
  });
  const { value, goNext, goPrev } = useHistoryRecordByObserver();
  const { multiSelect } = useGetCurrentInfoByObserver();
  const { clipboardPaste, analyPaste } = useClipboardPaste();
  const { removeCamera } = useCameraByObeserver();
  const currentCamera = getCurrentCamera();

  // 输入框中阻止冒泡
  useEventListener(
    'keydown',
    async e => {
      const tagName = (e.target as any)?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        e.stopPropagation();
      }
    },
    {
      capture: true,
    },
  );

  // 播放
  useKeyPress(['space'], event => {
    event.preventDefault();

    if (document.getElementsByClassName('preview-video')?.length <= 0) {
      clickActionWeblog('keyPress_play_video');

      // assetBlur();
      if (isPlaying) {
        pauseVideo();
      } else {
        assetBlur();
        playVideo();
      }
    }
  });

  // 删除 [元素、音频]
  useKeyPress(['backspace', 'delete'], event => {
    event.preventDefault();

    const activeAudio = getActiveAudio();
    clickActionWeblog(
      activeAudio ? 'keyPress_delete_audio' : 'keyPress_delete_asset',
    );
    let log;

    // clickActionWeblog('concise_updateText');

    if (activeAudio) {
      bindRemoveAudio(activeAudio.rt_id);
      updateActiveAudio();
      setActiveAudioInCliping(-1);
      log = 'keyPress_delete_audio';
    } else if (document.getElementsByClassName('preview-video')?.length <= 0) {
      if (asset && !asset.meta.locked) {
        handleRemoveAsset(asset);
      }
    }
    if (currentCamera) {
      removeCamera(-1, currentCamera);
      clickActionWeblog('Timeline_camera_delete');
    }

    // 极速模式
    if (isConcise) {
      log = 'concise5';
    }

    if (log) {
      clickActionWeblog(log);
    }
  });

  // 保存
  useKeyPress(['ctrl.s', 'meta.s'], event => {
    event.preventDefault();
    manualSave();
    clickActionWeblog('keyPress_save');
  });
  // 拷贝
  useKeyPress(['ctrl.d', 'meta.d'], event => {
    event.preventDefault();
    const activeAudio = getActiveAudio();
    if (activeAudio) {
      pasteAudio(activeAudio);
    }
    if (asset) {
      pasteAsset({ asset });
    }
  });
  // 画布缩放
  useKeyPress(['ctrl.-', 'meta.-'], event => {
    event.preventDefault();
    // 修改画布缩放值
    update(scale - 0.1);
  });
  useKeyPress(['ctrl.=', 'meta.='], event => {
    event.preventDefault();
    // 修改画布缩放值
    update(scale + 0.1);
  });

  // 撤销
  useKeyPress(['ctrl.z', 'meta.z'], event => {
    clickActionWeblog('keyPress_undo');
    goPrev();
  });

  // 反撤销
  useKeyPress(['ctrl.y', 'meta.y'], event => {
    event.preventDefault();
    clickActionWeblog('keyPress_redo');
    goNext();
  });

  // 剪切Ctrl.X｜Meta.X
  useKeyPress(['ctrl.x', 'meta.x'], event => {
    if (asset && !isTempModuleType(asset) && !asset.meta.locked) {
      clickActionWeblog('keyPress_cx_asset');
      const data = buildCopyData();
      if (data) {
        // copyAndPaste.copy(data.type, data.data);
        copyAndPaste.copy(data.data, event);
      }

      handleRemoveAsset(asset);
    }
  });

  // 参考线显示
  useKeyPress(['ctrl.;', 'meta.;'], event => {
    showLine();
  });

  // 全选Ctrl.A｜Meta.A
  // useKeyPress(['ctrl.a', 'meta.a'], event => {
  //   event.preventDefault();
  //   const assets = getEditableAssetOnCurrentTime();
  // });

  // 显示参考线 Meta+;｜Ctrl+;
  // useKeyPress(['meta.;', 'ctrl.;'], event => {
  //   if (!event.shiftKey) {
  //     console.log('显示参考线');
  //   }
  // });

  // 隐藏参考线Option+meta+｜Alt+Ctrl+
  // useKeyPress(['shift.meta.;', 'shift.ctrl.;'], event => {
  //   event.preventDefault();
  //   console.log('隐藏参考线');
  // });

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
      if (multiSelect?.size) {
        groupModule();
      }
    }
  });

  // 全屏
  useKeyPress([], event => {});
  // 复制
  useKeyPress(['ctrl.c', 'meta.c'], async e => {
    // event.preventDefault();
    const data = buildCopyData();
    if (data) {
      // copyAndPaste.copy(data.type, data.data);
      const { type } = data;
      if (type === 'audio') {
        clickActionWeblog('keyPress_copy_audio');
      } else if (type === 'asset') {
        clickActionWeblog('keyPress_copy_asset');
      } else if (type === 'template') {
        clickActionWeblog('keyPress_copy_template');
      }

      copyAndPaste.copy(data);
    }
  });
  // useKeyPress(['ctrl.v', 'meta.v'], async e => {
  //   // 解析剪切板里的图片数据
  //   const blob = await analyPaste(e);
  //   if (blob) {
  //     // 粘贴剪切板的内容
  //     clipboardPaste(blob);
  //   } else {
  //     // 粘贴图层
  //     pasteAsset();
  //     const activeAudio = getActiveAudio();
  //     clickActionWeblog(
  //       activeAudio ? 'keyPress_paste_audio' : 'keyPress_paste_asset',
  //     );
  //   }
  // });
  useEventListener('paste', async e => {
    // 解析剪切板里的图片数据
    const blob = await analyPaste();
    if (!blob) {
      // 粘贴图层
      pasteAsset();
      const activeAudio = getActiveAudio();
      clickActionWeblog(
        activeAudio ? 'keyPress_paste_audio' : 'keyPress_paste_asset',
      );
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
