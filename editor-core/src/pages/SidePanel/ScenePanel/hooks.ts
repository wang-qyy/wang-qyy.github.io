import { MouseEvent, useState } from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import {
  delFavTemplate,
  getNormalUserFavList,
  setFavTemplate,
} from '@/api/template';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { checkTotalTime } from '@/hooks/useCheckVideoTotalTime';
import {
  replaceTemplate,
  getCurrentTemplate,
  getAllTemplates,
  getTemplateTimeScale,
  getTemplateIndexById,
  setCurrentTime,
  getCurrentTemplateIndex,
} from '@hc/editor-core';
import {
  updatePicId,
  useUpdateCanvasInfo,
} from '@/store/adapter/useTemplateInfo';
import { useGetTemplate } from '@/hooks';
import { formatRawData } from '@/utils/simplify';
import { addTemplate, updateWaringAssets } from '@/utils/templateHandler';
import type { TemplateListItem } from './typing';

export function useCollect() {
  const { checkLoginStatus } = useCheckLoginStatus();
  const { update: updateCanvasInfo } = useUpdateCanvasInfo();

  const [moduleFavList, setModuleFavList] = useState([{ id: -1 }]); // 收藏列表

  // 获取收藏列表
  const getNormalUserFavs = useRequest(getNormalUserFavList, {
    manual: true,
    onSuccess: res => {
      if (res.stat === 1) {
        setModuleFavList(res.msg);
      }
    },
  });
  // 添加收藏
  const setFav = useRequest(setFavTemplate, {
    manual: true,
    onSuccess: res => {},
  });

  // 取消收藏
  const delFav = useRequest(delFavTemplate, {
    manual: true,
    onSuccess: res => {},
  });

  // 收藏
  const beMyFav = async (
    e: MouseEvent<HTMLDivElement>,
    id: number | string,
    isFav: boolean,
  ) => {
    e.stopPropagation();

    if (checkLoginStatus()) return;

    const isAdd = isFav ? false : !moduleFavList.some(item => item.id === id);
    let response = { stat: -1, msg: '' };

    if (isAdd) {
      response = await setFav.run(id);
    } else {
      response = await delFav.run(id);
    }

    if (response.stat === 1) {
      setModuleFavList(prev =>
        isAdd ? [...prev, { id }] : prev?.filter(item => item.id !== id),
      );
      message.success(response.msg);
    } else {
      message.error(response.msg);
    }
  };

  // 切换场景或添加场景后暂停播放 并重置时间
  function afterReplace(index?: number) {
    setTimeout(() => {
      setCurrentTime(index ? getTemplateTimeScale()[index][0] : 0, false);
    });
  }

  const { run: getTemplate, loading } = useGetTemplate();

  // 替换单个场景
  function handleReplace(data: TemplateListItem) {
    getTemplate({ picId: data?.template_id }).then(response => {
      const newData = formatRawData(response);
      // const audio: MultipleAudio[] = getAudiosFromRowData(response);
      const part = newData[data?.jump];

      checkTotalTime({
        incrementalTime:
          part.pageAttr.pageInfo.pageTime -
          getCurrentTemplate().videoInfo.allAnimationTime,
        callback: exceed => {
          if (exceed) return;
          replaceTemplate(part);

          if (getAllTemplates().length <= 1) {
            updateCanvasInfo({
              width: Number(data.width),
              height: Number(data.height),
            });
          }

          updatePicId(part.templateId);
          const template = getCurrentTemplate();
          const currentTempIndex = getTemplateIndexById(template.id);
          afterReplace(currentTempIndex);
          updateWaringAssets(response.assets);
        },
      });
    });
  }

  // 插入单个场景
  function insertTemplate(data: TemplateListItem) {
    getTemplate({ picId: data?.template_id }).then(response => {
      const newData = formatRawData(response);
      const part = newData[data?.jump];
      const currentTempIndex = getCurrentTemplateIndex();
      const insertIndex = currentTempIndex + 1;

      addTemplate({
        index: insertIndex,
        templates: [part],
        incrementalPageTime: part.pageAttr.pageInfo.pageTime,
        warnAssets: response.assets,
      });
    });
  }

  return {
    moduleFavList,
    beMyFav,
    getNormalUserFavs,
    insertTemplate,
    handleReplace,
  };
}
