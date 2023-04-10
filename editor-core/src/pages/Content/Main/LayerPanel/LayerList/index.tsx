import { PropsWithChildren } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateAssetZIndex, observer, toJS, AssetClass } from '@hc/editor-core';
import { sortBy } from 'lodash-es';
import { layerWeblog } from '@/utils/webLog';
import LayerItemDrag from './itemMain';

interface LayerListProps {
  assets: AssetClass[];
  className?: string;
}

const LayerList = ({
  assets,
  className,
}: PropsWithChildren<LayerListProps>) => {
  const assetsList = sortBy([...assets], o => -o.transform.zindex);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (destination && source) {
      // 原位置
      const sourceIndex = source.index;
      // 现位置
      const destinationIndex = destination.index;
      const dragItem = assetsList[sourceIndex];
      const targetItem = assetsList[destinationIndex];
      layerWeblog('LayerModal_05', {
        action_label: dragItem.meta.type,
      });
      // 组内元素与组外元素交换层级 不予处理
      if (dragItem.parent?.id === targetItem.parent?.id) {
        const oldZIndex = dragItem.transform.zindex;
        const newZIndex = targetItem.transform.zindex;
        // todo 方法调用异常
        updateAssetZIndex({
          direction: oldZIndex > newZIndex ? 'down' : 'up',
          zindex: newZIndex,
          asset: dragItem,
        });
      }
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={className}
          >
            {assetsList.map((item, index) => (
              <Draggable
                key={item.meta.id}
                draggableId={`${item.meta.id}`}
                index={index}
                isDragDisabled={item.meta.isBackground}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <LayerItemDrag data={item} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
export default observer(LayerList);
