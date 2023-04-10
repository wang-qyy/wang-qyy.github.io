import { PropsWithChildren, MouseEvent, CSSProperties } from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';

import { AssetClass } from '@hc/editor-core';

import XiuIcon from '@/components/XiuIcon';
import {
  formatNumberToTime,
  mouseMoveDistance,
  stopPropagation,
} from '@/utils/single';
import { setAssetEditStatus } from '@/utils/assetHandler';

import './index.less';

type TargetType = 'start' | 'end' | 'center';
export interface OnClipParams {
  distance: number;
  target: TargetType;
}

interface ClipProps {
  active?: boolean;
  isLocked?: boolean;
  asset?: AssetClass;
  onClick?: Function;
  style?: CSSProperties;
  duation?: number;
  className?: string;
  onClip: (params: OnClipParams) => boolean | any; // 返回false 或者扩展参数（需要传给onClipFinish的参数）
  onClipFinish?: (params: {
    distance: number;
    target: string;
    extra?: any;
  }) => void;

  handlerToolTip?: { start: string; end: string }; // hover
  handlerIcon?: string;
}

/**
 * @param active 选中状态
 * @param isLocked 锁定状态
 * @param onClip 裁剪
 * @param onClipFinish 裁剪结束
 */
function Clip(props: PropsWithChildren<ClipProps>) {
  const {
    children,
    active,
    isLocked,
    asset,
    onClip,
    onClipFinish,
    style,
    duation,
    className,
    handlerToolTip,
    handlerIcon,
    ...res
  } = props;

  function handleClip(e: MouseEvent<HTMLDivElement>, target: TargetType) {
    stopPropagation(e);
    e.preventDefault();
    e.nativeEvent.preventDefault();

    let extra: any;

    mouseMoveDistance(
      e,
      distance => {
        const result = onClip && onClip({ target, distance });

        if (result) {
          extra = result;
        }
      },
      (distance: number) => {
        onClipFinish && onClipFinish({ distance, target, extra });
      },
    );
  }

  return (
    <div
      className={classNames('clip-component', className, {
        'clip-asset-item-active': active,
      })}
      style={style}
      {...res}
    >
      {!!duation && (
        <div
          className="clip-duation"
          style={{
            background: active ? '#36DAA0' : '#494955',
          }}
        >
          {formatNumberToTime(parseInt(`${duation / 1000}`, 10))}
        </div>
      )}
      {children}

      {active && (
        <>
          <Tooltip
            placement="right"
            getPopupContainer={ele => ele}
            overlayClassName="clip-handler-tooltip"
            title={handlerToolTip?.start}
          >
            <div
              className={classNames('clip-handler', 'clip-handler-left')}
              onMouseDown={e => handleClip(e, 'start')}
            >
              <XiuIcon type={handlerIcon ?? 'iconzanting'} />
            </div>
          </Tooltip>
          <Tooltip
            placement="left"
            getPopupContainer={ele => ele}
            overlayClassName="clip-handler-tooltip"
            title={handlerToolTip?.end}
          >
            <div
              className={classNames('clip-handler', 'clip-handler-right')}
              onMouseDown={e => handleClip(e, 'end')}
            >
              <XiuIcon type={handlerIcon ?? 'iconzanting'} />
            </div>
          </Tooltip>
        </>
      )}

      {isLocked && (
        <Tooltip title="解锁">
          <div
            className="clip-asset-locked"
            onMouseDown={e => {
              stopPropagation(e);
              setAssetEditStatus(asset);
            }}
          >
            <XiuIcon type="iconsuozi" />
          </div>
        </Tooltip>
      )}
    </div>
  );
}

export default Clip;
