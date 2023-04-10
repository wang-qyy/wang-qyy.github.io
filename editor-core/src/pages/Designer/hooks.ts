import { useEffect } from 'react';

import {
  addEmptyTemplate,
  getAllTemplates,
  getAllAudios,
  initAudios,
  setCurrentTime,
  initTemplate,
} from '@hc/editor-core';

import { useGetDesignerTemplate } from '@/hooks/useGetTemplate';

import getUrlProps from '@/utils/urlProps';
import { formatRawData, getAudiosFromRowData } from '@/utils/simplify';

import {
  setLoadFinish,
  updateCanvasSize,
} from '@/store/adapter/useTemplateInfo';

function onLoadFinish() {
  setLoadFinish();
  setCurrentTime(0);
}

export function useInitCanvas() {
  const getTemplate = useGetDesignerTemplate(response => {
    const newData = formatRawData(response);

    if (newData.length > 0) {
      initTemplate(newData);
      // 默认选中第一个
      const audios = getAllAudios();
      // 初次加载，如果不存在音轨，则需要初始化音轨
      if (!audios?.length) {
        const audio = getAudiosFromRowData(response);
        // console.log(audio);

        initAudios(audio);
      }

      onLoadFinish();
    }
  });

  useEffect(() => {
    const { blankSize: blankSizeStr, upicId, renovate_type } = getUrlProps();

    // 阻止开发环境热更新重复添加
    if (getAllTemplates().length) return;

    if (upicId) {
      getTemplate.run(Number(upicId), renovate_type);
    } else if (blankSizeStr) {
      const blankSize = blankSizeStr.split('*');

      addEmptyTemplate(3000);

      updateCanvasSize({
        width: Number(blankSize[0]),
        height: Number(blankSize[1]),
      });
      onLoadFinish();
    } else {
      addEmptyTemplate(0);
      onLoadFinish();
    }
  }, []);
}
