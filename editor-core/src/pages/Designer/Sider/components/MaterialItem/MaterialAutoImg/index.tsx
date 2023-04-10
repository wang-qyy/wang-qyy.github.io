import { PropsWithChildren, useState } from 'react';

import './index.less';

interface AutoImgMap {
  src: string;
  className?: string;
}
const MaterialAutoImg = (props: PropsWithChildren<AutoImgMap>) => {
  const { src, className } = props;

  const [imageStyle, setImageStyle] = useState({
    width: '100%',
    height: 'auto',
  });

  const finish = e => {
    const { clientHeight, clientWidth } = e.target;
    if (clientHeight > clientWidth) {
      setImageStyle({
        width: 'auto',
        height: '100%',
      });
    } else {
      setImageStyle({
        width: '100%',
        height: 'auto',
      });
    }
  };

  return (
    <div
      className="back"
      style={{
        width: '100%',
        height: '100%',
        // background: `url(${src}) center center / contain no-repeat`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `url(${src}) center center / contain no-repeat`,
        }}
      />
    </div>
    // <img
    //   className={className}
    //   style={imageStyle}
    //   src={src}
    //   alt=""
    //   onLoad={finish}
    // />
  );
};
export default MaterialAutoImg;
