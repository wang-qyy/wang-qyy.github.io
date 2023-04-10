import React from 'react';
import { observer } from 'mobx-react';
import { useAssetsSelect } from '@kernel/Canvas/MultiSelect/hooks';

function AssetHighlight() {
  const style = useAssetsSelect();
  /**
   * @description
   * 1：获取选中的所有元素
   * 2：根据选中元素绘制出组框，需要考虑到单个元素的旋转，根据旋转点计算出边框范围
   * 3：展示时，子元素分离，并可点击。
   * 4：取消选中，将样式分发子元素
   * 5：选中元素的旋转，需要调研是否配合坐标和圆中心点位移
   * 6：合并组是否需要同步运动，还是每个元素根据组元素移动位置平移
   * 7：鼠标框选，框选中的元素，需要附着选中边框
   */

  return (
    <div className="hc-asset-multiSelect hc-maxIndex-box">
      {style.map((item, index) => (
        <div key={`${index}-${Date.now()}`} style={item} />
      ))}
    </div>
  );
}

export default observer(AssetHighlight);
