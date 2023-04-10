import { CSSProperties, PropsWithChildren, useEffect } from 'react';
import type { AssetClass } from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';

import styles from './index.modules.less';

export default function Text({
  data,
  style,
}: PropsWithChildren<{
  data: AssetClass;
  style?: CSSProperties;
}>) {
  return (
    <div className={styles['text-wrap']} style={style}>
      <XiuIcon type="iconwenzi1" />
      <span className={styles.text}>{data.attribute.text.join(' ')}</span>
    </div>
  );
}
