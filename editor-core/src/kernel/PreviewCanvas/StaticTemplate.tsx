import React, { useMemo, useState, useEffect } from 'react';
import Asset from '@kernel/Asset';

import { observer } from 'mobx-react';

import { newDomId } from '@kernel/utils/idCreator';
import { PlayStatus } from '@kernel/utils/const';
import { CanvasInfo, AssetClass } from '@/kernel/typing';
import { useCanvasStyle } from '@kernel/Canvas/utils';
import { getTargetRecord } from '@kernel/store/historyRecord/adapter';
import { useTemplateLoaded } from '@kernel/store';

export const emptyVideoStatus = {
  playStatus: PlayStatus.Stopped,
  currentTime: 0,
};

export interface StaticTemplateProps {
  canvasInfo: CanvasInfo;
  currentTime: number;
  templateIndex: number;
}

const StaticTemplate = observer(
  ({ canvasInfo, currentTime, templateIndex }: StaticTemplateProps) => {
    const { canvasStyle, renderStyle } = useCanvasStyle(canvasInfo);
    const { templates: templateList } = getTargetRecord();
    const prefix = useMemo(() => {
      return `staticTemplate-${newDomId()}-${templateIndex}`;
    }, []);

    const [initComplete, setInitComplete] = useState(false);

    const template = templateList[templateIndex];
    const allLoaded = useTemplateLoaded();
    useEffect(() => {
      if (!initComplete && allLoaded && template) {
        setInitComplete(true);
      }
    }, [initComplete, template, allLoaded]);

    return (
      <div className="hc-core-wrapper">
        <div className="hc-core-canvas" style={canvasStyle}>
          <div className="hc-core-canvas-render" style={renderStyle}>
            {template && initComplete && (
              <Asset
                assets={template.assets as AssetClass[]}
                isPreview
                showOnly
                templateIndex={templateIndex}
                key={template.id}
                prefix={`${prefix}-${template.id}`}
                canvasInfo={canvasInfo}
                videoStatus={{
                  playStatus: PlayStatus.Paused,
                  currentTime,
                }}
                videoInfo={template.videoInfo}
                pageAttr={template.pageAttr}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);
export default StaticTemplate;
