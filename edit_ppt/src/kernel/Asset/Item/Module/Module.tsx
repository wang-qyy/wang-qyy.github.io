import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import { AssetIndex } from '@kernel/typing';
import { useModuleStyle } from '@kernel/Asset/Item/Module/hooks';
import AssetItem from '@kernel/Asset/Item';

function calcIndex(assetIndex: AssetIndex, index: number) {
  if (typeof assetIndex === 'number') {
    return [assetIndex, index];
  }
  return [...assetIndex, index];
}

const Module = observer((props: AssetItemProps) => {
  const { asset, index, showOnly } = props;
  const { assets } = asset;
  const style = useModuleStyle(props);
  return (
    <div className="asset-module">
      <div style={style}>
        {assets?.map((item, i) => {
          return (
            <AssetItem
              {...props}
              asset={item}
              parentAsset={asset}
              index={calcIndex(index, i)}
              key={`module-${item.meta.id}`}
              previewAll={showOnly}
            />
          );
        })}
      </div>
    </div>
  );
});
export default Module;
