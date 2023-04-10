import { CSSProperties, PropsWithChildren } from 'react';

interface IProps {
  style?: CSSProperties;
}

export default function Lottie({ style }: PropsWithChildren<IProps>) {
  // console.log('Lottie data', data);

  return (
    <div
      style={{
        height: 25,
        paddingLeft: 20,
        // background: `url(${data.attribute.rt_preview_url})`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'contain',
        backgroundColor: '#aea998',
        fontSize: 12,
        ...style,
      }}
    >
      滤镜
    </div>
  );
}
