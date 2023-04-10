import { CSSProperties, PropsWithChildren } from 'react';
import {
  TemplateClass,
  observer,
  getCurrentTemplate,
  getTemplateIndexById,
  getTemplateTimeScale,
  setCurrentTime,
} from '@hc/editor-core';
import { Tooltip } from 'antd';
import { setActiveOperationMenu } from '@/store/adapter/useDesigner';
import XiuIcon from '@/components/XiuIcon';
import { stopPropagation } from '@/utils/single';

import './index.less';

function Transition({
  template,
  style,
}: PropsWithChildren<{
  template: TemplateClass;
  style?: CSSProperties;
}>) {
  return (
    <div
      className="transition-connect"
      style={style}
      onMouseDown={e => {
        stopPropagation(e);
        setActiveOperationMenu('transition');
        if (template.id !== getCurrentTemplate().id) {
          const time =
            getTemplateTimeScale()[getTemplateIndexById(template.id) || 0][1];
          setCurrentTime(time - 100, false);
        }
      }}
    >
      <Tooltip title="设置转场">
        <div className="transition-connect-icon">
          {template.endTransfer ? (
            <XiuIcon type="iconzhuanchang2" />
          ) : (
            <div className="transition-connect-line" />
          )}
        </div>
      </Tooltip>
    </div>
  );
}

export default observer(Transition);
