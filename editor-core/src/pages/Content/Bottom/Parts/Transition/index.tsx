import { useRef, MouseEvent, useState, useEffect } from 'react';
import { useClickAway } from 'ahooks';
import {
  AssetClass,
  observer,
  removeMGTransfer,
  getTemplateTimeScale,
  setCurrentTime,
  getCurrentTemplate,
  useGetAllTemplateByObserver,
} from '@hc/editor-core';
import { Dropdown, Menu, message, Tooltip } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import {
  usePartModal,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';
import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import {
  setActiveTemplate,
  useAddEmptyTemplate,
} from '@/utils/templateHandler';

import classNames from 'classnames';
import { TEMPLATE_MIN_DURATION_TRANSFER } from '@/config/basicVariable';
import styles from './index.modules.less';

function Transition({
  data,
  templateIndex,
}: {
  data: AssetClass;
  templateIndex: number;
}) {
  const { endTransfer } = getCurrentTemplate();
  const transferRef = useRef(null);
  const { changePartModal } = usePartModal();
  const { hasEmpty, addTemplate } = useAddEmptyTemplate();
  const { open: openSettingPanelInfo } = useSettingPanelInfo();
  const { templates } = useGetAllTemplateByObserver();

  const [selecting, setSelecting] = useState(false);

  const {
    templateInfo: { canvasInfo },
  } = useTemplateInfo();

  function handleOpenTransitionList(e: MouseEvent) {
    stopPropagation(e);
    clickActionWeblog(`transition_add`);
    // 选中当前片段
    setActiveTemplate(templateIndex);
    // 目前只有横版转场
    // if (canvasInfo.width <= canvasInfo.height) {
    //   message.info('转场视频目前仅支持16:9比例视频');

    //   return;
    // }

    setCurrentTime(getTemplateTimeScale()[templateIndex][0], false);

    openSettingPanelInfo('video-transition', {
      templateIndex,
      transitionId: data?.meta.id,
      resId: data?.attribute.resId,
    });
  }

  const menu = (
    <Menu
      onMouseDown={stopPropagation}
      onClick={({ key, domEvent }) => {
        clickActionWeblog(`transition_${key}`);

        switch (key) {
          case 'delete':
            removeMGTransfer(templateIndex, data.meta.id);
            break;
          case 'replace':
            handleOpenTransitionList(domEvent);
            break;
        }
      }}
    >
      <Menu.Item key="delete">删除转场</Menu.Item>
      <Menu.Item key="replace">替换转场</Menu.Item>
    </Menu>
  );

  useClickAway(() => {
    setSelecting(false);
  }, [transferRef.current]);
  useEffect(() => {
    setSelecting(false);
  }, [data]);
  return (
    <div className={styles.partTransition} ref={transferRef}>
      <div style={{ position: 'relative' }}>
        {selecting ? (
          <>
            <Tooltip
              overlayClassName={styles['add-tooltip']}
              title="添加空白片段"
              getTooltipContainer={ele => ele}
            >
              <div
                className={styles['transfer-opt-item']}
                onMouseDown={e => {
                  stopPropagation(e);
                  clickActionWeblog('template_insert');
                  if (hasEmpty) {
                    message.info('已存在一个空白模板');
                  } else {
                    changePartModal({
                      visible: true,
                      currentIndex: templateIndex + 1,
                    });
                  }
                }}
              >
                <XiuIcon type="iconxingzhuangjiehe6" className={styles.icon} />
              </div>
            </Tooltip>
            <Tooltip
              title={data ? '替换转场' : '添加转场'}
              getTooltipContainer={ele => ele}
            >
              {/* <Dropdown
                overlayClassName={styles['cover-dropdown']}
                placement="topCenter"
                overlay={menu}
                disabled={!data}
              > */}
              <div
                className={styles['transfer-opt-item']}
                onMouseDown={e => {
                  stopPropagation(e);
                  if (
                    templates[templateIndex]?.videoInfo.allAnimationTime <
                      TEMPLATE_MIN_DURATION_TRANSFER ||
                    templates[templateIndex + 1]?.videoInfo.allAnimationTime <
                      TEMPLATE_MIN_DURATION_TRANSFER
                  ) {
                    message.info(
                      `时长少于${(
                        TEMPLATE_MIN_DURATION_TRANSFER / 1000
                      ).toFixed(1)}s的片段不能设置转场`,
                    );
                    return;
                  }
                  // if (!data) {
                  handleOpenTransitionList(e);
                  // }
                }}
              >
                <XiuIcon type="iconzhuanchang2" className={styles.icon} />
              </div>
              {/* </Dropdown> */}
            </Tooltip>
          </>
        ) : (
          <div
            className={styles.wrap}
            onMouseDown={e => {
              stopPropagation(e);
              setSelecting(true);
            }}
            // onMouseDown={handleOpenTransitionList}
          >
            {data ? (
              <XiuIcon
                type="iconzhuanchang2"
                className={classNames(styles.icon, {
                  [styles.iconChoosed]: data && data?.id === endTransfer?.id,
                })}
              />
            ) : (
              <XiuIcon type="iconxingzhuangjiehe6" className={styles.icon} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default observer(Transition);
