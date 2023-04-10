import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';

export default observer(({ asset }: AssetItemProps) => {
  const { rt_preview_url = '', width, height } = asset.attribute;
  return (
    <div className="canvas-lottie-container" style={{ width, height }}>
      <img
        src={rt_preview_url}
        alt="lottie preview"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});
