import AssetDom from '@/pages/Designer/Sider/components/MaterialItem';

const ASSET_TYPE = 'videoE';
const Item = (Props: { item: any }) => {
  const { item } = Props;

  const attribute = {
    width: item.width,
    height: item.height,
    resId: item.id,
    rt_url: item.sample,
    rt_preview_url: item.preview,
    rt_frame_file: item.frame_file,
    rt_total_frame: item.total_frame,
    rt_total_time: item.duration,
  };
  return (
    <AssetDom
      type={ASSET_TYPE}
      attribute={attribute}
      poster={item.preview}
      src={item.sample}
    />
  );
};

export default Item;
