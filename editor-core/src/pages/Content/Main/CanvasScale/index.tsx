import {
  useState,
  useMemo,
  CSSProperties,
  MouseEvent,
  HTMLAttributes,
} from 'react';
import { Dropdown, Menu, Tooltip } from 'antd';
import { useScroll, useSize, useUpdateEffect } from 'ahooks';
import classNames from 'classnames';

import {
  getRelativeCurrentTime,
  observer,
  StaticTemplate,
  getCurrentTemplateIndex,
} from '@hc/editor-core';
import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';
import XiuIcon from '@/components/XiuIcon';
import { stopPropagation, mouseMoveDistance } from '@/utils/single';

import { clickActionWeblog } from '@/utils/webLog';
import { getManualScale } from '@/store/adapter/useGlobalStatus';
import { getScale, SizeType, useCanvasScale } from './handler';

import './index.less';

interface ScaleProps extends HTMLAttributes<HTMLDivElement> {
  container: HTMLElement;
}

function Scale(props: ScaleProps) {
  const { container, className, ...others } = props;
  const manualScale = getManualScale();
  const { canvasInfo, update, isScroll } = useCanvasScale({ container });
  const { scale: value, width: canvasWidth, height: canvasHeight } = canvasInfo;

  const { value: templateSize } = useUpdateCanvasInfo();

  const { width = 0, height = 0 } = templateSize as SizeType;

  const [preview, setPreview] = useState(false);

  const [sizeOptions, setSizeOptions] = useState(false);

  // const container = document.querySelector('.xiudodo-main') as HTMLDivElement;
  const containerSize = useSize(container);
  const scrollInfo = useScroll(container);

  useUpdateEffect(() => {
    // 监听到画布缩放比例变化后自动展开导航器
    if (manualScale) {
      setPreview(true);
    }
  }, [value, manualScale]);

  const previewSize = useMemo(() => {
    const previewScale = getScale(
      templateSize as SizeType,
      { width: 132, height: 80 },
      1,
      20,
    );

    return {
      width: width * previewScale,
      height: height * previewScale,
      scale: previewScale,
    };
  }, [width, height]);

  // 导航器 预览位置
  const canvasPosition: CSSProperties = useMemo(() => {
    let scaleX = 1;
    let scaleY = 1;

    let left = '0';
    let top = '0';
    const position = 'absolute';

    const { isScrollX, isScrollY } = isScroll;

    if (isScrollX || isScrollY) {
      left = `${(scrollInfo.left / canvasWidth) * 100}%`;
      top = `${(scrollInfo.top / canvasHeight) * 100}%`;
    }

    if (isScrollX && containerSize.width) {
      scaleX = containerSize.width / canvasWidth;
    }

    if (isScrollY && containerSize.height) {
      scaleY = containerSize.height / canvasHeight;
    }

    return {
      position,
      left,
      top,
      width: previewSize.width * scaleX,
      height: previewSize.height * scaleY,
    };
  }, [
    isScroll,
    scrollInfo.left,
    scrollInfo.top,
    previewSize.height,
    previewSize.width,
  ]);

  // 导航器拖动控制画布滚动
  function handleMove(e: MouseEvent<HTMLDivElement>) {
    stopPropagation(e);

    const { top, left } = scrollInfo;

    const maxTop = canvasHeight - Number(containerSize.height);
    const maxLeft = canvasWidth - Number(containerSize.width);

    mouseMoveDistance(e, (distanceX, distanceY) => {
      const scrollX = maxLeft * (distanceX / previewSize.width);
      const scrollY = maxTop * (distanceY / previewSize.height);

      container.scrollTo(left + scrollX, top + scrollY);
    });
  }

  // 调整画布缩放
  function changeScale(num: number) {
    update(num);
  }

  const options = (
    <Menu
      onClick={({ key }) => {
        // console.log(key);
        changeScale(key);
        clickActionWeblog('canvasScale03');
      }}
    >
      <Menu.Item key={0.5}>50%</Menu.Item>
      <Menu.Item key={0.75}>75%</Menu.Item>
      <Menu.Item key={1}>100%</Menu.Item>
      <Menu.Item key={1.35}>135%</Menu.Item>
      <Menu.Item key="fit">适应屏幕</Menu.Item>
    </Menu>
  );

  return (
    <div
      className={classNames('scale-wrap', className)}
      onMouseDown={stopPropagation}
      {...others}
    >
      <div style={{ position: 'relative' }} id="xiudod-canvas-scale">
        <div className="scale-preview" style={{ height: preview ? 80 : 0 }}>
          <div className="scale-preview-canvas" style={previewSize}>
            <div
              style={{
                height: '100%',
                width: '100%',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {preview && (
                <StaticTemplate
                  canvasInfo={{ ...templateSize, scale: previewSize.scale }}
                  currentTime={getRelativeCurrentTime()}
                  templateIndex={getCurrentTemplateIndex()}
                />
              )}
            </div>
            <div
              className="scale-preview-view"
              style={canvasPosition}
              onMouseDown={handleMove}
            />
          </div>
        </div>
        <div
          className={classNames('scale-content', {
            'scale-content-active': preview || sizeOptions,
          })}
        >
          <Tooltip
            title={preview ? '关闭导航器' : '展开导航器'}
            getTooltipContainer={() =>
              document.getElementById('xiudodo') as HTMLElement
            }
          >
            <div
              className={classNames('scale-preview-canvas-btn', {
                'scale-preview-canvas-btn-active': preview,
              })}
              onClick={() => setPreview(!preview)}
            >
              <XiuIcon type="icona-1" />
            </div>
          </Tooltip>
          <Dropdown
            overlayClassName="scale-dropdown"
            overlay={options}
            placement="topCenter"
            getPopupContainer={() =>
              document.getElementById('xiudod-canvas-scale') as HTMLElement
            }
            trigger={['click']}
            onVisibleChange={setSizeOptions}
          >
            <div className="scale-handler">
              <div
                className="scale-action-icon"
                onClick={e => {
                  stopPropagation(e);
                  clickActionWeblog('canvasScale02');
                  changeScale(Number(value) - 0.05);
                }}
              >
                <XiuIcon type="icona-3" />
              </div>
              <span className="scale-action-span">
                {Math.floor(Number(value) * 100)} %
              </span>
              <div
                className="scale-action-icon"
                onClick={e => {
                  clickActionWeblog('canvasScale01');
                  stopPropagation(e);
                  changeScale(Number(value) + 0.05);
                }}
              >
                <XiuIcon type="icona-2" />
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
export default observer(Scale);
