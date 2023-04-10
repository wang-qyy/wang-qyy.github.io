import { observer } from '@hc/editor-core';
import AssetDom from '@/pages/Designer/Sider/components/MaterialItem';

import DragBox from '@/components/DragBox';

const ASSET_TYPE = 'pic';
const Item = (Props: { item: any }) => {
  const { item } = Props;

  const attribute = {
    width: item.width,
    height: item.height,
    resId: item.id,
    picUrl: item.preview,
    rt_preview_url: item.preview,
  };

  return (
    <DragBox
      data={{
        meta: { type: ASSET_TYPE },
        attribute,
      }}
      type={ASSET_TYPE}
      style={{ width: '100%', height: '100%' }}
    >
      <AssetDom
        type={ASSET_TYPE}
        src={item.preview}
        attribute={{
          width: item.width,
          height: item.height,
          resId: item.id,
          picUrl: item.preview,
          rt_preview_url: item.preview,
        }}
      />
    </DragBox>
  );
};

export default observer(Item);
