import React from 'react';
import { AssetItemProps } from '@kernel/typing';
import SpecialEffeffectsText from '@kernel/Asset/Item/Text/components/specialEffeffectsText';
import { observer } from 'mobx-react';
import OriginText from './components/originText';
import LogoText from './components/logoText';

const Text = (props: AssetItemProps) => {
  const { asset, canvasInfo, isPreviewMovie } = props;

  if (asset.meta.isLogo) {
    return (
      <LogoText
        asset={asset}
        canvasInfo={canvasInfo}
        isPreviewMovie={isPreviewMovie}
      />
    );
  }
  return <OriginText {...props} />;
  // if (asset?.attribute?.effectColorful) {
  //   return (
  //     <SpecialEffeffectsText
  //       asset={asset}
  //       canvasInfo={canvasInfo}
  //       isPreviewMovie={isPreviewMovie}
  //     />
  //   );
  // }
  // return <OriginText {...props} />;
};
export default observer(Text);
