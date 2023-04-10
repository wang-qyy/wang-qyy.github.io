import { XiuIcon } from "@/components";
import { useTimeAxisScale } from "@/store/adapter/useGlobalStatus";
import {
    observer, useAllTemplateVideoTimeByObserver
} from '@hc/editor-core';
import { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { XYCoord, useDragLayer } from "react-dnd";
import '../index.less';
interface BottomDragProps {
    hover: boolean,
    position: XYCoord|null
}
const BottomDrag = (props: PropsWithChildren<BottomDragProps>) => {
    const [allTemplateTime] = useAllTemplateVideoTimeByObserver();
    const { value: timeAxisScale, } = useTimeAxisScale();
    const { hover } = props;
    const bottom = useRef({});
    const bottomPart = useRef({});
    const { currentOffset, monitor, item, initOffset } =
        useDragLayer(monitor => ({
            currentOffset: monitor.getClientOffset(),
            initOffset: monitor.getInitialClientOffset(),
            item: monitor.getItem(),
            monitor: monitor,
        }));
    useEffect(() => {
        if (document.getElementById('xiudodo-bottom')) {
            bottom.current = document.getElementById('xiudodo-bottom')?.getBoundingClientRect();
        }
    }, [])
    useEffect(() => {
        if (document.getElementById("bottom-parts-wrap")) {
            bottomPart.current = document.getElementById('bottom-parts-wrap')?.getBoundingClientRect();
        }
    }, [allTemplateTime, timeAxisScale])
    const positionLeft = useMemo(() => {
        if (item?.mousePosition) {
            let left = currentOffset?.x - bottom.current.x - (initOffset?.x - item?.mousePosition.x);
            let bottomScoll = bottomPart.current.x - bottom.current.x;
            left = Math.max(left, bottomScoll);
            left = Math.min(left, bottomScoll + bottomPart.current.width);
            return left
        }
    }, [bottomPart.current, bottom.current, currentOffset])
    return (
        <>
            {/* 拖拽蒙版样式 */}
            {
                (hover) && <div className='xiudodo-bottom-drag'>
                    <div className='drag-icon'>
                        <XiuIcon type='iconyinle' />
                    </div>
                    <div>你可以放手啦！</div>
                    <div
                        className="red"
                        style={{ left: positionLeft }}
                    />
                    {props.children}
                </div>
            }
        </>
    )
}
export default observer(BottomDrag);