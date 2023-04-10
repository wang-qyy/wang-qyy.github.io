// eslint-disable-next-line max-classes-per-file
import { CSSProperties, SyntheticEvent } from 'react';
import randomString from 'crypto-random-string';
import {
  replaceAsset,
  replaceMask,
  addImageAsset,
  addVideoEAsset,
  addSVGAsset,
  addLottieAsset,
  getTemplateTimeScale,
  addTemplateWithNewAsset,
  getCurrentTemplateIndex,
  Asset,
  Attribute,
  AssetBaseSize,
  RGBA,
  getCanvasInfo,
  setCurrentTime,
  AssetClass,
  addCopiedAsset,
  addAudio,
  BaseMultipleAudio,
  HSVA,
  Audio,
  TemplateData,
  getCurrentTemplate,
  getRelativeCurrentTime,
  GradientType,
  isTempModuleType,
  createAssetClass,
} from '@hc/editor-core';
import { reportChange } from '@kernel/utils/config';

import { loadingWeblog } from '@/utils/webLog';
import { handleAddAsset, afterAddAsset } from '@/utils/assetHandler';
import {
  getNewAssetDuration,
  getNewAssetPosition,
} from '@/utils/assetHandler/init';
import { gradientId } from '@/kernel/utils/idCreator';
import { updateActiveAudio } from '@/store/adapter/useAudioStatus';
import { assetMinDuration } from '@/config/basicVariable';
import { deepCloneJson } from '@/kernel/utils/single';

import AssetItemState from '@/kernel/store/assetHandler/asset';
import { message } from 'antd';
import { getNewAudioDuration } from '@/hooks/useSetMusic';

import { addTemplate } from './templateHandler';
import { IRgba } from '../typings';
import { getInitFontAttribute } from './assetHandler/assetUtils';

export function rShow(show: boolean): CSSProperties {
  return show ? {} : { display: 'none' };
}
/**
 *@description 时间戳转小时
 * */
