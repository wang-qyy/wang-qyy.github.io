import { AssetClass, toJS } from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';
import { useMemo } from 'react';
import styles from './index.modules.less';

interface GroupProps {
  data: AssetClass;
}
export default function Group({ data }: GroupProps) {
  // console.log('Group data', toJS(data));

  const content = useMemo(() => {
    const text = data?.assets?.find(item => item.meta.type === 'text');
    // console.log(toJS(text));
    return text?.attribute.text;
  }, [data?.assets]);

  return (
    <div className={styles.wrap}>
      <XiuIcon type="iconqunzu" style={{ color: '#fff' }} />
      {content && <span className={styles.text}>{content.join(' ')}</span>}
    </div>
  );
}
