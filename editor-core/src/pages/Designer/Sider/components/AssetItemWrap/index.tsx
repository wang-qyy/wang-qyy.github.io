import { CSSProperties, PropsWithChildren } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { formatNumberToTime } from '@/utils/single';

import './index.less';
import classNames from 'classnames';

interface AssetItemWrapProps {
  onAdd?: () => void;
  onReplace?: (() => void) | false;
  onDelete?: () => void;
  style?: CSSProperties;
  className?: string;
  duration?: number;
  addTip?: string;
  replaceTip?: string;
}

export default function AssetItemWrap(
  props: PropsWithChildren<AssetItemWrapProps>,
) {
  const {
    children,
    duration,
    onAdd,
    onReplace,
    onDelete,
    className,
    addTip = '添加',
    replaceTip = '替换',
  } = props;

  return (
    <div className={classNames('asset-item-wrap', className)}>
      {duration && (
        <div className="asset-item-wrap-duration">
          {formatNumberToTime(parseInt(`${duration / 1000}`, 10))}
        </div>
      )}

      {onDelete && (
        <div className="user-video-delete" onClick={onDelete}>
          <XiuIcon type="iconshanchu1" />
        </div>
      )}

      <div className="asset-item-wrap-action-wrap">
        {onAdd && (
          <Tooltip
            title={addTip}
            overlayInnerStyle={{
              fontSize: 12,
              padding: '2px 4px',
              minHeight: 'auto',
            }}
          >
            <div
              className="asset-item-wrap-action"
              style={{ left: 'auto', right: 4 }}
              onClick={onAdd}
            >
              <PlusOutlined />
            </div>
          </Tooltip>
        )}
        {onReplace && (
          <Tooltip
            title={replaceTip}
            overlayInnerStyle={{
              fontSize: 12,
              padding: '2px 4px',
              minHeight: 'auto',
            }}
          >
            <div className="asset-item-wrap-action" onClick={onReplace}>
              <XiuIcon type="iconexchange" />
            </div>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}
