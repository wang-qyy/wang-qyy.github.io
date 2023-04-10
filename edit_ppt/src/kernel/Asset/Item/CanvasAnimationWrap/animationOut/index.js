import React, { memo } from 'react';
import FadeOut from './FadeOut';
import MoveOut from './MoveOut';
import RubOut from './RubOut';
import ScaleReduce from './ScaleReduce';

const DomList = {
  1: MoveOut,
  2: ScaleReduce,
  3: FadeOut,
  4: RubOut,
};

function AniOutIndex(props) {
  const { children, asset } = props;
  const { attribute } = asset;
  const enterType = attribute?.animation?.exit.baseId ?? 0;
  const CurrentDom = DomList[enterType];

  return (
    <div className="movie-animation-AniOut">
      {CurrentDom ? <CurrentDom {...props} /> : children}
    </div>
  );
}

export default memo(AniOutIndex);
