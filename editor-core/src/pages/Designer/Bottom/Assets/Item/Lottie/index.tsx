import { AssetClass } from '@hc/editor-core';
import { CSSProperties, PropsWithChildren } from 'react';

interface LottieProps {
  data: AssetClass;
  style?: CSSProperties;
}

export default function Lottie({
  data,
  style,
}: PropsWithChildren<LottieProps>) {
  // console.log('Lottie data', data);

  return (
    <div
      style={{
        height: 25,
        paddingLeft: 20,
        background: `url(${data.attribute.rt_preview_url})`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'contain',
        backgroundColor: '#aea998',
        ...style,
      }}
    />
  );
}
