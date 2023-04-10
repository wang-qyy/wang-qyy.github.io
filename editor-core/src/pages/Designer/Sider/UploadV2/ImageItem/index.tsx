import AssetDom from '@/pages/Designer/Sider/components/MaterialItem';

export default function ImageItem({
  data,
  className,
}: {
  data: any;
  className: string;
}) {
  return (
    <div className={className}>
      <AssetDom
        type="image"
        attribute={{
          resId: data.id,
          width: data.width,
          height: data.height,
          picUrl: data.big_preview,
          rt_preview_url: data.preview,
        }}
        src={data.preview}
      />
    </div>
  );
}
