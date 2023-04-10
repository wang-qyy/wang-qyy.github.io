import type { AssetItemProps } from '@kernel/typing';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import useStayEffectStyle from './hooks';

const StayEffect = (props: React.PropsWithChildren<AssetItemProps>) => {
  const { children, asset, assetStyle } = props;
  const { meta } = asset;
  const { style } = useStayEffectStyle(props);
  const className = useMemo(() => {
    return `stay-animation-${meta.type}-${meta.id}`;
  }, [meta.id, meta.type]);
  return (
    <div className={className} style={{ ...assetStyle, ...style }}>
      {children}
    </div>
  );
};
export default observer(StayEffect);
