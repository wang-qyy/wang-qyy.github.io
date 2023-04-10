import { message, Modal } from 'antd';
import { differenceBy } from 'lodash-es';
import {
  removeTemplate,
  getTemplateIndexById,
  getTemplateTimeScale,
  getAllTemplates,
  useCurrentTemplate,
  getCurrentTemplate,
  addEmptyTemplate,
  setCurrentTime,
  addTemplate as addNewTemplate,
  TemplateClass,
  RawTemplateData,
  getCurrentTemplateIndex,
  setLllegelAssetsHandler,
  getEmptyTemplateData,
  replaceTemplate,
  initAudios,
  getAbsoluteCurrentTime,
  getAllTemplateVideoTime,
} from '@hc/editor-core';
import { checkTotalTime } from '@/hooks/useCheckVideoTotalTime';
import { reportChange } from '@/kernel/utils/config';
import {
  getCanvasInfo,
  setReplaceWarn,
  getReplaceWarn,
} from '@/store/adapter/useTemplateInfo';
import { DEFAULT_TEMPLATE_PAGE_TIME } from '@/config/basicVariable';

import type { WarnAssetItem } from '@/typings';
import { assetHandler } from '@/kernel/store';
import TemplateState from '@/kernel/store/assetHandler/template';

/**
 * @description 自动纠正时间
 * */
export function autoCorrectionTime() {
  // 重置时间
  const currentTime = getAbsoluteCurrentTime();
  const allPageTime = getAllTemplateVideoTime();

  if (currentTime > allPageTime) {
    setCurrentTime(allPageTime, false);
  }
}

/**
 * @description 设置当前片段
 * @param index 模板index
 */
export function setActiveTemplate(index: number) {
  setCurrentTime(getTemplateTimeScale()[index][0], false);
}

function canDeleteTemplate(template: TemplateClass) {
  const templates = getAllTemplates();
  const targetTemplate = template ?? getCurrentTemplate();

  return templates.find(
    temp => temp.id !== targetTemplate?.id && temp.assets.length > 0,
  );
}

/**
 * @description 删除片段
 * */
function deleteTemplate(template: TemplateClass) {
  const prevIndex = getTemplateIndexById(template.id) - 1;

  setActiveTemplate(prevIndex < 0 ? 0 : prevIndex);

  setTimeout(() => {
    removeTemplate(template.id);
  });
  autoCorrectionTime();
}

/**
 * @description 片段删除验证
 */
function beforeDelete(template?: TemplateClass) {
  const targetTemplate = template ?? getCurrentTemplate();

  const templates = getAllTemplates();

  if (templates.length === 1) {
    const templateData = getEmptyTemplateData(5000);
    // templateData.pageAttr.backgroundColor = { r: 0, g: 0, b: 0, a: 1 };

    replaceTemplate(templateData, targetTemplate.id);
    initAudios([]);
  } else {
    deleteTemplate(targetTemplate);
  }

  autoCorrectionTime();
}

export { beforeDelete as deleteTemplate };

/**
 * 删除片段
 */
export function useDeleteTemplate(template?: TemplateClass) {
  const { template: currentTemplate } = useCurrentTemplate();
  const targetTemplate = template ?? currentTemplate;

  return {
    delete: beforeDelete,
    disabled: !canDeleteTemplate(targetTemplate),
  };
}

/**
 * 单片段模式删除片段
 */
export function deleteTempBySingle(template: TemplateClass) {
  const targetTemplate = template;

  const templates = getAllTemplates();

  if (templates.length === 1) {
    const templateData = getEmptyTemplateData(5000);
    replaceTemplate(templateData, targetTemplate.id);
    initAudios([]);
  } else {
    const prevIndex = getTemplateIndexById(template.id) - 1;
    assetHandler.setCurrentTemplate(prevIndex < 0 ? 0 : prevIndex);
    removeTemplate(template.id);
  }
}

/**
 * @decript 判断是否存在空片段
 */
function hasEmptyTemplate() {
  return getAllTemplates().find(item => item.assets.length === 0);
}

/**
 * @description 更新必要替换元素/违规元素列表
 */
export function updateWaringAssets(assets: WarnAssetItem[]) {
  const warnAssets = getReplaceWarn();
  const temp = differenceBy(assets, warnAssets, 'resId');
  const newWarnAssets = [...warnAssets, ...temp];
  setReplaceWarn(newWarnAssets);
  setLllegelAssetsHandler(newWarnAssets);
}

interface AddTemplateParams {
  index?: number;
  templates?: RawTemplateData[];
  incrementalPageTime?: number;
  warnAssets?: WarnAssetItem[];
}
/**
 * @description 添加模板
 * @param index 添加模板的目标位置
 * @param templates 选择的模板数据
 * @param incrementalPageTime 时间增量 用来判断是否超出总时长限制 默认添加空模板是5秒
 * */
export function addTemplate(params: AddTemplateParams) {
  const {
    index = getCurrentTemplateIndex() + 1,
    incrementalPageTime,
    templates,
    warnAssets = [],
  } = params;

  let result: number;

  const incrementalTime = incrementalPageTime ?? 5000;

  if (!checkTotalTime({ incrementalTime })) {
    if (templates) {
      result = addNewTemplate(templates, index);
    } else {
      if (hasEmptyTemplate()) {
        message.info('已存在一个空模板！！');
        return;
      }
      result = addEmptyTemplate(5000, index);
    }
    setActiveTemplate(result);

    updateWaringAssets(warnAssets);
  }
}

/**
 * @description 添加空模板
 */
export function useAddEmptyTemplate() {
  const hasEmpty = hasEmptyTemplate();

  return {
    addTemplate,
    disabled: hasEmpty || checkTotalTime({ incrementalTime: 5000, tip: false }),
    hasEmpty,
  };
}

/**
 * @description 复制片段
 */
export function useCopyTemplate(template: TemplateClass) {
  const isEmptyTemplate = template?.assets?.length <= 0;

  function handleCopy() {
    if (isEmptyTemplate) {
      message.info('已存在一个空模板！！');
      return;
    }

    if (template) {
      addTemplate({
        index: getTemplateIndexById(template.id) + 1,
        templates: [template.getTemplateCloned()],
        incrementalPageTime: template.videoInfo.allAnimationTimeBySpeed,
      });
      reportChange('copyTemplate', true);
    }
  }

  return {
    copy: handleCopy,
    isEmptyTemplate,
    disabled:
      isEmptyTemplate ||
      checkTotalTime({
        incrementalTime: template?.videoInfo?.allAnimationTime,
        tip: false,
      }),
  };
}

/**
 * @description 获取当前模板尺寸参数
 * @returns {"h" | "c" | "w"}
 */
export const getCanvasShape = () => {
  const { width, height } = getCanvasInfo();

  // if (width === 750 && height === 1000) return '3r4';
  if (width < height) return 'h';
  if (width === height) return 'c';

  return 'w';
};

/**
 * */
export function clearTemplate(template: TemplateClass) {
  const newTemplate = getEmptyTemplateData(DEFAULT_TEMPLATE_PAGE_TIME);

  // newTemplate.pageAttr.backgroundColor = { r: 0, g: 0, b: 0, a: 1 };

  const newTemp = new TemplateState(newTemplate);
  replaceTemplate(newTemp, template.id);
  autoCorrectionTime();
}
