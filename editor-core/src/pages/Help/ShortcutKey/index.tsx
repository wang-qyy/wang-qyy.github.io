import React, { useState, useRef, CssProperties } from 'react';
import { Tooltip, Dropdown } from 'antd';
import { useClickAway } from 'ahooks';
import classNames from 'classnames';
import { KEY_PRESS_Tooltip } from '@/config/basicVariable';
import XiuIcon from '@/components/XiuIcon';
import { clickActionWeblog } from '@/utils/webLog';

import './index.less';

function ShortcutKey({ style }: { style?: CssProperties }) {
  const [active, setActive] = useState(false);

  const ref = useRef(null);
  useClickAway(() => {
    setActive(false);
  }, ref);

  const data = [
    {
      id: '1',
      title: '画布操作',
      arr: [
        {
          id: 'enlarge',
          name: '画布放大',
        },
        {
          id: 'narrow',
          name: '画布缩小',
        },
      ],
    },
    {
      id: '2',
      title: '文件',
      arr: [
        {
          id: 'save',
          name: '保存',
        },
        {
          id: 'undo',
          name: '上一步',
        },
        {
          id: 'redo',
          name: '下一步',
        },
      ],
    },
    {
      id: '3',
      title: '视图',
      arr: [
        {
          id: 'referenceLine',
          name: '显示/隐藏参考线',
        },
      ],
    },
    {
      id: '4',
      title: '元素',
      arr: [
        {
          id: 'group',
          name: '建组',
        },
        {
          id: 'unGroup',
          name: '取消建组',
        },
        {
          id: 'copy',
          name: '复制',
        },
        {
          id: 'noCopyPaste',
          name: '拷贝',
        },
        {
          id: 'paste',
          name: '粘贴',
        },
        {
          id: 'redo',
          name: '剪切',
        },
        {
          id: 'move',
          name: '移动',
        },
        {
          id: 'multipleChoice',
          name: '多选',
        },
        {
          id: 'delete',
          name: '删除',
        },
      ],
    },

    {
      id: '5',
      title: '图层',
      arr: [
        {
          id: 'moveLayerUp',
          name: '上移一层',
        },
        {
          id: 'moveToTopLevel',
          name: '移到顶层',
        },
        {
          id: 'moveLayerDown',
          name: '下移一层',
        },
        {
          id: 'moveToBottomLevel',
          name: '移到底层',
        },
      ],
    },
    {
      id: '6',
      title: '时间轴',
      arr: [
        {
          id: 'clone',
          name: '拷贝片段',
        },
        {
          id: 'copy',
          name: '复制',
        },
        {
          id: 'paste',
          name: '粘贴',
        },
        {
          id: 'delete',
          name: '删除片段',
        },
        {
          id: 'splitFragment',
          name: '分割片段',
        },
      ],
    },
  ];

  const options = (
    <div className="shortcutKey_Dropdown">
      <div className="shortcutKey_Dropdown_title">快捷键</div>
      <div className="shortcutKey_Dropdown_content">
        {data.map(item => {
          return (
            <div key={item.id} className="shortcutKey_Dropdown_item">
              <div className="item_title">{item.title}</div>
              {item.arr.map(i => {
                return (
                  <div className="item_item" key={i.id}>
                    <span className="item_item_left">{i.name}</span>
                    <span className="item_item_right">
                      {KEY_PRESS_Tooltip[i.id]}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        overlay={options}
        visible={active}
        placement="topLeft"
        getPopupContainer={ele => document.querySelector('#xiudodo')}
        trigger={['click']}
        onVisibleChange={v => {
          if (v) {
            clickActionWeblog('help_001');
          }
        }}
      >
        <Tooltip title="快捷键大全" getTooltipContainer={ele => ele}>
          <div
            ref={ref}
            className={classNames('shortcutKey', {
              'shortcutKey-active': active,
            })}
            onClick={() => setActive(!active)}
            style={style}
          >
            <XiuIcon type="jianpan" className="shortcutKey-icon" />
          </div>
        </Tooltip>
      </Dropdown>
    </>
  );
}

export default ShortcutKey;
