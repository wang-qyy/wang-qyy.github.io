import { useRef, MouseEvent } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { getAllTemplates, pauseVideo } from '@hc/editor-core';
import classNames from 'classnames';

import { clickActionWeblog } from '@/utils/webLog';
import { useDrop } from 'react-dnd';
import { TEMPLATE_DRAG } from '@/constants/drag';
import { stopPropagation } from '@/utils/single';
import { usePartModal } from '@/store/adapter/useGlobalStatus';

export default function Add() {
  const iconRef = useRef<HTMLDivElement>(null);
  const { changePartModal } = usePartModal();
  const [collectedProps, drop] = useDrop(() => ({
    accept: TEMPLATE_DRAG,
    collect: monitor => ({
      hover: !!monitor.isOver() && !!monitor.canDrop(),
    }),
    drop: (item: any) => {
      item?.add();
    },
  }));
  // 添加空模板
  const handleAddVideo = (e: MouseEvent<HTMLDivElement>) => {
    stopPropagation(e);
    pauseVideo();

    // 埋点
    clickActionWeblog('bottom_t_add_last');
    const index = getAllTemplates().length;
    changePartModal({ currentIndex: index, visible: true });
  };

  return (
    <Tooltip title="添加片段" placement="top">
      <div
        className={classNames('xiudodo-bottom-add', {
          'drag-hover': collectedProps.hover,
        })}
        onMouseDown={handleAddVideo}
        ref={drop}
      >
        <div className="xiudodo-bottom-add-icon" ref={iconRef}>
          <PlusOutlined />
        </div>
      </div>
    </Tooltip>
  );
}
