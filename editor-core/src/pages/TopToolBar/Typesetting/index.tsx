import { useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import { stopPropagation } from '@/utils/single';
import { Tooltip } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import classnames from 'classnames';
import OverwriteSlider from '@/components/OverwriteSlider';
import {
  useTextAlignByObserver,
  useLineHeightByObserver,
  useLetterSpacingByObserver,
  useGetCurrentAsset,
  observer,
} from '@hc/editor-core';
import { clickActionWeblog } from '@/utils/webLog';

function Typesetting() {
  const asset = useGetCurrentAsset();
  const [textAlign, updateTextAlign] = useTextAlignByObserver();
  const [lineHeight, updateLineHeight] = useLineHeightByObserver();
  const [letterSpacing, updateLetterSpacing] = useLetterSpacingByObserver(); // 字间距

  const align = [
    {
      key: 'left',
      name: '左对齐',
      icon: 'icona-bianzu2',
    },
    {
      key: 'center',
      name: '居中对齐',
      icon: 'icona-bianzu3',
    },
    {
      key: 'right',
      name: '右对齐',
      icon: 'icona-bianzu4',
    },
  ];

  const { run: webLog } = useDebounceFn(
    type => {
      clickActionWeblog(type);
    },
    { wait: 500 },
  );

  return (
    <div style={{ width: 334, padding: 16 }} onClick={stopPropagation}>
      <div className="tool-bar-flex-box flex-space-between">
        <span>对齐</span>
        <div className="tool-bar-flex-box">
          {align.map(item => (
            <div
              className={classnames(
                'xiudd-tool-item',
                'xiudd-tool-item-hover',
                { 'top-tool-bar-item-active': textAlign === item.key },
              )}
              key={`textAlign${item.key}`}
              onClick={() => {
                clickActionWeblog('tool_align', { action_label: item.key });
                updateTextAlign(item.key);
              }}
              style={{ height: 30 }}
            >
              <Tooltip title={item.name}>
                <XiuIcon className={classnames('xiuIcon')} type={item.icon} />
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <OverwriteSlider
          label="间距"
          value={Math.floor(Number(letterSpacing ?? 0))}
          onChange={value => {
            updateLetterSpacing(value);
            // console.log('tool_letterSpacing');
            webLog('tool_letterSpacing');
          }}
          inputNumber
          tooltipVisible={false}
        />
      </div>
      {/* 暂时--对于有设置字块背景的 不允许设置行高 */}
      {!(
        asset?.attribute.textBackground &&
        asset?.attribute.textBackground?.enabled
      ) && (
        <div style={{ marginTop: 16 }}>
          <OverwriteSlider
            label="行高"
            value={Number(lineHeight ?? 0)}
            onChange={value => {
              updateLineHeight(value);
              webLog('tool_lineHeight');
            }}
            inputNumber
            min={1}
            tooltipVisible={false}
          />
        </div>
      )}
    </div>
  );
}

export default observer(Typesetting);
