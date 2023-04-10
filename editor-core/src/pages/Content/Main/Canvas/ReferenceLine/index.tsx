/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useCallback, useEffect, useState } from 'react';
import { useReferenceLine } from '@/store/adapter/useGlobalStatus';
import TimeLine from '@/components/TimeLine';
import {
  useUpdateCanvasInfo,
  getTemplateInfo,
} from '@/store/adapter/useTemplateInfo';
import { useReference } from '@/hooks/useReferenceLine';
import Line from './Line';
import HoverLine from './HoverLine';

import './index.less';

function ReferenceLine(props: { canvasInfo: any }) {
  const { canvasInfo } = props;
  const {
    referenceLineX,
    referenceLineY,
    referenceLineShow,
    updateReferenceLine,
    updateReferenceLineShow,
  } = useReferenceLine();
  const { hoverLine, getAddLine, setHoverLine, getDisplay } = useReference();
  const [showTip, setShowTip] = useState('');

  const { value } = useUpdateCanvasInfo();

  const { scale = 0, width, height }: any = canvasInfo || {};

  const formatter = useCallback(
    (v: number) => {
      const val = scale > 0.5 ? 10 * v : 20 * v;
      if (!val || val / window.parseInt(`${value}`) === 1) return `${val}`; // 整数
      return `${val.toFixed(0)}`;
    },
    [canvasInfo],
  );

  const scaleWidth = scale < 0.5 ? 20 * scale : 10 * scale;

  const labelInterval = scale < 0.5 ? 20 : 10;

  useEffect(() => {
    const id = getTemplateInfo()?.templates[0]?.template?.templateId;
    if (id) {
      if (window.localStorage.getItem(`referenceLineX${id}`)) {
        updateReferenceLine(
          JSON.parse(window.localStorage.getItem(`referenceLineX${id}`)),
          'x',
        );
      }
      if (window.localStorage.getItem(`referenceLineY${id}`)) {
        updateReferenceLine(
          JSON.parse(window.localStorage.getItem(`referenceLineY${id}`)),
          'y',
        );
      }

      if (window.localStorage.getItem(`referenceLineShow${id}`)) {
        updateReferenceLineShow(
          JSON.parse(window.localStorage.getItem(`referenceLineShow${id}`)),
        );
      }
    }
  }, []);

  return (
    <>
      {referenceLineShow && (
        <>
          <div
            className="horizontal-rulers"
            style={{ width }}
            onMouseMove={e => {
              if (showTip) {
                return;
              }
              getDisplay(e, 'y');
            }}
            onMouseOut={() => {
              setHoverLine(null);
            }}
            onMouseDown={e => {
              if (showTip) {
                return;
              }
              getAddLine(e, 'y');
            }}
          >
            {/** 尺标 */}
            <TimeLine.Ruler
              width={width || 0}
              height={26}
              scaleWidth={scaleWidth}
              formatter={formatter}
              offsetLeft={0}
              labelInterval={labelInterval}
              scaleHeight={12}
              fontOffsetX={4}
              textBaseline="top"
              fontColor="#A2AAB1"
              scaleColor="#CBD1D7"
              textAlign="center"
              fontSize="10px Arial"
            />
          </div>
          <div
            className="vertical-rulers"
            style={{ height }}
            onMouseMove={e => {
              if (showTip) {
                return;
              }
              getDisplay(e, 'x');
            }}
            onMouseOut={() => {
              setHoverLine(null);
            }}
            onMouseDown={e => {
              if (showTip) {
                return;
              }
              getAddLine(e, 'x');
            }}
          >
            <div className="vertical-rulers-content">
              {/** 尺标 */}
              <TimeLine.Ruler
                width={height || 0}
                height={26 || 0}
                scaleWidth={scaleWidth}
                formatter={formatter}
                offsetLeft={0}
                labelInterval={labelInterval}
                scaleHeight={12}
                fontOffsetX={4}
                textBaseline="top"
                fontColor="#A2AAB1"
                scaleColor="#CBD1D7"
                textAlign="center"
                fontSize="10px Arial"
              />
            </div>
          </div>

          {referenceLineX.map(item => {
            return (
              <Line
                key={item.id}
                item={item}
                type="x"
                canvasInfo={canvasInfo}
                showTip={showTip}
                setShowTip={setShowTip}
              />
            );
          })}
          {referenceLineY.map(item => {
            return (
              <Line
                key={item.id}
                item={item}
                type="y"
                canvasInfo={canvasInfo}
                showTip={showTip}
                setShowTip={setShowTip}
              />
            );
          })}
          <HoverLine hoverLine={hoverLine} canvasInfo={canvasInfo} />
          <div className="corner-block" />
        </>
      )}
    </>
  );
}

export default ReferenceLine;
