import { DRAG_ACCEPT_TYPE, MUSIC_DRAG } from '@/constants/drag';
import { Attribute, getCanvasInfo } from '@/kernel';
import { getCanvasClientRect } from '@/kernel/utils/single';
import { RGBAToString } from '@/utils/single';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import './index.less'

function Music({ src }: { src: string }) {
    return (
        <div className='bottom-layer-music'><div className='inner'></div></div>
    );
}

const layerStyles: CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 9999,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
};
function BottomDragLayerWrap() {
    const { itemType, isDragging, item, initialOffset, currentOffset } =
        useDragLayer(monitor => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
        }));
    const getItemStyles: CSSProperties = useMemo(() => {
        if (!initialOffset || !currentOffset || !item) {
            return {
                display: 'block',
            };
        }
        const { x, y } = currentOffset;
        const transform = `translate(${x}px,${y}px)`;
        return {
            transform,
            WebkitTransform: transform,
        };
    }, [currentOffset])
    return (
        <>
            {isDragging ? (
                <div style={{ ...layerStyles, }}>
                    <div style={getItemStyles}>
                        <Music data={item} />
                    </div>
                </div>
            ) : null}
        </>
    );
}
export function BottomDragLayer() {
    const { itemType, item } =
        useDragLayer(monitor => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
        }));
    if (MUSIC_DRAG !== itemType) {
        return null;
    }
    return <BottomDragLayerWrap />
}