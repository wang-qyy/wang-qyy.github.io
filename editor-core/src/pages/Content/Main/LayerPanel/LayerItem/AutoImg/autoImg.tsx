import { useState } from 'react';

interface AutoImgMap {
  src: string;
  className: string;
}
const AutoImg = (props: AutoImgMap) => {
  const { src = '', className } = props;

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
    <div className={className}>
      <img style={imageStyle} src={src} alt="" onLoad={finish} />
    </div>
  );
};
export default AutoImg;