export function timeToHour(time: number) {
  const date = new Date(time);
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h}:${m}`;
}

/**
 * @description 给时间不足两位补0
 * @param time
 */
export function formatTimeItem(time: number, covering = false) {
  return `${covering && time < 10 ? '0' : ''}${time}`;
}

/**
 * @description 将秒数转化为 0：00格式
 * @param number
 */
export function formatNumberToTime(number: number) {
  const m = Math.floor(number / 60);
  const s = Number((number % 60).toFixed(1));

  return `${formatTimeItem(m)}:${formatTimeItem(s, true)}`;
}

export function formatFrameToTime(frame: number) {
  return Math.ceil((frame / 30) * 1000);
}

export interface ReplaceImageParams {
  width: number;
  height: number;
  resId: string;
  picUrl: string;
  startTime?: Attribute['startTime'];
  endTime?: Attribute['endTime'];
  assetWidth?: Attribute['assetWidth'];
  assetHeight?: Attribute['assetHeight'];
}

function formatReplaceSize(originSize: AssetBaseSize, newSize: AssetBaseSize) {
  const { height, width } = originSize;
  let size = {
    width,
    height: (originSize.width / newSize.width) * newSize.height,
  };

  if (size.height < height) {
    size = {
      height,
      width: (originSize.height / newSize.height) * newSize.width,
    };
  }
  return size;
}

// todo replaceImage 已弃用
/**
 * @description 替换图片
 * @param params
 */
export function replaceImage(params: ReplaceImageParams) {
  replaceAsset((attribute: Attribute) => {
    // 如果存在裁剪，以裁剪尺寸为主
    const newSize = formatReplaceSize(attribute.container ?? attribute, params);
    // 如果存在裁剪，清空裁剪的位置信息，保证铺满整个裁剪框
    let { container } = attribute;
    if (container) {
      container = { ...container, posX: 0, posY: 0 };
    }
    return {
      width: newSize.width,
      height: newSize.height,
      resId: params.resId,
      picUrl: params.picUrl,
      assetWidth: params.width,
      assetHeight: params.height,
      container,
    };
  });
}

export interface ReplaceMaskParams {
  width: number;
  height: number;
  resId: string;
  source_key: string;
  SVGUrl: string;
}

// todo replaceMaskKey待迁移到 assetHandler
/**
 * @description 替换蒙版
 * @param params
 */
export function replaceMaskKey(params: ReplaceMaskParams) {
  replaceMask((attribute: Attribute) => {
    return {
      ...params,
    };
  });
}

/**
 * @description 添加图片
 * @param params
 */
export function addNewImage(params: Asset) {
  const { attribute, meta, transform } = params;

  const newAttribute = {
    ...attribute,
    // width: meta?.isBackground ? attribute.width : defaultWidth,
    // height: meta?.isBackground ? attribute.height : height,
    // resId: attribute.resId,
    // picUrl: attribute.picUrl,
    // startTime: attribute.startTime,
    // endTime: attribute.endTime,
    assetWidth: attribute.assetWidth ?? attribute.width,
    assetHeight: attribute.assetHeight ?? attribute.height,
  };
  const asset = addImageAsset({
    meta,
    attribute: newAttribute,
    transform,
  });
  return asset;
}

export interface ReplaceVideoParams {
  resId: Attribute['resId'];
  rt_url: Attribute['rt_url'];
  rt_preview_url: Attribute['rt_preview_url'];
  rt_frame_url: Attribute['rt_frame_url'];
  rt_total_frame: Attribute['rt_total_frame'];
  rt_total_time: Attribute['rt_total_time'];
  rt_frame_file?: Attribute['rt_frame_file'];
  width: Attribute['width'];
  height: Attribute['height'];
  isUser?: Attribute['isUser'];
  cst?: Attribute['cst'];
  cet?: Attribute['cet'];
  startTime?: Attribute['startTime'];
  endTime?: Attribute['endTime'];
  isLoop?: Attribute['isLoop'];
}

// todo replaceVideo 已弃用
/**
 * @description 替换视频
 * @param params
 */
export function replaceVideo(params: ReplaceVideoParams) {
  replaceAsset((attribute: Attribute) => {
    const newSize = formatReplaceSize(attribute, params);
    return {
      ...params,
      width: newSize.width,
      height: newSize.height,
      assetWidth: params.width,
      assetHeight: params.height,
    };
  });
}

/**
 * @description 添加视频
 * @param params
 */
export function addNewVideoE(params: Asset) {
  const newParams: Asset = {
    meta: { type: 'videoE' },
    attribute: {},
    transform: {},
  };

  if (params.meta) {
    Object.assign(newParams.meta, params.meta);
  }

  if (params.attribute) {
    Object.assign(newParams.attribute, params.attribute);
  }
  if (params.transform) {
    Object.assign(newParams.transform, params.transform);
  }
  return addVideoEAsset(newParams);
}

export interface ReplaceSVGParams {
  resId: Attribute['resId'];
  source_key: Attribute['source_key'];
  SVGUrl: Attribute['SVGUrl'];
  width: Attribute['width'];
  height: Attribute['height'];
}

// todo addAssetSVG 弃用
/**
 * 添加SVG
 * @param params
 */
export function addAssetSVG(params: {
  meta?: any;
  attribute: ReplaceSVGParams;
  transform?: any;
}) {
  const { meta, attribute, transform } = params;

  return addSVGAsset({
    meta,
    attribute: {
      ...attribute,
      resId: attribute.resId,
      source_key: attribute.source_key,
      SVGUrl: attribute.SVGUrl,
      assetWidth: attribute.width,
      assetHeight: attribute.height,
    },
    transform,
  });
}

export interface ReplaceLottieParams {
  resId: Attribute['resId'];
  rt_url: Attribute['rt_url'];
  preview_url: Attribute['rt_preview_url'];
  width: Attribute['width'];
  height: Attribute['height'];
}

/**
 * 添加lottie动画
 * @param params
 */
export function addAssetLottie(params: {
  transform?: any;
  attribute: ReplaceLottieParams;
}) {
  const { transform, attribute } = params;
  // const defaultWidth = 400;
  // const height = (defaultWidth / attribute.width) * attribute.height;
  return addLottieAsset({
    attribute: {
      ...attribute,
      isUser: false,
      resId: attribute.resId,
      rt_url: attribute.rt_url,
      rt_preview_url: attribute.preview_url,
      assetWidth: attribute.width,
      assetHeight: attribute.height,
    },
    transform,
  });
}

class WindowBeforeunload {
  open = () => {
    // console.log('WindowBeforeunload');
    window.onbeforeunload = e => {
      return '作品还未保存或下载，是否要离开？';
    };
  };

  close = () => {
    window.onbeforeunload = null;
  };
}

export const windowBeforeUnload = new WindowBeforeunload();

class WindowsLoading {
  loading = true;

  delay: number;

  loadingNode: HTMLElement | undefined;

  timer: number | undefined;

  adviseTimer: number | undefined; // loading30s 提示用户手动刷新

  forceRefreshTimer: number | undefined; // loading 1min 自动强制刷新

  weblogTimer: number | undefined; // loading 埋点每10s上报一次 超过1min停止上报

  constructor(delay: number) {
    this.delay = delay;
  }

  closeWindowsLoading = () => {
    // if (!this.loading) {
    //   return;
    // }
    clearTimeout(this.timer);
    clearTimeout(this.adviseTimer);
    clearTimeout(this.forceRefreshTimer);
    clearInterval(this.weblogTimer);

    const node = document.getElementById('editorLoadingNew');
    if (node) {
      this.loading = false;
      node.style.display = 'none';
    }
  };

  show = () => {
    const loadingNode = document.getElementById('editorLoadingNew');
    if (loadingNode) {
      this.loading = true;
      loadingNode.style.display = 'block';

      this.adviseTimer = setTimeout(() => {
        const descDom = document.getElementById('editorLoadingNewDesc');

        if (descDom) {
          descDom.innerHTML = '加载时间太长？不妨手动刷新试试';
        }
      }, 30000);
      this.forceRefreshTimer = setTimeout(() => {
        windowBeforeUnload.close();
        window.location.reload();
      }, 60000);

      this.weblogTimer = setInterval(() => {
        console.log('loading weblog Timer');
        loadingWeblog();
      }, 10000);
    }
  };

  openWindowsLoading = () => {
    // if (this.loading) {
    //   return;
    // }
    clearTimeout(this.timer);

    if (this.delay) {
      // @ts-ignore
      this.timer = setTimeout(() => {
        this.show();
      }, this.delay);
    } else {
      this.show();
    }
  };
}

export const windowsLoading = new WindowsLoading(150);

// 阻止冒泡
export function stopPropagation(e: SyntheticEvent) {
  e.stopPropagation();
  e.nativeEvent.stopPropagation();
}
export function setLocalstorageExtendStorage(key: string, value: Object) {
  let newData;
  const localStorage = window.localStorage.getItem(key);
  if (localStorage) {
    newData = JSON.parse(localStorage);
  } else {
    newData = {};
  }
  newData = {
    ...newData,
    ...value,
  };
  window.localStorage.setItem(key, JSON.stringify(newData));
}
// setLocalstorage
export function setLocalstorage(key: string, value: Object) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

// getLocalStorage
export function getLocalStorage(key: string) {
  const localStorage = window.localStorage.getItem(key) || '';

  if (localStorage) {
    if (localStorage[0] === '{') return JSON.parse(localStorage);

    return localStorage;
  }

  return '';
}

/**
 * 格式化复制的图层数据
 * @param asset
 */
export function formatCopyAsset(asset: Asset) {
  const { attribute } = asset;
  if (attribute) {
    const { colors } = attribute;
    switch (asset.meta.type) {
      case 'SVG':
        if (colors) {
          Object.keys(colors).forEach(key => {
            // @ts-ignore
            if (colors[key]?.id && colors[key]) {
              colors[key].id = gradientId();
            }
          });
        }
        break;
      default:
        break;
    }
  }
  return asset;
}

/**
 * @description 作为复制粘贴的寄存器
 */
export class CopyAndPaste {
  data: any;

  copyType: 'asset' | 'audio' | 'template';

  // template-0：第0个片段，已经执行了一次的粘贴
  pasteTime: Map<string, number> = new Map();

  copy = (type: 'asset' | 'audio' | 'template', data: any) => {
    const currentTempIndex = getCurrentTemplateIndex();
    const key = `template-${currentTempIndex}`;
    this.pasteTime.set(key, 1);
    this.data = data;
    this.copyType = type;
    navigator.clipboard.writeText('');
  };

  paste = () => {
    return { type: this.copyType, data: deepCloneJson(this.data) };
  };

  counter = (index: number) => {
    const key = `template-${index}`;
    const num = this.pasteTime.get(key);
    if (this.pasteTime && num) {
      this.pasteTime.set(key, num + 1);
    } else {
      this.pasteTime.set(key, 1);
    }
  };

  getCount = (index: number) => {
    const key = `template-${index}`;
    const num = this.pasteTime.get(key);
    if (this.pasteTime && num) {
      return num;
    }
    return 0;
  };
}
interface NewType {
  type: 'asset' | 'audio' | 'template' | 'text';
  data: Asset | Audio | TemplateData | string;
  canvasInfo: {
    width: number;
    height: number;
  };
}
/**
 * @description 粘贴板  暂时没用了
 */
class ClipBoardCopyPaste {
  // template-0：第0个片段，已经执行了一次的粘贴
  pasteTime: Map<string, number> = new Map();

  copy = async (data: NewType) => {
    const currentTempIndex = getCurrentTemplateIndex();
    const key = `template-${currentTempIndex}`;
    this.pasteTime.set(key, 1);
    const copy = encodeURIComponent(JSON.stringify(data));
    let assetText = '';
    const dbf = data.data;
    // @ts-ignore
    if (dbf?.meta && dbf.meta.type === 'text') {
      // @ts-ignore
      assetText = dbf?.attribute.text.join('');
    }

    const div = `<div data-copy="${copy}"><p>${assetText}</p></div>`;
    const blob = new Blob([div], {
      type: 'text/html',
    });
    const blobText = new Blob([assetText], {
      type: 'text/plain',
    });

    // 先清空剪贴板的内容
    navigator.clipboard.writeText('');

    // @ts-ignore
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
        [blobText.type]: blobText,
      }),
    ]);
  };

  paste = async (isAnalysis: boolean) => {
    if (!isAnalysis) {
      return {};
    }
    try {
      const data = await navigator.clipboard.read();
      if (data.length > 0) {
        const clipboardItem = data[0];
        // 过滤html类型
        const itemsHtml = clipboardItem.types.filter(item => {
          return ['text/html'].includes(item);
        });
        let itemsText = clipboardItem.types.filter(item => {
          return ['text/plain'].includes(item);
        });
        if (itemsHtml.length > 0) {
          itemsText = [];
          const blob = await clipboardItem.getType(itemsHtml[0]);
          if (blob) {
            // 通过FileReader读取数据
            const reader = new FileReader();
            reader.readAsText(blob, 'utf8');
            return new Promise(resolve => {
              reader.onload = e => {
                const aa = e.currentTarget.result;
                const paste = aa.match(/(?<=data-copy=")(.*)(?=")/g);
                if (paste && paste.length > 0) {
                  const result = decodeURIComponent(paste[0]);
                  resolve(JSON.parse(result));
                }
              };
            });
          }
        }
        if (itemsText.length > 0) {
          const textAsset = await navigator.clipboard.readText();
          if (textAsset) {
            handleAddAsset({
              meta: { type: 'text', addOrigin: 'text' },
              attribute: {
                ...getInitFontAttribute(
                  'text',
                  '自定义粘贴文字，双击编辑进行修改！',
                ),
                text: [textAsset],
              },
            });
            return {};
          }
        }
      }
    } catch (error) {
      if (error.message.indexOf('Read permission denied') > -1) {
        console.log('error=', error);
      }
    }
  };

  counter = (index: number) => {
    const key = `template-${index}`;
    const num = this.pasteTime.get(key);
    if (this.pasteTime && num) {
      this.pasteTime.set(key, num + 1);
    } else {
      this.pasteTime.set(key, 1);
    }
  };

  getCount = (index: number) => {
    const key = `template-${index}`;
    const num = this.pasteTime.get(key);
    if (this.pasteTime && num) {
      return num;
    }
    return 0;
  };
}
// todo 修改剪贴板
// export const copyAndPaste = new CopyAndPaste();
export const copyAndPaste = new ClipBoardCopyPaste();

export function mouseMoveDistance(
  e: MouseEvent | React.MouseEvent,
  cb: (distanceX: number, distanceY: number) => void,
  finish?: (distanceX: number, distanceY: number) => void,
) {
  const mouseDownPointX = e.clientX;
  const mouseDownPointY = e.clientY;

  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    cb && cb(currentX - mouseDownPointX, currentY - mouseDownPointY);
  };

  const mouseUp = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    finish && finish(currentX - mouseDownPointX, currentY - mouseDownPointY);
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('mousemove', mouseMove);
  };

  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
}

export const getVideoFrameUrl = (t: number, src: string, rt_frame_url = '') => {
  if (!src) return '';

  // console.log({ src, rt_frame_url });

  if (src.indexOf('.webm') > -1) {
    return rt_frame_url;
  }

  const formatUrl = `${src}&x-oss-process=video/snapshot,t_${t},f_jpg,w_100`;
  return formatUrl;
};

export function RGBAToString(color: RGBA) {
  const { r, g, b, a } = color;
  if (a !== undefined) {
    return `rgba(${r},${g},${b},${a})`;
  }
  return `rgba(${r},${g},${b})`;
}

/**
 * 将渐变颜色数据转行成字符串
 * @param effData
 * @returns
 */
export function transferGradientToString(effData: GradientType) {
  const data = JSON.parse(JSON.stringify(effData));
  data.colorStops.sort((a: any, b: any) => {
    return a.offset - b.offset;
  });
  data.angle = 90 - data.angle;
  let temp = `linear-gradient(${data.angle}deg,`;
  data.colorStops.forEach((element, index) => {
    let setColor = element.color;
    if (setColor) {
      if (typeof setColor !== 'string') {
        setColor = RGBAToString(setColor);
      }
      if (index === data.colorStops.length - 1) {
        temp = `${temp + setColor} ${element.offset * 100}%`;
      } else {
        temp = `${temp + setColor} ${element.offset * 100}%,`;
      }
    }
  });
  temp += ')';
  return temp;
}

export function pasteAudio(audio: BaseMultipleAudio) {
  // 粘贴的音频，格式化时间
  const duration = getNewAudioDuration(audio.rt_sourceType, {
    ...audio,
    startTime: undefined,
    endTime: undefined,
  });
  const result = addAudio({
    ...audio,
    ...duration,
  });
  updateActiveAudio(result);
}

function isInvalidAsset(asset: AssetClass) {
  // 验证是否丢失关键数据
  if (
    !asset ||
    !asset.meta.type ||
    asset.attribute.width === undefined ||
    asset.attribute.height === undefined ||
    asset.attribute.startTime === undefined ||
    asset.attribute.endTime === undefined ||
    asset.transform.posX === undefined ||
    asset.transform.posY === undefined
  ) {
    return true;
  }

  return false;
}

function buildCopyAsset(asset: AssetClass) {
  // 验证是否丢失关键数据
  if (isInvalidAsset(asset)) {
    return;
  }

  let data = createAssetClass(asset);

  data = formatCopyAsset(data) as AssetClass;

  const offset = 30;

  const currentTempIndex = getCurrentTemplateIndex();
  data.meta.isUserAdd = true;

  const {
    attribute: { endTime, startTime, cst, cet, ...others },
    transform: { posX, posY },
  } = data;

  const duration = getNewAssetDuration(endTime - startTime);

  data.updateAssetDuration(duration);

  // 粘贴添加偏移位置
  const pasteCount = copyAndPaste.getCount(currentTempIndex);
  if (pasteCount) {
    data.transform.posX = posX + pasteCount * offset;
    data.transform.posY = posY + pasteCount * offset;
  } else {
    data.transform.posX = posX + offset;
    data.transform.posY = posY + offset;
  }

  return data;
}

export async function pasteAsset({
  asset,
}: {
  asset?: AssetClass;
} = {}) {
  const res = await copyAndPaste.paste(!asset);
  if (!res?.data && !asset) {
    return;
  }
  const {
    type,
    data: copied,
    // 粘贴元素的模板尺寸
    canvasInfo: originCanvasInfo,
  } = res;
  // 当前模板的尺寸
  const templateCanvasInfo = getCanvasInfo();

  if (
    originCanvasInfo &&
    (templateCanvasInfo.width !== originCanvasInfo.width ||
      templateCanvasInfo.height !== originCanvasInfo.height)
  ) {
    if (type === 'template') {
      message.info('模板尺寸不一致，无法应用！');
      return;
    }
    if (type === 'asset') {
      // 元素默认位置  注意要在确定元素宽高之后获取位置
      const position = getNewAssetPosition(copied.attribute);
      Object.assign(copied.transform, position);
    }
  }
  if (type === 'audio') {
    pasteAudio(copied);
    return;
  }
  if (type === 'template') {
    addTemplate({
      templates: [copied],
      incrementalPageTime: copied.videoInfo.allAnimationTime,
    });
    return;
  }

  const newData = (asset?.getAssetCloned() || copied) as Asset;
  const currentTempIndex = getCurrentTemplateIndex();

  if (isTempModuleType(newData)) {
    const newAssets: Asset[] = [];
    newData.assets?.forEach(item => {
      const build = buildCopyAsset(item);

      if (build) {
        newAssets.push(build);
      }
    });

    const template = getCurrentTemplate();

    template.addAssets(newAssets);

    reportChange('addCopyTempModule', true);
  } else {
    const build = buildCopyAsset(newData);

    if (build) {
      if (build?.meta.isBackground) {
        const index = addTemplateWithNewAsset({
          assets: [
            { isBackground: true, type: build.meta.type, ...build.attribute },
          ],
          pageTime: build.attribute.endTime - build.attribute.startTime,
          index: currentTempIndex + 1,
        });

        setCurrentTime(getTemplateTimeScale()[index][0], false);
      } else {
        handleAddAsset(build, {}, !!type);
      }
    }

    if (!asset) {
      copyAndPaste.counter(currentTempIndex);
    }
  }
}
/**
 * 走剪贴板逻辑的粘贴   暂时没用了
 * @param e
 * @param asset
 * @returns
 */
export async function clipBoardPasteAsset(
  e?: ClipboardEvent,
  asset?: AssetClass,
) {
  const pasteAsset = await clipBoardCopyPaste.paste(e);
  if (!pasteAsset) {
    return;
  }
  const { type, data: copied } = pasteAsset;
  if (!asset) {
    if (type === 'text') {
      // 如果没有选中图层，复制剪切板文字
      handleAddAsset({
        meta: { type: 'text', addOrigin: 'text' },
        attribute: {
          text: [copied],
          ...getInitFontAttribute('text'),
        },
      });
      return;
    }
    if (type === 'audio') {
      pasteAudio(copied);
      return;
    }
    if (type === 'template') {
      addTemplate({
        templates: [copied],
        incrementalPageTime: copied.videoInfo.allAnimationTime,
      });
      return;
    }
  }

  let data = (asset?.getAssetCloned() || copied) as Asset;
  if (data) {
    data = formatCopyAsset(data);
    const offset = 30;

    if (data?.meta?.id !== undefined && data?.meta?.id !== null) {
      const {
        meta: { type, isBackground },
        attribute: { endTime, startTime, cst, cet, ...others },
        transform: { posX, posY },
      } = data;

      if (isBackground) {
        const currentTempIndex = getCurrentTemplateIndex();

        const index = addTemplateWithNewAsset({
          assets: [{ isBackground: true, type, ...data.attribute }],
          pageTime: data.attribute.endTime - data.attribute.startTime,
          index: currentTempIndex + 1,
        });

        setCurrentTime(getTemplateTimeScale()[index][0], false);
      } else {
        const duration = endTime - startTime;

        const { allAnimationTime, speed = 1 } = getCurrentTemplate().videoInfo;

        const maxDuration = Math.max(
          allAnimationTime - getRelativeCurrentTime() / (1 / speed),
          assetMinDuration,
        );

        const result = addCopiedAsset(data, {
          transform: {
            posX: posX + copyAndPaste.count * offset,
            posY: posY + copyAndPaste.count * offset,
          },
          attribute: getNewAssetDuration(Math.min(duration, maxDuration)),
        });

        afterAddAsset(result);
      }

      if (!asset) {
        clipBoardCopyPaste.counter();
      }
    }
  }
}

export function HSVToRGBA(hsva: HSVA) {
  let { h, s, v } = hsva;
  const { a } = hsva;

  let r = 0;
  let g = 0;
  let b = 0;
  if (s < 0) s = 0;
  if (s > 1) s = 1;
  if (v < 0) v = 0;
  if (v > 1) v = 1;
  h %= 360;
  if (h < 0) h += 360;
  h /= 60;
  const i = Math.floor(h);
  const f = h - i;
  const p1 = v * (1 - s);
  const p2 = v * (1 - s * f);
  const p3 = v * (1 - s * (1 - f));
  switch (i) {
    case 0:
      r = v;
      g = p3;
      b = p1;
      break;
    case 1:
      r = p2;
      g = v;
      b = p1;
      break;
    case 2:
      r = p1;
      g = v;
      b = p3;
      break;
    case 3:
      r = p1;
      g = p2;
      b = v;
      break;
    case 4:
      r = p3;
      g = p1;
      b = v;
      break;
    case 5:
      r = v;
      g = p1;
      b = p2;
      break;
  }

  if (a !== undefined) {
    return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(
      b * 255,
    )},${a})`;
  }

  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(
    b * 255,
  )})`;
}

export const createId = () => randomString({ length: 6 });

// 十进制转化为16进制
export function hex(n: number) {
  return `0${n.toString(16)}`.slice(-2);
}

/**
 * rbga对象转化为16进制颜色字符串
 * @param rgba
 * @returns
 */
export const rbgaObjToHex = (rgba: IRgba) => {
  let { r, g, b } = rgba;
  const { a } = rgba;
  r = Math.floor(r * a);
  g = Math.floor(g * a);
  b = Math.floor(b * a);
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

/**
 * rbga字符串转化为rgba对象
 * @param rgba
 * @returns
 */
export const rbgaStrTorbgaObj = (rgbaStr: string) => {
  const [r, g, b, a] = rgbaStr.match(/\d+(\.\d+)?/g).map(Number);
  return { r, g, b, a };
};

// 如果是mask类型 则取第一个子元素
export const getRealAsset = (item: AssetItemState) => {
  const asset =
    item?.meta?.type === 'mask' && item?.assets?.length ? item.assets[0] : item;
  return asset;
};

export function randomHexColor() {
  // 随机生成十六进制颜色
  let hex = Math.floor(Math.random() * 16777216).toString(16); // 生成ffffff以内16进制数
  while (hex.length < 6) {
    // while循环判断hex位数，少于6位前面加0凑够6位
    hex = `0${hex}`;
  }
  return `#${hex}`; // 返回‘#'开头16进制颜色
}
