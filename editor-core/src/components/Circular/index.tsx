import './index.less';
import { useState, useRef, useEffect } from 'react';
import { useThrottleFn } from "ahooks";
/**
* 计算夹角
* @param {*} x1 
* @param {*} y1 
* @param {*} x2 
* @param {*} y2 
*/
const calculateLine = (x1:number, y1:number, x2:number, y2:number) => {

    const AB = {
        x: x2 - x1,
        y: y2 - y1,
    }

    const BC = {
        x: 0,
        y: 1,
    }

    // 向量的模
    const a = Math.sqrt(Math.pow(AB.x, 2) + Math.pow(AB.y, 2));
    const b = Math.sqrt(Math.pow(BC.x, 2) + Math.pow(BC.y, 2));


    const aXb = (AB.x * BC.x) + (AB.y * BC.y);
    const cos_ab = aXb / (a * b);

    // 求出偏转角度
    let angle = Math.acos(cos_ab) * (180 / Math.PI);

    if (x1 < x2 && y1 < y2) angle = 90 - angle;
    if (x1 > x2) angle = 90 + angle;
    if (x1 < x2 && y1 > y2) angle = 450 - angle;
    if (x1 < x2 && y1 === y2) angle = 0;
    if (x1 === x2 && y1 < y2) angle = 90;
    if (x1 > x2 && y1 === y2) angle = 180;
    if (x1 === x2 && y1 > y2) angle = 270;
    return parseInt(angle);
}

export default (props) => {
    const { value, onChange, ...rest } = props || {};

    const centerDom = useRef();
    const original = useRef();
    const [angle, setAngle] = useState(0);

    /**
     * 监听value值并同步渲染
     */
    useEffect(() => {
        setAngle(value);
    }, value)

    /**
     * 按住鼠标左键移动事件，添加节流
     */
    const { run: holdMouseMove } = useThrottleFn((event) => {
        event.stopPropagation();
        let { clientX, clientY } = event;
        let { width, height, left, top } = original.current;
        let angleTemp = calculateLine(left + (width / 2), top + (height / 2), clientX, clientY);
        console.log("angle--", angleTemp);
        setAngle(angleTemp);;
        onChange && onChange(angleTemp);
    }, { wait: 100 })


    const { run: mouseUp } = useThrottleFn((event) => {
        event.stopPropagation();
        document.onmouseup = null;
        document.onmousemove = null;
    }, { wait: 100 })


    /**
     * 按下鼠标左键
     * @param {*} event 
     */
    const mousedown = (event) => {
        event.stopPropagation();
        original.current = centerDom.current.getBoundingClientRect();
        document.onmousemove = holdMouseMove;
        document.onmouseup = mouseUp;
    }

    return (<div className="snake-action-circular" {...rest}>
        <div className="snake-action-circular-vessel">
            <div className="snake-action-circular-sign"></div>
            <div className="snake-action-circular-sign"></div>
            <div className="snake-action-circular-sign"></div>
            <div className="snake-action-circular-sign"></div>
            <div className="snake-action-circular-center" ref={centerDom}></div>
            <div className="snake-action-circular-pointer" style={{ transform: `rotate(${angle}deg)` }}>
                <div className="snake-action-circular-pointer-fill">
                    <div className="snake-action-circular-clocksecond" onMouseDown={mousedown}>
                        <div className="snake-action-circular-clockarrow"></div>
                        <div className="snake-action-circular-clockhandle"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>)
}