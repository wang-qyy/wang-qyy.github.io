import {
  Asset,
  AssetClass,
  Container,
  AssetStoreUpdateParams,
  AssetTempUpdateParams,
  RawTemplateData,
  TemplateClass,
  PageAttr,
  RGBA,
  TemplateBackground,
  Attribute,
  AddMaskParams,
  GradientType,
  Camera,
} from '@kernel/typing';
import { assetHandler, getAssetRtInfo } from '@kernel/store';
import { reportChange } from '@kernel/utils/config';
import CameraState from '../../template/camera';

export function assetUpdater(
  asset: AssetClass | undefined,
  data: AssetStoreUpdateParams,
) {
  asset?.update(data);
}

export async function replaceAssetSelf(asset: AssetClass, data: Asset) {
  await getAssetRtInfo(data);
  asset.replaceAssetSelf(data);
}

export function updateContainer(
  asset: AssetClass | undefined,
  data: Partial<Container>,
) {
  asset?.updateContainer(data);
}

export function setAssetTempData(
  asset: AssetClass | undefined,
  data: Partial<AssetTempUpdateParams>,
) {
  asset?.setTempData(data);
}

export function setTemplateData(
  template: TemplateClass | undefined,
  data: Partial<RawTemplateData>,
) {
  template?.updateTemplate(data);
}

export function setTemplatePageInfo(
  template: TemplateClass | undefined,
  data: Partial<PageAttr['pageInfo']>,
) {
  template?.updatePageInfo(data);
}

export function removeAssetInTemplate(
  template: TemplateClass | undefined,
  asset: AssetClass,
) {
  template?.autoRemoveAsset(asset.id);
}

export function replaceAsset(
  template: TemplateClass,
  asset: Asset,
  index: number,
) {
  template.replaceAsset(asset, index);
}

// 修改模板背景颜色
export function setTemplateBackgroundColor(
  template: TemplateClass,
  color: RGBA | GradientType,
) {
  template.updateBackgroundColor(color);
}

// 修改模板背景图片
export function setTemplateBackgroundImage(
  template: TemplateClass,
  data: TemplateBackground['backgroundImage'],
) {
  template.updateBackgroundImage(data);
}
export function cameraUpdater(camera: CameraState | undefined, data: Camera) {
  camera?.update(data);
}