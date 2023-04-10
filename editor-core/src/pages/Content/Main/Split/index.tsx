import {
  useCurrentTemplate,
  addTemplate,
  getTemplateIndexById,
  useTemplateClip,
  getCurrentTemplateIndex,
  getRelativeCurrentTime,
} from '@hc/editor-core';
import {
  TEMPLATE_MIN_DURATION,
  TEMPLATE_MIN_DURATION_TRANSFER,
} from '@/config/basicVariable';

import { videoPartWebLog } from '@/utils/webLog';

export function useVideoSplit() {
  const { template } = useCurrentTemplate();

  const videoTotalTime = template?.videoInfo.allAnimationTime || 0;
  const speed = template?.videoInfo.speed || 1;

  const [templateClip, updateTemplateClip] = useTemplateClip(
    getCurrentTemplateIndex(),
  );
  let currentTime = getRelativeCurrentTime();

  currentTime /= 1 / speed;

  const canSplit =
    currentTime > TEMPLATE_MIN_DURATION &&
    videoTotalTime - currentTime > TEMPLATE_MIN_DURATION &&
    template.assets.length;

  const canSplitTransfer =
    currentTime >=
      (template?.startTransfer
        ? TEMPLATE_MIN_DURATION_TRANSFER
        : TEMPLATE_MIN_DURATION) &&
    videoTotalTime - currentTime >
      (template.endTransfer
        ? TEMPLATE_MIN_DURATION_TRANSFER
        : TEMPLATE_MIN_DURATION);

  function handleSplit() {
    if (canSplit) {
      const { pageTime = 0, offsetTime = [0, 0] } = template?.videoInfo || {};
      const newTemplate = template.getTemplateCloned();

      videoPartWebLog('splitPart');

      const index = getTemplateIndexById(template.id);
      const cutPre = [offsetTime[0], pageTime - offsetTime[0] - currentTime];
      const cutAfter = [offsetTime[0] + currentTime, offsetTime[1]];

      Object.assign(newTemplate.pageAttr.pageInfo, { offsetTime: cutAfter });
      updateTemplateClip(cutPre);
      addTemplate([newTemplate], index + 1);
    }
  }

  return { canSplit, canSplitTransfer, handleSplit };
}
