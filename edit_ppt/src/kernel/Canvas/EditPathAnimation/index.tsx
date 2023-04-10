import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useKeyPress, useThrottleFn } from 'ahooks';
import './index.less';
import { stopPropagation } from '@/kernel/utils/single';
import { FreePathType } from '@/kernel/typing';
import { restorePointsRelativeCanvas } from '@/kernel/utils/pathAnimation';
import {
  getAssetCenterPoint,
  getCenterPointFromSize,
} from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { Button } from 'antd';
import { getEditAsset } from '@/kernel/storeAPI';
import {
  getCanvasInfo,
  useAniPathEffect,
  useUpdateAssetStayEffect,
} from '@/kernel/store';
import usePathAnimationStyle from './hooks';
import Dot from './Dot';
import { pathHandler } from './pathHandler';

function calcPointStyle(left: number, top: number, scale: number) {
  return {
    left: left * scale,
    top: top * scale,
  };
}
const EditPath = observer(() => {
  const editAsset = getEditAsset();
  const canvasInfo = getCanvasInfo();
  const [type, setType] = useState('line');
  // 参考点位置
  const { getCenterPoint } = usePathAnimationStyle(editAsset, canvasInfo);
  const { left: originLeft, top: originTop } = getCenterPoint();
  const { updatePoints } = useUpdateAssetStayEffect();
  const [furtherArray, setFurtherArray] = useState([
    [originLeft, originTop, originLeft, originTop, originLeft, originTop],
  ]);
  const {
    updatePath,
    updateMovePath,
    initPath,
    clearMovePath,
    currentSvgPath,
  } = pathHandler(
    JSON.parse(JSON.stringify(furtherArray)),
    canvasInfo,
    type,
    'animationPathEdit',
  );
  // 路径动画的状态 -1: 为处于使用路径动画 0:正在绘制路径点 1:编辑路径点
  const { inAniPath, changStatue } = useAniPathEffect();
  const currentNode = useRef([]);
  const animationEdit = useRef(null);
  // 鼠标按下时的位置信息
  const domnPosition = useRef({});
  // 容器的位置
  const boxPosition = useRef({ left: 0, top: 0 });
  const limitInfo = useRef({});
  /**
   * 结束画路径
   */
  const stopPaint = () => {
    changStatue(1);
    updatePath(furtherArray, [], type);
  };
  /**
   * 完成
   */
  const finish = () => {
    if (currentSvgPath && editAsset) {
      changStatue(-1);
      const size = currentSvgPath.node.getBoundingClientRect();
      const centerPoint = getAssetCenterPoint(editAsset);
      const svgSize = {
        width: size.width / canvasInfo.scale,
        height: size.height / canvasInfo.scale,
        left:
          (size.left - boxPosition.current.left) / canvasInfo.scale -
          centerPoint.x,
        top:
          (size.top - boxPosition.current.top) / canvasInfo.scale -
          centerPoint.y,
      };
      updatePoints(furtherArray, type, svgSize);
    }
  };
  /**
   * 按下鼠标左键
   * @param {*} event
   */
  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const { clientX, clientY } = event;
    // 记录下鼠标按下时的位置
    domnPosition.current = { left: clientX, top: clientY };
  };
  /**
   * 在画布上面打点
   * @param {*} event
   * @returns
   */
  const getMousePos = (event: MouseEvent<HTMLDivElement>) => {
    if (inAniPath === 0 && boxPosition.current) {
      const e = event || window.event;
      const { clientX, clientY } = e;
      const moveLeft = (clientX - boxPosition.current?.left) / canvasInfo.scale;
      const moveTop = (clientY - boxPosition.current?.top) / canvasInfo.scale;
      const further = [moveLeft, moveTop, moveLeft, moveTop, moveLeft, moveTop];
      const dots = [...furtherArray, further];
      setFurtherArray(dots);
    }
  };
  /**
   * 鼠标移动事件，添加节流
   */
  const { run: mouseMove } = useThrottleFn(
    (event) => {
      if (inAniPath == 0) {
        const { clientX, clientY } = event;
        const { left, top } = boxPosition.current;
        const moveLeft = (clientX - left) / canvasInfo.scale;
        const moveTop = (clientY - top) / canvasInfo.scale;
        const coordinate = [
          moveLeft,
          moveTop,
          moveLeft,
          moveTop,
          moveLeft,
          moveTop,
        ];
        currentNode.current = coordinate;
        updatePath(furtherArray, coordinate, type);
      }
    },
    { wait: 100 },
  );

  const changeNode = (
    position: { left: number; top: number },
    index: number,
    flag: number,
  ) => {
    position.left /= canvasInfo.scale;
    position.top /= canvasInfo.scale;
    const list = [...furtherArray];
    const target = [...list[index]];
    if (index === 0 && flag === 2) {
      // 首节点的位置信息，不能修改
      return;
    }
    // 改变的是位置节点
    // 位置点修改
    if (flag === 2) {
      const diff1 = target[flag] - target[0];
      const diff2 = target[flag + 1] - target[1];
      target[0] = position.left - diff1;
      target[1] = position.top - diff2;

      const diff3 = target[flag] - target[4];
      const diff4 = target[flag + 1] - target[5];
      target[4] = position.left - diff3;
      target[5] = position.top - diff4;
    }
    // 左控制点修改
    if (flag === 0) {
      const x = 2 * target[2] - position.left;
      const y = 2 * target[3] - position.top;
      target[4] = x;
      target[5] = y;
    }
    // 右控制点修改
    if (flag === 4) {
      const x = 2 * target[2] - position.left;
      const y = 2 * target[3] - position.top;
      target[0] = x;
      target[1] = y;
    }
    // 第一个节点位置为图层位置，此处不可修改

    target[flag] = position.left;
    target[flag + 1] = position.top;

    list[index] = target;
    setFurtherArray(list);
    // 改变移动节点path
    updateMovePath(list, index);
    // 更改动画路径
    updatePath(list, [], type);
  };
  // 切换类型
  const changeType = (val: FreePathType) => {
    setType(val);
    updatePath(furtherArray, [], val);
    clearMovePath();
    if (val === 'bessel') {
      updateMovePath(furtherArray, -1);
    }
  };
  useEffect(() => {
    const dom = document.getElementById('HC-CORE-EDITOR-CANVAS');
    const { left, top } = dom?.getBoundingClientRect();
    boxPosition.current = {
      left,
      top,
    };
    limitInfo.current = {
      dot: {
        width: 10,
        height: 10,
      },
      kuang: {
        left,
        top,
        width: canvasInfo.width,
        height: canvasInfo.height,
      },
    };
    // 更改动画路径
    updatePath(furtherArray, [], type);
    if (type === 'bessel') {
      // 改变移动节点path
      updateMovePath(furtherArray, -1);
    }
  }, [canvasInfo.scale]);
  useEffect(() => {
    if (inAniPath === 0) {
      document.onmousemove = mouseMove;
    } else {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }, [inAniPath]);
  useEffect(() => {
    if (editAsset?.attribute?.stayEffect?.graph) {
      const { points, freePathType } = editAsset?.attribute?.stayEffect?.graph;
      const { attribute, transform } = editAsset;
      // 获取图层的中心点坐标
      const center = getCenterPointFromSize(
        { x: transform?.posX, y: transform.posY },
        { width: attribute.width, height: attribute.height },
        false,
      );
      changStatue(1);
      // 恢复相对于画布的位置信息
      const list = restorePointsRelativeCanvas(points, center.x, center.y);
      setFurtherArray(list);
      setType(freePathType);
      initPath(list, freePathType);
    }
  }, [editAsset?.attribute?.stayEffect, inAniPath]);
  // 监听键盘 Escape按钮
  useKeyPress(['Escape'], (event) => {
    event.preventDefault();
    stopPaint();
  });
  return (
    <div
      className="edit-path-animation"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <div className="edit-path-buttons">
        <Button onClick={finish}>完成</Button>
        <Button
          className={type !== 'bessel' ? 'edit-path-buttons-choosed' : ''}
          onClick={() => {
            changeType('line');
          }}
        >
          直线
        </Button>
        <Button
          className={type === 'bessel' ? 'edit-path-buttons-choosed' : ''}
          onClick={() => {
            changeType('bessel');
          }}
        >
          曲线
        </Button>
      </div>
      <div
        className="edit-path-box"
        onMouseDown={onMouseDown}
        onClick={getMousePos}
      >
        {inAniPath === 1 &&
          furtherArray.map((item, index) => {
            return (
              <React.Fragment key={index}>
                {type === 'bessel' && (
                  <Dot
                    className="node-left"
                    style={{
                      ...calcPointStyle(
                        item[0] - 10,
                        item[1] - 10,
                        canvasInfo.scale,
                      ),
                    }}
                    limitInfo={limitInfo.current}
                    change={(val: { left: number; top: number }) => {
                      changeNode(val, index, 0);
                    }}
                  />
                )}
                <Dot
                  className="node-center"
                  style={{
                    ...calcPointStyle(
                      item[2] - 15,
                      item[3] - 15,
                      canvasInfo.scale,
                    ),
                  }}
                  limitInfo={limitInfo.current}
                  change={(val: { left: number; top: number }) => {
                    changeNode(val, index, 2);
                  }}
                />
                {type === 'bessel' && (
                  <Dot
                    className="node-right"
                    limitInfo={limitInfo.current}
                    style={{
                      ...calcPointStyle(
                        item[4] - 10,
                        item[5] - 10,
                        canvasInfo.scale,
                      ),
                    }}
                    change={(val: { left: number; top: number }) => {
                      changeNode(val, index, 4);
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        <div id="animationPathEdit" ref={animationEdit.current} />
      </div>
    </div>
  );
});
const EditPathAnimation = () => {
  const editAsset = getEditAsset();
  // 绘制状态
  const { inAniPath } = useAniPathEffect();
  if (!editAsset || inAniPath === -1 || inAniPath === 2) {
    return null;
  }
  return <EditPath />;
};
export default observer(EditPathAnimation);
