import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import './index.less';
import { useAnimationStyle } from './hooks';
import useStayEffectStyle from '../StayEffect/hooks';

export default observer((props: React.PropsWithChildren<AssetItemProps>) => {
  const { children } = props;
  const { animationStyle, containerStyle } = useAnimationStyle({ ...props });
  // 停留特效
  const { style } = useStayEffectStyle(props);
  return (
    <div
      className="movie-assets-animation-container"
      style={{ ...containerStyle, ...style.calcStyle }}
    >
      <div style={{ ...style?.styleScale, ...animationStyle }}>{children}</div>
    </div>
  );
});
// 旧版
// export default observer((props: React.PropsWithChildren<AssetItemProps>) => {
//   const { children, videoStatus } = props;
//   const { animationStyle, containerStyle } = useAnimationStyle(props);
//   return (
//     <div className="movie-assets-animation-container" style={containerStyle}>
//       <div style={animationStyle}>{children}</div>
//     </div>
//   );
// });
