/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useCallback, useEffect, useState } from 'react';
import { useSize } from 'ahooks';
import TimeLine from '@/components/TimeLine';
import { useDesignerReferenceLine } from '@/store/adapter/useGlobalStatus';
import getUrlProps from '@/utils/urlProps';
import { useReference } from './hook/useReferenceLine';
import Line from './Line';
import HoverLine from './HoverLine';
import './index.less';

function ReferenceLine(props: { canvasInfo: any }) {
  const { canvasInfo } = props;
  const { hoverLine, setHoverLine, getDisplay } = useReference();
  const [showTip, setShowTip] = useState(''); // 显示toolsTip的参考线id
  const { XLine, YLine, show, updateLine, _show } = useDesignerReferenceLine();
  const { scale, width, height }: any = canvasInfo || {};

  const canvasWidth = scale * width;
  const canvasHeight = scale * height;
  const doc: any = document.querySelector('#xiudodo-canvas');

  const { width: docWidth = 0, height: docHeight = 0 } = useSize(doc);

  const formatter = useCallback(
    (v: number) => {
      const val = scale > 0.5 ? 10 * v : 20 * v;
      return `${val.toFixed(0)}`;
    },
    [canvasInfo],
  );

  const scaleWidth = scale < 0.5 ? 20 * scale : 10 * scale;

  const labelInterval = scale < 0.5 ? 20 : 10;

  useEffect(() => {
    const { upicId } = getUrlProps();
    if (upicId) {
      if (window.localStorage.getItem(`xLine${upicId}`)) {
        updateLine(
          JSON.parse(window.localStorage.getItem(`xLine${upicId}`)),
          'x',
        );
      }
      if (window.localStorage.getItem(`yLine${upicId}`)) {
        updateLine(
          JSON.parse(window.localStorage.getItem(`yLine${upicId}`)),
          'y',
        );
      }
      if (window.localStorage.getItem(`show${upicId}`)) {
        _show(JSON.parse(window.localStorage.getItem(`show${upicId}`)));
      }
    }
  }, []);

  return (
    <>
      {show && (
        <>
          <div className="designer_corner_block" />

          <div
            className="designerHorizontal"
            style={{ width: '100%' }}
            onMouseMove={e => {
              if (showTip) {
                return;
              }
              getDisplay(e, 'y', canvasWidth, canvasHeight, 'move');
            }}
            onMouseOut={() => {
              setHoverLine(null);
            }}
            onMouseDown={e => {
              if (showTip) {
                return;
              }
              getDisplay(e, 'y', canvasWidth, canvasHeight, 'click');
            }}
          >
            {/** 尺标 */}
            <TimeLine.Ruler
              width={width * scale || 0}
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
            className="designer_vertical"
            style={{ height: '100%' }}
            onMouseMove={e => {
              if (showTip) {
                return;
              }
              getDisplay(e, 'x', canvasWidth, canvasHeight, 'move');
            }}
            onMouseOut={() => {
              setHoverLine(null);
            }}
            onMouseDown={e => {
              if (showTip) {
                return;
              }
              getDisplay(e, 'x', canvasWidth, canvasHeight, 'click');
            }}
          >
            <div className="designer_vertical_content">
              {/** 尺标 */}
              <TimeLine.Ruler
                width={height * scale || 0}
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

          {YLine?.map(item => {
            return (
              <Line
                key={item.id}
                item={item}
                type="x"
                canvasInfo={canvasInfo}
                showTip={showTip}
                setShowTip={setShowTip}
                docWidth={docWidth}
                docHeight={docHeight}
              />
            );
          })}
          {XLine?.map(item => {
            return (
              <Line
                key={item.id}
                item={item}
                type="y"
                canvasInfo={canvasInfo}
                showTip={showTip}
                setShowTip={setShowTip}
                docWidth={docWidth}
                docHeight={docHeight}
              />
            );
          })}
          <HoverLine
            hoverLine={hoverLine}
            canvasInfo={canvasInfo}
            docWidth={docWidth}
            docHeight={docHeight}
          />
        </>
      )}
    </>
  );
}

export default ReferenceLine;
