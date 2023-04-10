import { useEffect, useState } from 'react';
import { observer, BGA_ID_List, setBgAnimation } from '@hc/editor-core';
import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import { message } from 'antd';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';
import Item from './Item';

const ColorBackground = () => {
  const { backgroundAsset } = useBackgroundSet();

  const [active, setActive] = useState(0);
  function onSetBgAnimation(id: number) {
    setBgAnimation(id);

    clickActionWeblog(id === 0 ? 'background_007' : 'background_006');

    // message.config({
    //   top: 100,
    //   duration: 1,
    //   maxCount: 1,
    // });
    message.success({
      content: '设置成功',
      top: 100,
      duration: 1,
      maxCount: 1,
    });
    setActive(id);
  }

  useEffect(() => {
    const num = backgroundAsset?.attribute?.bgAnimation?.id
      ? backgroundAsset?.attribute?.bgAnimation?.id
      : 0;
    setActive(num);
  }, [backgroundAsset?.attribute?.bgAnimation?.id]);

  return (
    <div className={styles.listWarp}>
      <div className={styles.content}>
        <Item bgaId={0} onClick={onSetBgAnimation} active={active} />
        {BGA_ID_List?.map(item => (
          <Item
            key={item}
            bgaId={item}
            active={active}
            onClick={onSetBgAnimation}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(ColorBackground);
