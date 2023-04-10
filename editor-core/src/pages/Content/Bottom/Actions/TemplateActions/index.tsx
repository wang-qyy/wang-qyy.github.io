import { useState, useEffect, useRef } from 'react';
import { message, InputNumber, Input, Button } from 'antd';

import {
  getCurrentTemplateIndex,
  useCurrentTemplate,
  useTemplateClip,
  useAllTemplateVideoTimeByObserver,
  observer,
} from '@hc/editor-core';

import { clickActionWeblog, dataAcquisition, ActionType } from '@/utils/webLog';
import { stopPropagation } from '@/utils/single';

import { useVideoSplit } from '@/pages/Content/Main/Split';

import {
  useDeleteTemplate,
  useCopyTemplate,
  useAddEmptyTemplate,
} from '@/utils/templateHandler';

import {
  templateTotalDurationLimit,
  TIME_OUT_TIP,
  TEMPLATE_MIN_DURATION,
  TEMPLATE_MIN_DURATION_TRANSFER,
} from '@/config/basicVariable';
import { usePartModal, useTimelineMode } from '@/store/adapter/useGlobalStatus';
import { formatTime } from '../../handler';

import Item from '../Item';

import styles from './index.modules.less';

function TemplateActions() {
  const { template } = useCurrentTemplate();
  const { canSplit, canSplitTransfer, handleSplit } = useVideoSplit();
  const [value, update] = useTemplateClip(getCurrentTemplateIndex());

  const { allAnimationTimeBySpeed, speed = 1 } = template?.videoInfo || {};

  const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();
  const { setTimeLinePartKey } = useTimelineMode();

  const { changePartModal } = usePartModal();

  const [pageTime, setPageTime] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const { delete: deleteTemplate } = useDeleteTemplate();
  const { disabled: disableCopy, copy: copyTemplate } =
    useCopyTemplate(template);
  const { disabled: disabledAddEmpty } = useAddEmptyTemplate();

  useEffect(() => {
    setPageTime(allAnimationTimeBySpeed);
  }, [allAnimationTimeBySpeed]);

  // 复制场景
  const handleCopy = () => {
    dataAcquisition(ActionType.sce_copy);
    copyTemplate();
  };

  // 删除场景
  const handleDelete = () => {
    dataAcquisition(ActionType.sce_del);
    deleteTemplate();
  };

  // 添加空模板
  const handleAddVideo = () => {
    // const { changePartModal } = usePartModal();
    // addEmptyTemplate(getCurrentTemplateIndex() + 1);
    changePartModal({
      visible: true,
      currentIndex: getCurrentTemplateIndex() + 1,
    });
    // 埋点
    clickActionWeblog('bottom_template_add');
  };

  // 设置模板时长
  function handleDuration(time?: number) {
    clickActionWeblog('tool_template_set_pageTime');

    const [cs, ce] = value || [0, 0];

    const change = ((time ?? pageTime) - allAnimationTimeBySpeed) / (1 / speed);

    update([cs, ce - change]);
  }

  function formatInputTime(inputValue?: string | number) {
    const time = String(inputValue).split(':');

    console.log('formatInputTime', time);

    let m;
    let s;
    if (time.length === 2) {
      [m, s] = time;
    } else if (time.length === 1) {
      [s] = time;
    }

    if (m === undefined) {
      m = 0;
    } else {
      m = parseFloat(m);
    }

    if (s !== undefined) {
      s = parseFloat(s);
    }

    if (m >= 0 && s) {
      let inputTime = m * 60000 + s * 1000;

      const max =
        templateTotalDurationLimit -
        allTemplateVideoTime +
        allAnimationTimeBySpeed;

      if (max < inputTime) {
        inputTime = max;
        message.info(TIME_OUT_TIP);
      }
      if (pageTime < 1000) {
        inputTime = 1000;
      }

      return inputTime;
    }

    return allAnimationTimeBySpeed;
  }

  function handleInput(inputValue: string | number) {
    setPageTime(formatInputTime(inputValue));
  }

  const actions = [
    {
      key: 'addTemplate',
      name: '添加片段',
      icon: 'icontianjia',
      disabled: disabledAddEmpty,
      onClick: () => handleAddVideo(),
    },
    {
      id: 'xiudodo-video-split',
      key: 'split',
      name: '分割',
      tooltip: '分割片段',
      icon: 'iconfenge',
      disabled: !canSplit || !canSplitTransfer,
      onClick: () => {
        if (!canSplit) {
          message.info(
            `片段分割最短不能小于${(TEMPLATE_MIN_DURATION / 1000).toFixed(1)}s`,
          );
          return;
        }
        if (!canSplitTransfer) {
          message.info(
            `转场的片段分割最短不能小于${(
              TEMPLATE_MIN_DURATION_TRANSFER / 1000
            ).toFixed(1)}s`,
          );
          return;
        }
        handleSplit();
      },
      iconStyle: { fontSize: 18 },
    },
    {
      key: 'copy',
      // name: '复制',
      tooltip: '复制片段',
      icon: 'icona-Frame6',
      disabled: disableCopy,
      onClick: handleCopy,
    },
    {
      key: 'delete',
      // name: '删除',
      tooltip: '删除片段',
      icon: 'iconicons8_trash',
      // disabled: disableDelete,
      onClick: handleDelete,
      iconStyle: { fontSize: 20 },
    },
    {
      key: 'pageTime',
      tooltip: '片段时长调整',
      name: formatTime(allAnimationTimeBySpeed),
      icon: 'icontime',
      popoverContent({ onClose }: any) {
        return (
          <div style={{ padding: '8px 10px', display: 'flex' }}>
            <Input.Group compact>
              <span
                className={styles.action}
                onClick={() => handleInput((pageTime - 1000) / 1000)}
              >
                -
              </span>
              <InputNumber
                ref={inputRef}
                autoFocus
                onFocus={e => {
                  e.target.select();
                }}
                value={formatTime(pageTime)}
                className={styles['input-number']}
                onKeyDown={e => {
                  stopPropagation(e);

                  if (e.code === 'Enter') {
                    handleDuration(formatInputTime(e.target.value));
                    onClose();
                  }
                }}
                onBlur={value => handleInput(value.target.value)}
                onPaste={stopPropagation}
              />
              <span
                className={styles.action}
                onClick={() => handleInput((pageTime + 1000) / 1000)}
              >
                +
              </span>
            </Input.Group>
            <Button
              type="primary"
              size="small"
              style={{ marginLeft: 6, height: 30 }}
              onClick={() => {
                handleDuration();
                onClose();
              }}
            >
              确定
            </Button>
          </div>
        );
      },
    },
    {
      key: 'timeline',
      name: '时间线',
      tooltip: '时间线',
      icon: 'iconshipinfenge',
      isBeta: true,
      disabled: !template,
      onClick: () => {
        setTimeLinePartKey(template.id);
        clickActionWeblog('Timeline1');
      },
      iconStyle: { fontSize: 20 },
    },
  ];

  return (
    <>
      {actions.map(item => (
        <Item key={`templateActions-${item.key}`} item={item} />
      ))}
    </>
  );
}

export default observer(TemplateActions);
