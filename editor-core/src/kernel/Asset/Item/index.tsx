import React, { useMemo, memo } from 'react';
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
import VideoMp4 from './VideoMp4';
import Lottie from './Lottie';
import VideoE from './VideoE';
import Group from './Group';
import Text from './Text';
import SvgPath from './SvgPath';
import QrCodeItem from './QrCodeItem';
import Image from './Image';
import Module from './Module';
import Mask from './Mask';
import CustomAnimation from './CustomAnimation';
import CanvasAnimationWrap from './CanvasAnimationWrap';
import { useAssetStatus, useShadowStyle } from './utils';
import Lllegal from './Lllegal';

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
    let AssetDom = EmptyDom;
    switch (type) {
      case 'video':
        if (asset.attribute.rt_url === '' && asset.meta.isTransfer) {
          break;
        }
        if (asset.attribute.rt_url === '') {
          AssetDom = Lllegal;
          break;
        }
        AssetDom = VideoMp4;
        break;
      case 'videoE':
        if (asset.attribute.rt_url === '' && asset.meta.isTransfer) {
          break;
        }
        if (asset.attribute.rt_url === '') {
          AssetDom = Lllegal;
          break;
        }
        AssetDom = VideoE;
        break;
      case 'SVG':
        if (asset.attribute.SVGUrl === '') {
          AssetDom = Lllegal;
          break;
        }
        AssetDom = SVG;
        break;
      case 'image':
        if (asset.attribute.picUrl === '') {
          AssetDom = Lllegal;
          break;
        }
      case 'pic':
        if (asset.attribute.picUrl === '') {
          AssetDom = Lllegal;
          break;
        }
      case 'background':
        if (asset.attribute.picUrl === '' || asset.attribute.rt_url === '') {
          AssetDom = Lllegal;
          break;
        }
        AssetDom = Image;
        break;
      case 'text':
        AssetDom = Text;
        break;
      case 'svgPath':
        AssetDom = SvgPath;
        break;
      case 'qrcode':
        AssetDom = QrCodeItem;
        break;
      case 'group':
        AssetDom = Group;
        break;
      case 'lottie':
        if (asset.attribute.rt_url === '' && asset.meta.isTransfer) {
          break;
        }
        if (asset.attribute.rt_url === '') {
          AssetDom = Lllegal;
          break;
        }
        AssetDom = Lottie;
        break;
      case 'module':
      case '__module':
        AssetDom = Module;
        break;
      case 'mask':
        if (asset.attribute.source_key === '') {
          AssetDom = Lllegal;
          break;
        }
        if (asset.assets && asset.assets.length > 0) {
          if (['image', 'pic'].includes(asset.assets[0].meta.type)) {
            if (asset.assets[0].attribute.picUrl === '') {
              AssetDom = Lllegal;
              break;
            }
          }
          if (['videoE', 'video'].includes(asset.assets[0].meta.type)) {
            if (asset.assets[0].attribute.rt_url === '') {
              AssetDom = Lllegal;
              break;
            }
          }
        }
        AssetDom = Mask;
        break;
    }
    return AssetDom;
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
  const {
    style,
    showCustomAnimation,
    assetClassName,
    auxiliaryBolder,
    AniAssetHidden,
    isHasAnimation,
  } = useAssetStatus(props);
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
  if ((showOnly || config.hpMode) && AniAssetHidden) {
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
        transform: 'translateZ(0px)',
        opacity: 1,
      }}
      {...(isPreviewMovie || showOnly ? {} : action)}
    >
      <AssetDom {...animationProps} />
    </div>
  );

  // console.log('asset item');
  if (showOnly) {
    return <div style={style}>{Asset}</div>;
  }
  return (
    <>
      {!asset.isAllAnimation && (
        <div style={{ ...style, ...auxiliaryBolder, filter: `${shadowStyle}` }}>
          {Asset}
        </div>
      )}
      {showCustomAnimation && asset.isAllAnimation && (
        <CustomAnimation
          {...animationProps}
          assetStyle={{
            ...style,
            ...auxiliaryBolder,
            filter: `${shadowStyle}`,
            transform: `${style?.transform} translateZ(0px)`,
          }}
        >
          {Asset}
        </CustomAnimation>
      )}
      {!showCustomAnimation && asset.isAllAnimation && (
        <CanvasAnimationWrap
          {...animationProps}
          assetStyle={{
            ...style,
            ...auxiliaryBolder,
            filter: `${shadowStyle}`,
            border: 'none',
          }}
        >
          {Asset}
        </CanvasAnimationWrap>
      )}
    </>
  );
};
export default observer(AssetItem);
