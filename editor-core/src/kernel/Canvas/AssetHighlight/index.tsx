import React from 'react';
import { observer } from 'mobx-react';
import { useAssetHighlight } from '@kernel/Canvas/AssetHighlight/hooks';

function AssetHighlight() {
  const style = useAssetHighlight();
  return (
    <div className="hc-asset-highlight hc-maxIndex-box">
      {style.map((item, index) => (
        <div key={`${index}-${Date.now()}`} style={item} />
      ))}
    </div>
  );
}

export default observer(AssetHighlight);
