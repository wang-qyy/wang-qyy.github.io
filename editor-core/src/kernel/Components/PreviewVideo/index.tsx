import { observer } from 'mobx-react';
import React, { CSSProperties } from 'react';
import { VideoStatus } from '@kernel/typing';
import { assetIdPrefix } from '@/kernel/utils/const';
import { useStaticVideoPreview } from './hooks';

export interface PreviewVideoProps {
  videoUrl: string;
  videoStatus: VideoStatus;
  cst?: number;
  cet?: number;
  style?: CSSProperties;
  isWebm?: boolean;
  isLoop?: boolean;
  totalFrame: number;
  id: number;
}

const PreviewVideo = observer((props: PreviewVideoProps) => {
  const src = useStaticVideoPreview(props);

  return (
    <img
      alt="Preview"
      crossOrigin="anonymous"
      src={src}
      style={{ width: '100%', height: '100%' }}
      data-asset-id={`${assetIdPrefix}${props.id}`}
    />
  );
});
export default PreviewVideo;
