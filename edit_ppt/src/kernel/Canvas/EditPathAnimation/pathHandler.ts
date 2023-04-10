import { useState, useRef, useEffect } from 'react';
import Raphael from 'raphael';
import {
  polyline2path,
  polyline2Curve,
  polyline2pathNode,
} from '@/kernel/utils/pathAnimation';
import { CanvasInfo } from '@/kernel/typing';
/**
 *
 * @param pointList 一维的点位数组
 * @param pointListTwo 二维的点位数组
 * @param changePointList 改变点位数据
 */
export const pathHandler = (
  pointList: number[][],
  canvasInfo: CanvasInfo,
  type,
  uniqId: 'string',
) => {
  const pathAttr = {
    stroke: '#464161',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 3,
    'stroke-dasharray': '.',
  };
  const nodePathAttr = {
    stroke: '#464161',
    'stroke-width': 1,
  };
  // 画布变量
  const raphaelBox = useRef(null);
  // 画布变量
  const currentSvgPath = useRef();

  // 移动点的path节点
  const [moveList, setMoveList] = useState([]);
  /**
   * 更新路径信息
   * @param pointList  点位节点
   * @param currentNodList  当前移动中的节点
   * @returns
   */
  const updatePath = (
    list: number[][],
    currentNodList: number[] = [],
    lineType: string = type,
  ) => {
    if (raphaelBox.current && currentSvgPath.current) {
      const nodelist = list.concat([currentNodList]);
      let setPath = '';
      // 贝塞尔曲线
      if (lineType == 'bessel') {
        setPath = polyline2Curve(nodelist, canvasInfo.scale);
      } else {
        setPath = polyline2path(nodelist, canvasInfo.scale);
      }
      // 更新路径信息
      currentSvgPath.current.attr({
        path: setPath,
      });
      return setPath;
    }
  };
  const initPath = (list: number[][], lineType: string = type) => {
    if (raphaelBox.current) {
      raphaelBox.current.clear();
      let setPath = '';
      // 贝塞尔曲线
      if (lineType == 'bessel') {
        updateMovePath(list, -1);
        setPath = polyline2Curve(list, canvasInfo.scale);
      } else {
        setPath = polyline2path(list, canvasInfo.scale);
      }
      currentSvgPath.current = raphaelBox.current.path(setPath).attr(pathAttr);
    }
  };
  const updateMovePath = (list: number[][], index = -1) => {
    const pointList = JSON.parse(JSON.stringify(list));
    if (raphaelBox.current) {
      if (index != -1 && moveList[index]) {
        const setPath = polyline2pathNode(pointList[index], canvasInfo.scale);
        // 更新路径信息
        moveList[index].attr({
          path: setPath,
        });
      } else {
        clearMovePath();
        const nodelist = [];
        pointList.forEach((element) => {
          const node = raphaelBox.current
            .path(polyline2pathNode(element, canvasInfo.scale))
            .attr(nodePathAttr);
          nodelist.push(node);
        });
        setMoveList(nodelist);
      }
    }
  };
  /**
   * 清空移动线
   */
  const clearMovePath = () => {
    if (raphaelBox.current) {
      moveList.forEach((element) => {
        element.remove();
      });
      setMoveList([]);
    }
  };

  useEffect(() => {
    if (!raphaelBox.current) {
      raphaelBox.current = Raphael(uniqId, canvasInfo.width, canvasInfo.height);
    }
    if (raphaelBox.current) {
      raphaelBox.current.clear();
      initPath(pointList, type);
    }
  }, []);
  return {
    currentSvgPath: currentSvgPath.current,
    updatePath,
    updateMovePath,
    clearMovePath,
    initPath,
  };
};
