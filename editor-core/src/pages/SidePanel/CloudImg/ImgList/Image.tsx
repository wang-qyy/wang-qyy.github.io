import { PropsWithChildren } from 'react';
import DragBox from '@/components/DragBox';
import { ElementWrap } from '@/CommonModule/ElementActions';

import './index.less';

interface DataItem {
  id: string;
  title: string;
  height: number;
  width: number;
  host: string;
  sample: string;
  isFav: boolean;
  source_width: number;
  source_height: number;
  sample_big: number;
}

interface ItemProps {
  data: DataItem;
}

const Item = ({ data }: PropsWithChildren<ItemProps>) => {
  const dragAsset = {
    meta: {
      type: 'pic',
    },
    attribute: {
      width: data.width,
      height: data.height,
      resId: data.id,
      picUrl: data.host + data.sample_big,
      rt_preview_url: data.host + data.sample,
    },
  };
  return (
    <DragBox data={dragAsset} type="image">
      <ElementWrap
        data={dragAsset.attribute}
        type="image"
        style={{
          width: 150,
          height: 86,
          backgroundColor: '#e3e7eb',
        }}
      />
    </DragBox>
  );
};
export default Item;
