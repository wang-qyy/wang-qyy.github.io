import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';

export default observer(({ asset, canvasInfo }: AssetItemProps) => {
  const { width, height } = asset.attribute;
  const { scale } = canvasInfo;
  const style = {
    width: width * scale,
    height: height * scale,
  };

  return <div className="assetGrounp" style={style} />;
});
