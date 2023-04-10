import { useMemo, CSSProperties } from 'react';
import { useCreation } from 'ahooks';
import type { AssetItemProps } from '@kernel/typing';
import { observer } from 'mobx-react';
import { useAniPathEffect } from '@/kernel/store';
import usePlayPath from './hooks';
import styles from './index.less';

const PlayPath = (props: React.PropsWithChildren<AssetItemProps>) => {
  const { asset, canvasInfo, children, assetStyle, videoStatus } = props;
  const { scale } = canvasInfo;
  const { meta, rt_style, attribute } = asset;
  const { startTime, endTime } = attribute;
  const { aniPath } = usePlayPath(props);
  const { inPathId } = useAniPathEffect();
  const visible = meta.id === inPathId ? 'hidden' : 'visible';
  const { currentTime } = videoStatus;
  const className = useMemo(() => {
    return `path-animation-${meta.type}-${meta.id}`;
  }, [meta.id, meta.type]);
  const style: CSSProperties = useCreation(() => {
    if (rt_style) {
      const { width, height, posX, posY, rotate, opacity } = rt_style;
      return {
        position: 'absolute',
        left: posX * scale,
        top: posY * scale,
        transform: `scale(${width / attribute.width},${
          height / attribute.height
        }) rotate(${rotate}deg)`,
        opacity,
      };
    }
    return {};
  }, [rt_style, scale]);
  // display: meta.id === inPathId?'none':'block'
  if (!(currentTime >= startTime && currentTime < endTime)) {
    return null;
  }
  return (
    <div className={className} style={{ ...assetStyle, ...style }}>
      {children}
    </div>
  );
};
export default observer(PlayPath);
