import { AssetClass, observer } from '@hc/editor-core';
import { CSSProperties } from 'react';

import styles from './index.modules.less';

function Image({ data, style }: { data: AssetClass; style: CSSProperties }) {
  return (
    <div className={styles['image-wrap']} style={style}>
      <img src={data.attribute.picUrl || data.attribute.SVGUrl} alt="" />
    </div>
  );
}

export default observer(Image);
