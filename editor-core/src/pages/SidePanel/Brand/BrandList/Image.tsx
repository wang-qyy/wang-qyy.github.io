import { PropsWithChildren } from 'react';
import DragBox from '@/components/DragBox';
import { ElementWrap } from '@/CommonModule/ElementActions';

import './index.less';

interface DataItem {
  id: string;
  title: string;
  height: number;
  width: number;
  cover_path: string;
  small_cover_path: string;
  file_format: string;
}

interface ItemProps {
  data: { fileURL: string; file_id: string; id: string; logoInfo: DataItem };
}

const Item = ({ data }: PropsWithChildren<ItemProps>) => {
  const ids = { resId: `f${data.file_id}`, ufsId: `f${data.id}` };
  const dragAsset = {
    meta: {
      type: 'pic',
    },

    attribute: {
      ...ids,
      width: data?.logoInfo.width,
      height: data?.logoInfo.height,
      picUrl: data?.logoInfo.cover_path,
      rt_preview_url: data?.logoInfo.small_cover_path,
      source_key: data?.logoInfo.small_cover_path,
      isUser: true,
    },
  };
  return (
    <DragBox data={dragAsset} type="image">
      <ElementWrap
        data={dragAsset.attribute}
        type={data.logoInfo?.file_format === 'svg' ? 'SVG' : 'image'}
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
