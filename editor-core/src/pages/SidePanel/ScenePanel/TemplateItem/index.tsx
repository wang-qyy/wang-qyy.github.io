import { memo, useRef, PropsWithChildren, useState, useEffect } from 'react';
import { Button, Checkbox } from 'antd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDrag } from 'react-dnd';

import { observer, getValidAssets } from '@hc/editor-core';
import NoTitleModal from '@/components/NoTitleModal';
import useEditorConfig from '@/hooks/useEditorConfig';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { TEMPLATE_DRAG } from '@/constants/drag';
import { formatNumberToTime } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';

import { useCollect } from '../hooks';
import type { TemplateListItem } from '../typing';
import './index.less';

export interface TemplateItemProps {
  data: TemplateListItem;
  className?: string;
  width?: number | undefined;
  type?: 'all' | 'collection';
  setUpdateTime?: (date: any) => void;
}

type TriggerType = 'click' | 'drag';
type DropContainerType = 'bottom' | 'canvas';

const TemplateItem = ({
  data,
  className = '',
  width = 150,
  type,
  setUpdateTime,
  ...res
}: PropsWithChildren<TemplateItemProps>) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const modulePartForAdd = useEditorConfig('modulePartForAdd');
  const [replacePart, setReplacePart] = useState(false);
  const { beMyFav, insertTemplate, handleReplace } = useCollect();

  const [action, setAction] =
    useState<{ trigger: TriggerType; dropContainer?: DropContainerType }>();

  function beforeInsertTemplate(
    trigger: TriggerType,
    dropContainer?: DropContainerType,
  ) {
    if (getValidAssets().length === 0) {
      // 空模板直接插入，不需要提示
      handleReplace(data);

      // 数据埋点
      clickActionWeblog(
        // eslint-disable-next-line no-nested-ternary
        trigger === 'click'
          ? 'action_template_replace' // 点击添加
          : dropContainer === 'canvas'
          ? 'drag_replace_001' // 拖拽到画布
          : 'drag_replace_002', // 拖拽到片段
        {
          action_label: 'part',
        },
      );
    } else {
      if (modulePartForAdd.getConfig()) {
        insertTemplate(data);
        clickActionWeblog(
          // eslint-disable-next-line no-nested-ternary
          trigger === 'click'
            ? 'action_template_insert' // 点击添加
            : dropContainer === 'canvas'
            ? 'drag_add_001' // 拖拽到画布
            : 'drag_add_002', // 拖拽到片段
          {
            action_label: 'part',
          },
        );
      } else {
        setAction({ trigger, dropContainer });
        setReplacePart(true);
      }
    }
  }
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: TEMPLATE_DRAG,
    item: {
      attribute: {
        width: data.width,
        height: data.height,
        rt_preview_url: data.preview_url,
      },
      offset: {
        offsetLeft: 0,
        offsetTop: 0,
        offsetLeftPercent: 0,
        offsetTopPercent: 0,
      },
      replace: (dropContainer: 'bottom' | 'canvas') => {
        beforeInsertTemplate('drag', dropContainer);
      },
      add: () => {
        insertTemplate(data);
      },
    },
    collect: monitor => {
      return {
        isDragging: !!monitor.isDragging(),
      };
    },
  }));
  useEffect(() => {
    // 隐藏默认的拖拽样式
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  return (
    <div
      ref={templateRef}
      className={`template-item-wrap ${className}`}
      style={{
        width,
        height: width * (Number(data.height) / Number(data.width)),
        opacity: !collected.isDragging ? 1 : 0,
      }}
      {...res}
    >
      {/* <Lazyload
        scrollContainer=".os-viewport"
        scroll
        throttle={200}
        offset={100}
      > */}
      <div
        ref={drag}
        className="video-container"
        onClick={() => beforeInsertTemplate('click')}
      >
        <div className="module-time">
          {formatNumberToTime(parseInt(`${Number(data.duration) / 1000}`, 10))}
        </div>
        <AutoDestroyVideo
          poster={data.preview_url}
          src={data.small_url}
          clip={[data.position, data.position + data.duration]}
          muted
        />
      </div>
      {/* </Lazyload> */}
      <NoTitleModal
        visible={replacePart}
        footer={null}
        width={360}
        centered
        onCancel={() => {
          setReplacePart(false);
          modulePartForAdd.setState(false);
        }}
      >
        <div className="replace-template-module">
          <h3>将片段添加为新页面？</h3>
          <div className="replace-button-box">
            <Button
              onClick={() => {
                modulePartForAdd.setConfig();
                handleReplace(data);
                setReplacePart(false);
                // 数据埋点
                clickActionWeblog(
                  // eslint-disable-next-line no-nested-ternary
                  action?.trigger === 'click'
                    ? 'action_template_replace' // 点击添加
                    : action?.dropContainer === 'canvas'
                    ? 'drag_replace_001' // 拖拽到画布
                    : 'drag_replace_002', // 拖拽到片段
                  {
                    action_label: 'part',
                  },
                );
              }}
            >
              替换当前页面
            </Button>
            <Button
              type="primary"
              onClick={() => {
                modulePartForAdd.setConfig();
                insertTemplate(data);
                setReplacePart(false);

                clickActionWeblog(
                  // eslint-disable-next-line no-nested-ternary
                  action?.trigger === 'click'
                    ? 'action_template_insert' // 点击添加
                    : action?.dropContainer === 'canvas'
                    ? 'drag_add_001' // 拖拽到画布
                    : 'drag_add_002', // 拖拽到片段
                  {
                    action_label: 'part',
                  },
                );
              }}
            >
              添加为新页面
            </Button>
          </div>
          <Checkbox
            value={modulePartForAdd.state}
            onChange={e => {
              modulePartForAdd.setState(e.target.checked);
            }}
          >
            默认添加为新页面，不再提醒。
          </Checkbox>
        </div>
      </NoTitleModal>
    </div>
  );
};
export default observer(TemplateItem);
