import React, { memo } from 'react';
import FadeIn from './FadeIn';
import MoveInto from './MoveInto';
import RubIn from './RubIn';
import ScaleEnlarge from './ScaleEnlarge';

const DomList = {
  1: MoveInto,
  2: ScaleEnlarge,
  3: FadeIn,
  4: RubIn,
};

function AniInIndex(props) {
  const { children, asset } = props;
  const { attribute } = asset;
  const enterType = attribute?.animation?.enter.baseId ?? 0;
  const CurrentDom = DomList[enterType];

  return (
    <div className="movie-animation-AniIn">
      {CurrentDom ? <CurrentDom {...props} /> : children}
    </div>
  );
}

export default memo(AniInIndex);
