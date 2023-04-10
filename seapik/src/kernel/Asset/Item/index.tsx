import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import type {
  AssetClass,
  AssetItemProps,
  DefaultAssetProps,
} from '@kernel/typing';
import { useAssetAction } from '@kernel/utils/hooks';
import { isMaskType } from '@kernel/utils/assetChecker';
import { config } from '@kernel/utils/config';
import { getAssetStatus, getEditAsset } from '@/kernel/store';
import SVG from './SVG';
import Lottie from './Lottie';
import Text from './Text';
import SvgPath from './SvgPath';
import Image from './Image';
import Module from './Module';
import Mask from './Mask';
import Background from './Background';

import { useAssetStatus, useShadowStyle } from './utils';

const EmptyDom = observer(({ asset, index }: AssetItemProps) => {
  const { meta } = asset;
  const { type } = meta;
  React.useEffect(() => {
    console.log('EmptyDom', index, type, index);
  }, []);
  return <div />;
});

export function useAssetItem(asset: AssetClass, type: string) {
  return useMemo(() => {
    switch (type) {
      case 'SVG':
        return SVG;
      case 'image':
        return Image;
      case 'text':
        return Text;
      case 'svgPath':
        return SvgPath;
      case 'lottie':
        return Lottie;
      case 'module':
      case '__module':
        return Module;
      case 'mask':
        return Mask;
      default:
        return EmptyDom;
    }
  }, [type]);
}

// 某些元素不可自动卸载
const AssetItem = (props: DefaultAssetProps) => {
  const { asset, index, assetActive, isPreviewMovie, parentAsset, showOnly } =
    props;
  const {
    meta,
    attribute: { dropShadow },
  } = asset;
  // 根据模板裁剪时长，显示真实的数据

  const { type } = meta;
  const { style, assetClassName, auxiliaryBolder } = useAssetStatus(props);
  const shadowStyle = useShadowStyle(dropShadow);
  const action = useAssetAction(isMaskType(parentAsset) ? parentAsset : asset);
  const AssetDom = useAssetItem(asset, type);
  const { inMask } = getAssetStatus();
  const editAsset = getEditAsset();

  /**
   * 只有在元素全部加载完成以后，才会卸载未出现的元素，
   * 否则会出现卡loading的情况
   * showOnly 只是静态渲染，所以可以销毁不展示的元素
   */
  if (showOnly || config.hpMode) {
    return null;
  }
  if (inMask && editAsset?.meta.id === meta.id) {
    return null;
  }
  const animationProps = {
    assetClassName,
    assetStyle: style,
    isAssetActive: assetActive === index,
    ...props,
  };

  const Asset = (
    <div
      style={{
        ...style,
        position: 'static',
        transform: `translateZ(0px)`,
        opacity: 1,
        clipPath: type === 'text' || type === 'module' ? 'none' : 'inset(0px)',
      }}
      {...(isPreviewMovie || showOnly ? {} : action)}
    >
      <AssetDom {...animationProps} />
    </div>
  );

  if (showOnly) {
    return <div style={style}>{Asset}</div>;
  }

  return (
    <>
      <div
        aria-label="asset-wrap"
        style={{
          ...style,
          ...auxiliaryBolder,
          filter: `${shadowStyle}`,
          ...(meta.isBackground ? { transform: 'rotate(0)' } : {}),
        }}
      >
        {meta.isBackground ? <Background {...animationProps} /> : Asset}
      </div>
    </>
  );
};
export default observer(AssetItem);
