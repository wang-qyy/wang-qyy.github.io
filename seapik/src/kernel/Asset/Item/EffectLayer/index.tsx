import { observer } from 'mobx-react';
import { DefaultAssetProps } from '@/kernel/typing';
import PreviewVideo from '@kernel/Components/PreviewVideo';

import EffectItem from './EffectItem';

const EffectLayer: React.FC<DefaultAssetProps> = (props) => {
  const { asset, showOnly, videoStatus, videoInfo, children } = props;
  const {
    assetDuration: { startTime, endTime },
    attribute: { effectInfo = {}, picUrl, rt_url },
    meta: { overlayType },
  } = asset;
  const { rt_total_frame } = asset.attribute;
  const { currentTime, playStatus } = videoStatus;
  const maskUrl = picUrl || rt_url;

  // TODO: 可能还需要其他条件判断，不太确定
  const showEffect = currentTime >= startTime && currentTime <= endTime;

  const renderMask = () => {
    if (!maskUrl || overlayType !== 'video') return null;
    if (showOnly) {
      return (
        <PreviewVideo
          isWebm
          totalFrame={rt_total_frame}
          isLoop
          videoUrl={maskUrl}
          videoStatus={videoStatus}
          id={asset.id}
        />
      );
    }
    return <></>;
  };

  return (
    <EffectItem
      showEffect={showEffect}
      effectInfo={effectInfo}
      maskUrl={maskUrl}
      resType={overlayType}
      maskNode={renderMask()}
    >
      {children}
    </EffectItem>
  );
};

export default observer(EffectLayer);
