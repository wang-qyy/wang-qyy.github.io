import { Asset, CanvasInfo } from '@/kernel/typing';

import useNodePath from './hook';
import './index.less';

const NodeChange = (props: {
  asset: Asset;
  canvasInfo: CanvasInfo;
  index: number;
  points: number[][];
}) => {
  const { asset, points, canvasInfo, index } = props;
  const { item } = useNodePath(points, canvasInfo, index);
  if (!points[index]) {
    return;
  }
  return (
    <div
      className="line"
      style={{
        left: points[index][0] * canvasInfo.scale,
        top: points[index][1] * canvasInfo.scale,
        width: item?.width,
        position: 'absolute',
        zIndex: 3,
        transform: `rotate(${item?.angle}deg)`,
      }}
    />
  );
};
export default NodeChange;
