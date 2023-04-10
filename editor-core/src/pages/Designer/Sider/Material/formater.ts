import { AssetType } from '@hc/editor-core';

type AssetAddType =
  | 'svg'
  | 'shape'
  | 'png'
  | 'lottie'
  | 'gif'
  | 'video'
  | 'image'
  | 'mask'
  | 'td';

export const formater = (params: any, type: AssetAddType) => {
  type = params.asset_type === 'mask' ? 'mask' : type;
  let assetType = type as AssetType;

  let attribute;

  if (type === 'gif' || type === 'video') {
    assetType = 'videoE';

    attribute = {
      rt_url: params.sample,
      rt_preview_url: params.preview,
      rt_frame_file: params.frame_file,
      rt_total_frame: params.total_frame,
      rt_total_time: params.duration,
      isLoop: true,
    };
  } else if (type === 'lottie') {
    assetType = 'lottie';

    attribute = {
      width: params.width,
      height: params.height,
      resId: params.id,
      rt_preview_url: params.preview,
      rt_url: params.sample,
      ...params,
    };
  } else if (type === 'shape' || type === 'svg') {
    assetType = 'SVG';

    attribute = {
      SVGUrl: params.sample || params.preview,
      source_key: params.source_key,
      rt_preview_url: params.sample || params.preview,
    };
  } else if (type === 'mask') {
    assetType = 'mask';

    attribute = {
      SVGUrl: params.svg_preview,
      source_key: params.source_key,
      picUrl: params.preview,
      rt_preview_url: params.preview,
    };
  } else {
    assetType = type === 'png' ? 'image' : 'pic';

    attribute = {
      picUrl: params.preview,
      rt_preview_url: params.preview,
      ...params,
    };
  }

  return {
    type: assetType,
    attribute: {
      resId: type === 'td' ? params.gid : params.id,
      width: params.width,
      height: params.height,
      ...attribute,
    },
  };
};
