import React, { useMemo, memo } from 'react';

const FadeIn = ({ children, animatedTime, aniDurationTime }) => {
  const opacity = useMemo(() => {
    let ratio = animatedTime / aniDurationTime;
    if (animatedTime === 0) {
      ratio = 0;
    }
    return ratio;
  }, [animatedTime, aniDurationTime]);

  return (
    <div className="movie-animation-fadeIn" style={{ opacity }}>
      {children}
    </div>
  );
};
export default memo(FadeIn);
