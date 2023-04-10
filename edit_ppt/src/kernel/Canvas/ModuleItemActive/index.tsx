import React from 'react';
import { observer } from 'mobx-react';
import { useAssetsSelect } from '@kernel/Canvas/ModuleItemActive/hooks';

function AssetHighlight() {
  const style = useAssetsSelect();
  return (
    <div className="hc-asset-multiSelect hc-maxIndex-box">
      <div style={style} />
    </div>
  );
}

export default observer(AssetHighlight);
