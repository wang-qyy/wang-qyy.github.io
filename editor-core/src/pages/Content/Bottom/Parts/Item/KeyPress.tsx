import { RefObject } from 'react';
import { useKeyPress } from 'ahooks';
import { observer, TemplateClass } from '@hc/editor-core';

import { clickActionWeblog } from '@/utils/webLog';

import { deleteTemplate, addTemplate } from '@/utils/templateHandler';

import { useVideoSplit } from '@/pages/Content/Main/Split';

function preventDefault(e: KeyboardEvent) {
  e.preventDefault();
  e.stopPropagation();
}

interface TemplateKeyPressProps {
  target: RefObject<HTMLButtonElement>;
  template: TemplateClass;
  templateIndex: number;
}

/**
 * @description 片段相关快捷键
 */
function TemplateKeyPress({
  target,
  template,
  templateIndex,
}: TemplateKeyPressProps) {
  // 快捷键分割片段
  useKeyPress(
    's',
    event => {
      // 避免与保存快捷键冲突
      if (!event.ctrlKey) {
        useVideoSplit().handleSplit();
        clickActionWeblog('keyPress_split_template');
      }
    },
    { target },
  );

  // 快速复制片段
  useKeyPress(
    ['ctrl.d', 'meta.d'],
    e => {
      preventDefault(e);
      addTemplate({
        index: templateIndex + 1,
        templates: [template.getTemplateCloned()],
        incrementalPageTime: template.videoInfo.allAnimationTime,
      });
      clickActionWeblog('keyPress_clone_template');
    },
    { target },
  );
  // 删除片段
  useKeyPress(
    ['backspace', 'delete'],
    e => {
      preventDefault(e);

      deleteTemplate();
      clickActionWeblog('keyPress_delete_template');
    },
    { target },
  );
  return <></>;
}

export default observer(TemplateKeyPress);
