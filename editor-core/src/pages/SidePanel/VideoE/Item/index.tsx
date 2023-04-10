import { CSSProperties, PropsWithChildren } from 'react';

import { ElementWrap } from '@/CommonModule/ElementActions';

import DragBox from '@/components/DragBox';

import styles from './index.modules.less';

interface ItemProps {
  data: any;
  onClick?: () => void;
  style?: CSSProperties;
}

function Item({ data }: PropsWithChildren<ItemProps>) {
  const dragAsset = {
    meta: {
      type: 'videoE',
    },
    attribute: {
      resId: data.id,
      rt_total_time: data.duration,
      width: data.width,
      height: data.height,
      rt_frame_url: data.frame_file,
      rt_total_frame: data.total_frame,
      rt_url: data.sample,
      rt_preview_url: data.preview,
    },
  };
  return (
    <DragBox data={dragAsset} type="videoE">
      <ElementWrap
        data={dragAsset.attribute}
        type="videoE"
        className={styles.wrap}
      />
    </DragBox>
  );
}

export default Item;
