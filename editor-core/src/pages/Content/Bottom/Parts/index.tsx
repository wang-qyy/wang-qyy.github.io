import { PropsWithChildren, useState, useEffect, MouseEvent } from 'react';

import classNames from 'classnames';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import {
  useGetAllTemplateByObserver,
  getTemplateTimeScale,
  getTemplateIndexById,
  observer,
  setCurrentTime,
  pauseVideo,
  toJS,
} from '@hc/editor-core';
import { videoPartWebLog } from '@/utils/webLog';
import Add from '../Add';

import Item from './Item';

import './index.less';

interface PartsProps {
  className?: string;
  setClipStatus: any;
  clipStatus: any;
}

function Parts(props: PropsWithChildren<PartsProps>) {
  const { className, setClipStatus, clipStatus } = props;
  const [isDragging, setIsDragging] = useState<any>();

  const { templates: allTemplates, rearrange } = useGetAllTemplateByObserver();

  const templates = [...allTemplates];

  const [clipingStyle, setClipingStyle] = useState({});

  function handleSetClipingStyle(
    justifyContent: 'start' | 'end',
    fixedWidth: boolean,
  ) {
    const width = document
      .querySelector('.parts')
      ?.getBoundingClientRect().width;

    const style = { justifyContent };

    if (fixedWidth) {
      Object.assign(style, { width });
    }

    setClipingStyle(style);
  }

  useEffect(() => {
    if (!clipStatus) {
      setClipingStyle({});
    }
  }, [clipStatus]);

  // 拖拽结束
  function onDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const { index: dragIndex } = source;
    const { index: dropIndex } = destination;

    let target = dropIndex;
    if (dragIndex < dropIndex) {
      target -= 1;
    }
    if (target < 0) {
      target = 0;
    }

    rearrange(dragIndex, dropIndex);
    setTimeout(() => {
      setCurrentTime(
        getTemplateTimeScale()[getTemplateIndexById(Number(draggableId))][0],
        false,
      );
    }, 10);
    // 埋点
    videoPartWebLog('changePosition');

    setIsDragging(undefined);
  }

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={(start, provided) => {
        setIsDragging(start);
        pauseVideo();
      }}
    >
      <div className="parts-wrap" id="bottom-parts-wrap">
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided: any, snapshot: any) => {
            return (
              <div
                ref={provided.innerRef}
                className={classNames('parts', className, {
                  'part-draging': isDragging,
                })}
                style={{
                  ...clipingStyle,
                }}
                {...provided.droppableProps}
              >
                {templates.map((item, index) => (
                  <Item
                    key={`part-${item.id}`}
                    data={item}
                    index={index}
                    dragging={isDragging}
                    isLast={index === templates.length - 1}
                    setClipStatus={setClipStatus}
                    clipStatus={clipStatus}
                    handleSetClipingStyle={handleSetClipingStyle}
                  />
                ))}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </div>
      <Add />
    </DragDropContext>
  );
}

export default observer(Parts);
