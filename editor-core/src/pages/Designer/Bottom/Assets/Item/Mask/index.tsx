import { Asset } from '@hc/editor-core';
import Image from '../Image';
import VideoE from '../VideoE';

export default function Mask({ data }: { data: Asset }) {
  const asset = data.assets?.[0];

  const type = asset?.meta.type;

  switch (type) {
    case 'videoE':
      return <VideoE data={asset} />;
    case 'image':
    case 'pic':
      return <Image data={asset} />;
    default:
      return <Image data={data} />;
  }
}
