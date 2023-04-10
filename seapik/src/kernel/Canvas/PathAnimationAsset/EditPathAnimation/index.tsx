import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { observer } from 'mobx-react';
import './index.less';
import Dot from '@/kernel/Canvas/EditPathAnimation/Dot';
import classNames from 'classnames';
import { Asset, CanvasInfo } from '@/kernel/typing';
import { restorePointsRelativeCanvas } from '@/kernel/utils/pathAnimation';
import {
  getAssetCenterPoint,
  getCenterPointFromSize,
} from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { useUpdateEffect } from 'ahooks';
import { useUpdateAssetStayEffect } from '@/kernel/store';
import { getAngle } from '@/kernel/utils/single';
import NodeChange from '../NodeChange';

function calcPointStyle(
  center: { x: number; y: number },
  left: number,
  top: number,
  scale: number,
) {
  return {
    left: left * scale,
    top: top * scale,
  };
}
const EditPathNode = (props: {
  editAsset: Asset;
  canvasInfo: CanvasInfo;
  calcSvgSize: any;
  flag: boolean;
}) => {
  const { calcSvgSize, editAsset, canvasInfo } = props;
  const centerPoint = getAssetCenterPoint(editAsset);

  const [flag, setFlag] = useState(false);
  const [type, setType] = useState('line');
  const { updatePoints } = useUpdateAssetStayEffect();
  const [furtherArray, setFurtherArray] = useState([]);
  // 容器的位置
  const boxPosition = useRef({ left: 0, top: 0 });
  const limitInfo = useRef({});
  /**
   * 完成
   */
  const finish = () => {
    const svgSize = calcSvgSize();
    if (svgSize) {
      const setSize = {
        width: svgSize.width,
        height: svgSize.height,
        left: svgSize.x,
        top: svgSize.y,
      };
      updatePoints(furtherArray, type, setSize);
    }
  };
  const onUp = () => {
    setFlag(false);
  };

  const changeNode = (
    position: { left: number; top: number },
    index: number,
    flag: number,
  ) => {
    position.left /= canvasInfo.scale;
    position.top /= canvasInfo.scale;
    const list = [...furtherArray];
    const target = [...list[index]];
    if (index == 0 && flag === 2) {
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
    if (flag == 0) {
      const x = 2 * target[2] - position.left;
      const y = 2 * target[3] - position.top;
      target[4] = x;
      target[5] = y;
    }
    // 右控制点修改
    if (flag == 4) {
      const x = 2 * target[2] - position.left;
      const y = 2 * target[3] - position.top;
      target[0] = x;
      target[1] = y;
    }
    // 第一个节点位置为图层位置，此处不可修改

    target[flag] = position.left;
    target[flag + 1] = position.top;

    list[index] = target;
    setFlag(true);
    setFurtherArray(list);
    finish();
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
  }, [canvasInfo.scale]);
  useUpdateEffect(() => {}, []);
  useEffect(() => {
    if (editAsset?.attribute?.stayEffect?.graph && !flag) {
      const { points, freePathType } = editAsset?.attribute?.stayEffect?.graph;
      const { attribute, transform } = editAsset;
      // 获取图层的中心点坐标
      const center = getCenterPointFromSize(
        { x: transform?.posX, y: transform.posY },
        { width: attribute.width, height: attribute.height },
        false,
      );
      // 恢复相对于画布的位置信息
      const list = restorePointsRelativeCanvas(points, center.x, center.y);
      setFurtherArray(list);
      setType(freePathType);
    }
  }, [
    editAsset?.attribute?.stayEffect?.graph?.points,
    editAsset?.transform?.posX,
    editAsset?.transform?.posY,
  ]);
  return (
    <>
      {furtherArray.map((item, index) => {
        let ratate = 0;
        if (index === furtherArray.length - 1) {
          ratate =
            180 -
            getAngle(
              item[2] - furtherArray[index - 1][2],
              item[3] - furtherArray[index - 1][3],
            );
        }
        return (
          <React.Fragment key={index}>
            {/* {type === 'bessel' && (
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
                onUp={onUp}
              />
            )} */}
            <div
              className={
                index === furtherArray.length - 1 ? 'node-last' : 'node'
              }
              style={{
                ...calcPointStyle(
                  centerPoint,
                  item[2] - 17,
                  item[3] - 17,
                  canvasInfo.scale,
                ),
                transform: `rotate(${ratate}deg)`,
              }}
            />
            {/* {type === 'bessel' && (
              <NodeChange
                asset={editAsset}
                points={furtherArray}
                canvasInfo={canvasInfo}
                index={index}
              />
            )}
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
                onUp={onUp}
              />
            )} */}
          </React.Fragment>
        );
      })}
    </>
  );
};
export default observer(EditPathNode);
