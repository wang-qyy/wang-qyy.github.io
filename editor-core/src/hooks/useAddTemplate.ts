import { useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import { debounce } from 'lodash-es';
import {
  replaceTemplate,
  replaceAllTemplate,
  getCurrentTemplate,
  getAllTemplates,
  getTemplateTimeScale,
  setCurrentTime,
  initAudios,
  MultipleAudio,
  RawTemplateData,
  getCurrentTemplateIndex,
  setAudioEditStatus,
} from '@hc/editor-core';
import { useGetTemplate } from '@/hooks/index';

import { formatRawData, getAudioEditStatusFromRowData, getAudiosFromRowData } from '@/utils/simplify';
import { checkTotalTime } from '@/hooks/useCheckVideoTotalTime';

import {
  updatePicId,
  useUpdateCanvasInfo,
  updateDocMd5,
} from '@/store/adapter/useTemplateInfo';

import {
  setActiveTemplate,
  addTemplate,
  updateWaringAssets,
} from '@/utils/templateHandler';

// 切换模板或添加模板后暂停播放 并重置时间
export function afterReplace(index = 0) {
  setTimeout(() => {
    setActiveTemplate(index);
  });
}
export const afterReplaceDebounce = debounce((index?: number) => {
  setCurrentTime(index ? getTemplateTimeScale()[index][0] : 0, false);
}, 500);
/**
 * @description 关于模板添加类的封装
 * @param templateBaseInfo
 */
function useAddTemplate(templateBaseInfo: any) {
  const [parts, setParts] = useState<RawTemplateData[]>([]);
  const [templateAudios, setTemplateAudio] = useState<MultipleAudio[]>([]);
  const [draftMD5, setDraftMD5] = useState('');
  const [loaded, setLoaded] = useState(false);

  const partsCache = useRef<RawTemplateData[]>([]);
  const audioCache = useRef<MultipleAudio[]>([]);
  const audioReplacedCache = useRef(false);
  const canvasCache = useRef<{ width: number; height: number }>({});
  const warnAssetsCache = useRef<[]>([]); // 必要替换元素、违规元素

  const { update: updateCanvasInfo, value: canvasInfo } = useUpdateCanvasInfo();

  const isDifferCurrentSize = useMemo(() => {
    return (
      canvasInfo.height !== Number(templateBaseInfo.height) ||
      canvasInfo.width !== Number(templateBaseInfo.width)
    );
  }, [
    canvasInfo.height,
    canvasInfo.width,
    templateBaseInfo.height,
    templateBaseInfo.width,
  ]);

  // 获取单个模板详情
  const { run: runGetTemplate, loading } = useGetTemplate(
    response => {
      const newData = formatRawData(response);
      const audio: MultipleAudio[] = getAudiosFromRowData(response);
      const replaced = getAudioEditStatusFromRowData(response);
      setParts(newData);
      setDraftMD5(response.info.doc_md5);
      setTemplateAudio(audio);
      partsCache.current = newData;
      audioCache.current = audio;
      audioReplacedCache.current = replaced;
      canvasCache.current = response.doc.canvas;
      warnAssetsCache.current = response.assets;

      setLoaded(true);
    },
    () => {},
    res => {
      return false;
    },
  );
  function getTemplate(params: Parameters<typeof runGetTemplate>[number]) {
    if (loading || loaded) {
      return;
    }
    runGetTemplate(params);
  }
  // 插入所有模板
  function insertAllTemplates(currentTempIndex?: number) {
    if (isDifferCurrentSize) {
      message.info(`暂不支持添加不同尺寸的片段`);
      return;
    }

    addTemplate({
      index: (currentTempIndex ?? getCurrentTemplateIndex()) + 1,
      templates: partsCache.current,
      incrementalPageTime: Number(templateBaseInfo.duration),
      warnAssets: warnAssetsCache.current,
    });
  }

  // 替换所有片段
  function handleReplaceAllTemplate() {
    replaceAllTemplate(partsCache.current);
    setCurrentTime(0, false);
    initAudios([...audioCache.current]);
    setAudioEditStatus(audioReplacedCache.current);

    updatePicId(partsCache.current[0].templateId);
    updateCanvasInfo(canvasCache.current);
    afterReplace();
    updateWaringAssets(warnAssetsCache.current);
  }

  // 插入单个模板
  function insertTemplate(part: RawTemplateData, currentTempIndex?: number) {
    if (isDifferCurrentSize) {
      message.info(`暂不支持添加不同尺寸的片段`);
      return;
    }
    addTemplate({
      index: (currentTempIndex ?? getCurrentTemplateIndex()) + 1,
      templates: [part],
      incrementalPageTime: part.pageAttr.pageInfo.pageTime,
      warnAssets: warnAssetsCache.current,
    });
  }

  // 替换单个模板
  function handleReplace(part: RawTemplateData, currentTempIndex: number) {
    checkTotalTime({
      incrementalTime:
        part.pageAttr.pageInfo.pageTime -
        getCurrentTemplate().videoInfo.allAnimationTime,
      callback: exceed => {
        if (exceed) return;
        replaceTemplate(part);

        if (getAllTemplates().length <= 1) {
          initAudios([...audioCache.current]);

          updateCanvasInfo(canvasCache.current);
        }

        updatePicId(part.templateId);

        afterReplace(currentTempIndex);
        updateWaringAssets(warnAssetsCache.current);
      },
    });
  }

  // 切换草稿
  function switchDraft() {
    window.history.replaceState(
      '',
      document.title,
      `?&upicId=${templateBaseInfo.id}`,
    );
    handleReplaceAllTemplate();
    updateDocMd5(draftMD5);
    updateCanvasInfo(canvasCache.current);
  }

  return {
    getTemplate,
    runGetTemplate,
    loading,
    loaded,
    parts,
    templateAudios,
    insertAllTemplates,
    handleReplaceAllTemplate,
    insertTemplate,
    handleReplace,
    afterReplace,
    switchDraft,
    isDifferCurrentSize,
  };
}

export default useAddTemplate;
