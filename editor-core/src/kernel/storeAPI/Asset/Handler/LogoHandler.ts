import { CSSProperties } from 'react';
import { RGBA, Asset, Attribute, AssetClass } from '@kernel/typing';
import assetHandler from '@kernel/store/assetHandler';
import { newText, newImage } from '@kernel/utils/assetTemplate';

import { getFontFamily } from '@kernel/store/cacheManager/fatcher';

import { runInAction, toJS } from 'mobx';
import { config, reportChange } from '@kernel/utils/config';
import { templateLogoReconcile } from '@/kernel';

const isApplyLogo = (asset: AssetClass) => {
  return asset.meta.isLogo && !asset.meta.hidden;
};

interface LogoPosition {
  posX?: CSSProperties['backgroundPositionX'];
  posY?: CSSProperties['backgroundPositionY'];
}

interface LogoParams extends LogoPosition {
  opacity?: number;
  repeat?: CSSProperties['backgroundRepeat'];
}

function useUpdateLogoAttributeFactory<T>(
  attributeKey: keyof Attribute,
  defaultValue?: T,
) {
  const value = assetHandler.logo?.attribute?.[attributeKey] ?? defaultValue;

  function update(attribute: any) {
    runInAction(() => {
      assetHandler.templates.forEach(template => {
        const logo = template.assets.find(isApplyLogo);

        if (logo) {
          Object.assign(logo.attribute, { [attributeKey]: attribute });
        }
      });
    });

    reportChange('updateLogo', true);
  }

  return [value, update];
}

export function useUpdateLogoAlphaByObserver() {
  const value = assetHandler.logo?.transform.alpha || 50;

  function update(alpha: number) {
    assetHandler.templates.forEach(template => {
      const logo = template.assets.find(isApplyLogo);

      if (logo) {
        Object.assign(logo.transform, { alpha });
      }
    });
    reportChange('updateLogoAlpha', true);
  }

  return [value, update];
}

export function useUpdateLogoTextByObserver() {
  return useUpdateLogoAttributeFactory('text');
}

export function useUpdateLogoTextFontSizeByObserver() {
  return useUpdateLogoAttributeFactory('fontSize', 50);
}

export function useUpdateLogoTextFontFamilyByObserver() {
  const value = assetHandler.logo?.attribute.fontFamily;

  async function update(fontFamily: string) {
    const result = await getFontFamily(fontFamily);

    if (result) {
      runInAction(() => {
        assetHandler.templates.forEach(template => {
          const logo = template.assets.find(isApplyLogo);

          if (logo) {
            Object.assign(logo.attribute, { fontFamily });
          }
        });
      });
    }
  }

  return [value, update];
}

export function useUpdateLogoTextColorByObserver() {
  return useUpdateLogoAttributeFactory('color');
}

// 平铺logo
export function useUpdateLogoRepeat() {
  return useUpdateLogoAttributeFactory('isFill');
}

interface UploadLogoImageProps {
  resId: string;
  ufsId?: string;
  picUrl: string;
  assetWidth: number;
  assetHeight: number;
}

export function updateLogoImage(params: UploadLogoImageProps) {
  runInAction(() => {
    assetHandler.templates.forEach(template => {
      const logo = template.assets.find(isApplyLogo);
      if (logo) {
        Object.assign(logo.attribute, params);
      }
    });
  });
  reportChange('updateLogoImage', true);
}

export function useUpdateLogoImageSizeByObserver() {
  return useUpdateLogoAttributeFactory('scale', 50);
}

export function useUpdateLogoPosition() {
  return useUpdateLogoAttributeFactory('gravity');
}

export function buildLogoData(type: string, logoInfo: any): Asset {
  let asset: Asset;

  if (type === 'image') {
    asset = newImage() as Asset;
  } else {
    asset = newText() as Asset;
  }

  asset.meta.isUserAdd = true;
  asset.meta.locked = true;
  asset.meta.isLogo = true;
  asset.meta.isAlwaysVisible = true;

  Object.assign(asset.attribute, {
    isFill: false,
    gravity: 'nw',
    fontSize: 50,
    scale: 100,
    startTime: 0,
    color: { r: 255, g: 255, b: 255, a: 1 },
    endTime: 100,
    fontFamily: 'fnsyhtHeavy',
  });
  Object.assign(asset.attribute, logoInfo);
  Object.assign(asset.transform, {
    posX: 0,
    posY: 0,
    alpha: 50,
    zindex: config.maxAssetIndex,
  });
  return asset;
}

interface AddImageLogoParams extends LogoParams {
  resId: string; // 图片水印资源id
  ufsId?: string;
  picUrl?: string; //
  assetHeight?: number;
  assetWidth?: number;
}

export function addImageLogo(attribute: AddImageLogoParams) {
  const asset = buildLogoData('image', attribute);
  assetHandler.setLogoAsset(asset, 'image');
  setTimeout(() => {
    templateLogoReconcile();
  }, 50);
  reportChange('addImageLogo', true);
}

interface AddTextLogoParams extends LogoParams {
  text?: string[];
  fontFamily?: string;
  color?: RGBA;
}

export function addTextLogo(attribute: AddTextLogoParams) {
  const asset = buildLogoData('text', attribute);
  assetHandler.setLogoAsset(asset, 'image');
  setTimeout(() => {
    templateLogoReconcile();
  }, 50);
  reportChange('addTextLogo', true);
}

export function changeLogoType(type: 'image' | 'text') {
  // todo
  assetHandler.templates.forEach(template => {
    template.assets.forEach(asset => {
      if (asset.meta.isLogo) {
        asset.meta.hidden = asset.meta.type !== type;
      }
    });
  });

  reportChange('changeLogoType', true);
}

export function useGetLogoByObserver() {
  return assetHandler.logo;
}

export function getLogoInfo() {
  return assetHandler.logo;
}
export function deleteLogo(type: 'image' | 'text') {
  runInAction(() => {
    assetHandler.setLogoAsset(undefined, type);
    assetHandler.templates.forEach(template => {
      const index = template.assets.findIndex(
        asset => asset.meta.isLogo && asset.meta.type === type,
      );
      if (index > -1) {
        template.assets.splice(index, 1);
      }
    });
  });
  reportChange('deleteLogo', true);
}
