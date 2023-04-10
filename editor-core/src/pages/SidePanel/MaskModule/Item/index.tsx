import { PropsWithChildren, useEffect, useRef } from 'react';

import Image from '@/pages/SidePanel/Upload/FileItem/Image';

import DragBox from '@/components/DragBox';
import styles from './index.less';
import { useHover } from 'ahooks';

interface ItemProps {
  data: any;
  setPreview: (data: any) => void;
  onAdd: (data: any) => void;
}

function Item({ data, setPreview, onAdd }: PropsWithChildren<ItemProps>) {
  const module = useRef(null);
  const hover = useHover(module);
  const dragAsset = {
    meta: {
      type: 'module',
    },
    attribute: {
      resId: data.id,
      rt_preview_url: data.imgUrl,
    },
  };
  useEffect(() => {
    if (hover) {
      setPreview(data)
    } else {
      setPreview(undefined)
    }
  }, [hover])
  return (
    <DragBox data={dragAsset} type="module">
      <div
        ref={module}
        // onMouseEnter={() => setPreview(data)}
        // onMouseLeave={() => setPreview(undefined)}
        className={styles.maskModuleItem}
        onClick={() => onAdd(data)}
      >
        <Image poster={data.imgUrl} />
      </div>
    </DragBox>
  );
}

export default Item;
