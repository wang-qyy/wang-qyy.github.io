import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import { useAnimationStyle } from './utils';

function CustomAnimation(props: React.PropsWithChildren<AssetItemProps>) {
  const { asset, children, assetStyle } = props;
  const { meta, id } = asset;
  const { style } = useAnimationStyle(props);
  const className = useMemo(() => {
    return `custom-animation-${meta.type}-${id}`;
  }, [id, meta.type]);

  const containerStyle = useMemo(() => {
    if (style.overflow) {
      return {
        ...assetStyle,
        overflow: style.overflow,
      };
    }
    return {
      ...assetStyle,
    };
  }, [style.overflow, assetStyle]);

  return (
    <div style={containerStyle} aria-label="Custom Animation">
      <div className={className} style={style}>
        {children}
      </div>
    </div>
  );
}

export default observer(CustomAnimation);
