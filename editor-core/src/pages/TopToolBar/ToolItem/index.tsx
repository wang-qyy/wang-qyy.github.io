import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Tooltip, Popover, Divider } from 'antd';
import {
  useGetCurrentAsset,
  useReplaceStatusByObserver,
  useImageClipByObserver,
  useMaskClipByObserver,
} from '@hc/editor-core';

import {
  useLeftSideInfo,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';
import XiuIcon from '@/components/XiuIcon';
import { clickActionWeblog } from '@/utils/webLog';
import './index.less';

export interface ToolsItem {
  minWidth?: number;
  key: string;
  name?: string;
  icon?: string;
  show: boolean; // 是否显示
  render?: (props: {
    text?: string;
    item?: ToolsItem;
    style?: CSSProperties;
    className?: string;
  }) => ReactElement; // 自定义渲染
  openSidePanel?: boolean;
  hover?: boolean; // hover效果
  active?: boolean; // 是否有选中状态
  selected?: boolean; // 是否选中
  onClick?: () => void;
  iconStyle?: CSSProperties;
  style?: CSSProperties;
  toolItemStyle?: CSSProperties;
  remark?: any;
  className?: string;
  toolTip?: string;
  Dropdown: any;
  isDivider?: boolean; // 是否显示分割条
  dividerStyle?: CSSProperties; // 分割线样式
}

export default function ToolItem({
  data,
  throttledWidth,
  type,
}: {
  data: ToolsItem;
  throttledWidth: number;
  type: string | undefined;
}) {
  const {
    key,
    icon,
    iconStyle,
    name,
    show,
    render,
    className,
    selected,
    active,
    hover,
    toolTip,
    onClick,
    openSidePanel,
    Dropdown,
    isDivider,
    toolItemStyle,
    dividerStyle,
  } = data;

  const [popoverVisible, setPopoverVisible] = useState(false);
  const {
    open: openSettingPanel,
    close: closeSettingPanel,
    value: { panelKey },
  } = useSettingPanelInfo();

  const asset = useGetCurrentAsset();
  const { inReplacing, startReplace, endReplace } =
    useReplaceStatusByObserver();

  const { inClipping, startClip, endClip } = useImageClipByObserver();
  const { inMask, endMask } = useMaskClipByObserver();

  const [hidden, setHidden] = useState(!show);

  const handleToolItemClick = () => {
    // 先关闭其他设置面板
    closeSettingPanel();

    if (Dropdown) {
      setPopoverVisible(!popoverVisible);
    }

    // 抠图点击埋点action_label参数 userUp //个人上传图片 asset // 模板图片
    const extra =
      ['kt001', 'kt002'].indexOf('key') > -1
        ? {
          action_label: asset?.attribute?.isUser ? 'userUp' : 'asset',
        }
        : {};
    clickActionWeblog(
      `tool_${key}${asset?.meta.type ? `_${asset?.meta.type}` : ''}`,
      extra,
    );

    // console.log(key);
    if (onClick) {
      onClick();
    }
    if (openSidePanel) {
      openSettingPanel(`tool-${key}`);
    }

    if (inClipping) {
      endClip();
      closeSettingPanel();
    }

    if (inMask) {
      endMask();
      closeSettingPanel();
    }

    if (inReplacing) {
      endReplace();
    }
  };

  // 切换元素后关闭下拉框
  useEffect(() => {
    if (popoverVisible) {
      setPopoverVisible(false);
    }
  }, [asset?.meta.id]);

  // 工具最小宽度小于当前工具宽度隐藏 其余默认值
  useEffect(() => {
    if (data?.minWidth && type === 'text') {
      if (throttledWidth <= data?.minWidth) {
        setHidden(true);
      } else {
        setHidden(!show);
      }
    } else {
      setHidden(!show);
    }
  }, [throttledWidth, show, data?.minWidth, type]);

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      visible={popoverVisible}
      destroyTooltipOnHide
      content={
        Dropdown ? (
          <div>
            <Dropdown />
          </div>
        ) : (
          <></>
        )
      }
      getPopupContainer={ele => ele}
      onVisibleChange={v => {
        if (!v) {
          setPopoverVisible(v);
        }
      }}
    >
      <Tooltip
        title={toolTip}
        placement="top"
        overlayClassName="toolItemTooltip"
        getPopupContainer={ele => ele}
      >
        {!isDivider ? (
          <div
            style={toolItemStyle}
            hidden={hidden}
            className={classNames('xiudd-tool-item', className, {
              'xiudd-tool-item-hover': hover,
              'xiudd-tool-item-active':
                selected || (active && panelKey === `tool-${key}`),
            })}
            onClick={() => handleToolItemClick()}
          >
            {render ? (
              show &&
              render({
                text: name,
                item: data,
                // style: { display: show ? 'flex' : 'none' },
                className: classNames(
                  // 'xiudd-tool-item',
                  className,
                  {
                    'xiudd-tool-item-active':
                      selected || (active && panelKey === `tool-${key}`),
                    // 'xiudd-tool-item-hover': hover,
                  },
                ),
              })
            ) : (
              <>
                {icon && (
                  <XiuIcon
                    className={classNames('xiudd-tool-item-icon')}
                    type={icon}
                    style={
                      iconStyle ||
                      (name ? { fontSize: '18px', marginRight: '5px' } : {})
                    }
                  />
                )}
                {name && <span className="xiudd-tool-item-name">{name}</span>}
              </>
            )}
          </div>
        ) : (
          type === 'text' && (
            <Divider
              type="vertical"
              style={dividerStyle}
              className="xiudd-tool-item-divider"
            />
          )
        )}
      </Tooltip>
    </Popover>
  );
}
