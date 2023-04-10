import { useState } from 'react';

const defaultImage = {
  background: `url(//js.xiudodo.com/xiudodo-editor/image/logo/logo.png) center center / 50% no-repeat`,
};

const Image = ({ poster }: { poster: string }) => {
  const [isLoad, setIsLoad] = useState(false);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(isLoad ? {} : defaultImage),
      }}
    >
      <img
        src={poster}
        alt="img"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        onLoad={e => setIsLoad(true)}
      />
    </div>
  );
};

export default Image;
