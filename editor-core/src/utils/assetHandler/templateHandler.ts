import { getTemplateTimeScale, setCurrentTime } from '@hc/editor-core';

/**
 * 设置当前模板
 *
 */
export function setActiveTemplate(index: number) {
  setCurrentTime(getTemplateTimeScale()[index][0], false);
}
