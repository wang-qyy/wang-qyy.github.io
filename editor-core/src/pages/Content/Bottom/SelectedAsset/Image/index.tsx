import { useMemo } from 'react';

import './index.less';

export default function Image({ src }: { src: string | undefined }) {
  return useMemo(() => {
    return (
      <div
        className="selected-asset-image"
        style={{
          background: `url(${src}) 15px center / auto 14px no-repeat`,
        }}
      />
    );
  }, [src]);
}
