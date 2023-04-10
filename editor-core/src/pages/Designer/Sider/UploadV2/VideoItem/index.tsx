import { PropsWithChildren } from 'react';
import AssetDom from '@/pages/Designer/Sider/components/MaterialItem';

export default function VideoItem({
  data,
  className,
  isBackground,
}: PropsWithChildren<{
  data: any;
  className: string;
  isBackground?: boolean;
}>) {
  return (
    <div className={className}>
      <AssetDom
        isBackground={isBackground}
        defaultBackground
        type="videoE"
        attribute={{
          resId: data.id,
          width: data.width,
          height: data.height,
          rt_url: data.sample,
          rt_total_frame: data.total_frame,
          rt_total_time: data.duration,
          rt_preview_url: data.preview,
          rt_frame_file: data.frame_file,
        }}
        poster={data.preview}
        src={data.sample}
      />
    </div>
  );
}
