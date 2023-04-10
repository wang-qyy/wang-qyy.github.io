import { observer } from 'mobx-react';
import { Tabs } from 'antd';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

import {
  getCurrentAsset,
  getCurrentTemplate,
  updateAssetZIndex,
} from '@/kernel';

import { useEffect, useState } from 'react';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';
import MediaItem from './MediaItem';
import TextItem from './TextItem';
import conciseModeStore from '../store';
import { getVisibleAssets } from '../utils';

const TabTitle = ({ count, text }: { count: number; text: string }) => (
  <>
    <span className={styles.count}>{count} </span>
    <span className={styles.text}>{text}</span>
  </>
);

const Assets = () => {
  const { mediaList, textList } = getVisibleAssets();
  const { activeIndex } = conciseModeStore;
  const [activeKey, _activeKey] = useState('media');
  const [isDrag, _isDrag] = useState(false);
  const currentAsset = getCurrentAsset();
  const currentTemplate = getCurrentTemplate();

  useEffect(() => {
    if (!currentAsset) return;
    const { type } = currentAsset.meta;
    if (type === 'text') {
      _activeKey('text');
    } else {
      _activeKey('media');
    }
  }, [currentAsset]);

  useEffect(() => {
    if (!mediaList.length) {
      _activeKey('text');
    }
  }, [currentTemplate]);

  const onDragEnd = (result: DropResult) => {
    _isDrag(false);

    const { source, destination } = result;

    if (destination && source) {
      // 原位置
      const sourceIndex = source.index;
      // 现位置
      const destinationIndex = destination.index;
      const dragItem = mediaList[sourceIndex];
      const targetItem = mediaList[destinationIndex];

      // 组内元素与组外元素交换层级 不予处理
      if (dragItem.rt_parentAssetId === targetItem.rt_parentAssetId) {
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

    clickActionWeblog('concise11');
  };

  return (
    <div className={styles.Assets}>
      <div className={styles.title}>
        片段{activeIndex < 9 ? 0 : ''}
        {activeIndex + 1} 可替换信息
      </div>
      <Tabs activeKey={activeKey} onChange={_activeKey}>
        <Tabs.TabPane
          tab={<TabTitle count={mediaList.length} text=" 处素材" />}
          key="media"
        >
          <div className={styles.assetList}>
            {mediaList.map(item => (
              <MediaItem isDrag={isDrag} key={item.meta.id} asset={item} />
            ))}
          </div>

          {/* <DragDropContext
            onDragEnd={onDragEnd}
            onDragStart={() => {
              _isDrag(true);
            }}
          >
            <Droppable droppableId="droppable">
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.assetList}
                >
                  {mediaList.map((item, index) => (
                    <Draggable
                      key={item.meta.id}
                      draggableId={`${item.meta.id}`}
                      index={index}
                      isDragDisabled={item.meta.isBackground}
                    >
                      {provided_c => (
                        <div
                          ref={provided_c.innerRef}
                          {...provided_c.draggableProps}
                          {...provided_c.dragHandleProps}
                          style={provided_c.draggableProps.style}
                        >
                          <MediaItem isDrag={isDrag} asset={item} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext> */}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={<TabTitle count={textList.length} text=" 处文字" />}
          key="text"
        >
          <div className={styles.assetList}>
            {textList.map(item => (
              <TextItem asset={item} key={item.id} />
            ))}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default observer(Assets);
