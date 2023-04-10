import { useMemo, CSSProperties } from 'react';
import { useCreation } from 'ahooks';
import type { AssetItemProps } from '@kernel/typing';
import { observer } from 'mobx-react';
import useWhirl from './hooks';

const WhirlAnimation = (props: React.PropsWithChildren<AssetItemProps>) => {
  const { asset, children, assetStyle, canvasInfo } = props;
  const { meta, rt_style } = asset;
  const { scale } = canvasInfo;
  const {} = useWhirl(props);
  const className = useMemo(() => {
    return `whirl-animation-${meta.type}-${meta.id}`;
  }, [meta.id, meta.type]);
  const style: CSSProperties = useCreation(() => {
    if (rt_style) {
      const { width, height, posX, posY, rotate, opacity } = rt_style;
      return {
        position: 'absolute',
        left: posX * scale,
        top: posY * scale,
        transform: `rotate(${rotate}deg)`,
        opacity,
      };
    }
    return {};
  }, [rt_style, scale]);
  return (
    <div className={className} style={{ ...assetStyle, ...style }}>
      {children}
    </div>
  );
};
export default observer(WhirlAnimation);
