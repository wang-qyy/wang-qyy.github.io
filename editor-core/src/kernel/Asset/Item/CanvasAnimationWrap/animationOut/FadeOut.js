import React, { useMemo, memo } from 'react';

const FadeOut = ({ children, animatedTime, aniDurationTime }) => {
  const opacity = useMemo(() => {
    let ratio = animatedTime / aniDurationTime;
    if (animatedTime === 0) {
      ratio = 0;
    }
    return 1 - ratio;
  }, [animatedTime, aniDurationTime]);

  return (
    <div className="movie-animation-fadeOut" style={{ opacity }}>
      {children}
    </div>
  );
};
export default memo(FadeOut);
