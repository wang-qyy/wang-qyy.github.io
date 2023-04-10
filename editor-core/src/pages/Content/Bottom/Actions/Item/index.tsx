import { useState, CSSProperties, MouseEvent, ReactElement } from 'react';
import { Tooltip, Popover } from 'antd';

import classNames from 'classnames';

import XiuIcon from '@/components/XiuIcon';

import { ossEditorPath } from '@/config/urls';
import { stopPropagation } from '@/utils/single';

export interface ItemData {
  key: string;
  id?: string;
  disabled?: boolean;
  icon?: string;
  iconStyle?: CSSProperties;
  name?: string;
  onClick?: (e: MouseEvent) => void;
  popoverContent?: (props: { onClose: () => void }) => ReactElement;
  isNew?: boolean; // 新功能标记
  isBeta?: boolean; // 标记
  active?: boolean; // 选中状态
  tooltip?: string; // 提示
}

export default function Item({ item }: { item: ItemData }) {
  const {
    disabled,
    icon,
    iconStyle,
    name,
    onClick,
    popoverContent,
    isNew,
    isBeta,
    active,
    ...others
  } = item;

  const [popoverVisibleState, setPopoverVisibleState] = useState(false);

  return (
    <Tooltip
      title={item.tooltip || item.name}
      placement="bottom"
      getTooltipContainer={ele => ele}
    >
      <Popover
        placement="top"
        trigger="click"
        visible={popoverContent ? popoverVisibleState : false}
        content={() =>
          popoverContent &&
          popoverContent({ onClose: () => setPopoverVisibleState(false) })
        }
        onVisibleChange={setPopoverVisibleState}
        destroyTooltipOnHide
        getPopupContainer={() =>
          document.getElementById('xiudodo') as HTMLElement
        }
      >
        <div
          className={classNames('xiudodo-bottom-part-action', {
            'xiudodo-bottom-part-action-disabled': disabled,
            'xiudodo-bottom-part-action-active': item.active,
          })}
          onMouseDown={stopPropagation}
          onClick={e => {
            stopPropagation(e);
            onClick && onClick(e);
            setPopoverVisibleState(true);
          }}
          {...others}
        >
          {icon && <XiuIcon type={icon} style={iconStyle} />}
          {name && <span className="action-name">{name}</span>}
          {isNew && (
            <img
              width={30}
              style={{ position: 'absolute', right: -24, top: -6 }}
              src={ossEditorPath('/image/new.png')}
              alt="newIcon"
            />
          )}
          {isBeta && (
            // <img
            //   width={30}
            //   style={{ position: 'absolute', right: -24, top: -6 }}
            //   src={ossEditorPath('/image/beta.png')}
            //   alt="newIcon"
            // />
            <div className="action-Beta">
              <XiuIcon
                type="jingtou-duijiao"
                style={{ fontSize: 25, marginRight: 5 }}
              />
              镜头
            </div>
          )}
        </div>
      </Popover>
    </Tooltip>
  );
}
