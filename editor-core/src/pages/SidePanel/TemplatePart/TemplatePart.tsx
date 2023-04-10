import { useEffect } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';

import styles from '@/pages/SidePanel/TemplatePart/index.modules.less';
import { formatNumberToTime } from '@/utils/single';
import {
  getTemplateTimeScale,
  addTemplate,
  setCurrentTime,
  observer,
  RawTemplateData,
} from '@hc/editor-core';
import { useDrag } from 'react-dnd';
import { TEMPLATE_DRAG } from '@/constants/drag';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';

export interface TemplatePartProps {
  data: RawTemplateData;
  clip?: [number, number];
  onClick: (action: {
    trigger: 'click' | 'drag';
    dropContainer?: 'bottom' | 'canvas';
  }) => void;
}

function TemplatePart({ data, onClick, clip }: TemplatePartProps) {
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: TEMPLATE_DRAG,
    item: {
      attribute: {
        ...data.canvas,
        rt_preview_url: data.poster,
      },
      offset: {
        offsetLeft: 0,
        offsetTop: 0,
        offsetLeftPercent: 0,
        offsetTopPercent: 0,
      },
      replace: (dropContainer: 'bottom' | 'canvas') =>
        onClick({ trigger: 'drag', dropContainer }),
      add: () => {
        const index = addTemplate([data]);
        setTimeout(() => {
          setCurrentTime(index ? getTemplateTimeScale()[index][0] : 0, false);
        });
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
      ref={drag}
      className={styles.poster}
      onClick={() => {
        onClick({ trigger: 'click' });
      }}
      style={{
        opacity: !collected.isDragging ? 1 : 0,
      }}
    >
      {!collected.isDragging && data.poster && (
        <AutoDestroyVideo
          poster={data.poster}
          clip={clip}
          src={data.small_url}
        />
      )}
      <div className={styles.duration}>
        {formatNumberToTime(
          parseInt(`${data.pageAttr.pageInfo.pageTime / 1000}`, 10),
        )}
      </div>
    </div>
  );
}

export default observer(TemplatePart);
