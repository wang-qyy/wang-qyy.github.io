import type { Asset } from '@kernel/typing';
import { EventHooks } from '@kernel/typing';
import { debounce } from 'lodash-es';
import { CacheFetch } from '@kernel/utils/single';
import { PlayStatus } from '@kernel/utils/const';
import { getFontFamilyByFontName } from './defaultConfig';

export const baseFrames = 30;
export const frameRat = 16.7;

export const defaultGetImgUrl =
  '//js.xiudodo.com//xiudodo-editor/video/empty_video.mp4';
export const defaultFontURl = `//js.xiudodo.com/fonts/`;

// 蒙版底图
export const maskModelUrl = `https://js.xiudodo.com/editor/mask/maskModel.png`;

export interface ConfigApis {
  getSpecificWord: string;
  getAeAnimationDetail: string;
  getWebmFrameImage: string;
}

export interface CustomConfigType extends EventHooks {
  hostName: string;
  cdnHost: string;
  handImgSrc: string;
  fontsPath: string;
  hpMode: boolean;
  wholeTemplate: boolean;
  autoCalcTemplateEndTime?: boolean;
  apis: Partial<ConfigApis>;
  assetHoverTip?: boolean; // 除文字元素外，其他元素是否需要hover提示
}

export type FontLoader = (
  fontFamily: string,
  path: [string] | string,
  cb?: (status: boolean) => void,
) => void;
export type GetFontFamily = (fontFamily: string) => string;

function onAssetChange() {
  console.log('onAssetChange');
}

export type CreateClassName = (asset: Asset, showOnly: boolean) => string;

class Config {
  // 性能模式，会在元素不在场时自动卸载
  hpMode = true;

  // 画布展示全部模板
  wholeTemplate = false;

  // 自动计算模板持续时间，一般用于设计师端
  autoCalcTemplateEndTime = false;

  PlayStatus = PlayStatus;

  // 最大zIndex
  maxZIndex = 99999;

  maxAssetIndex = 999;

  // 编辑时的zIndex
  editZIndex = this.maxZIndex + 10;

  // 最小zIndex
  minZIndex = -1000;

  // 帧率
  frameRat = 16.7;

  baseFrames = 30;

  frameInterval: number = 1 / this.baseFrames;

  precision?: number;

  imageTypes: string[] = ['image'];

  useContainerSizeTypes: string[] = ['image'];

  canUseTextEditor: string[] = ['text'];

  hostName = '';

  cdnHost = '';

  handImgSrc = '';

  fontsPath = '';

  getFontFamily: GetFontFamily = getFontFamilyByFontName;

  // 可以操作的元素
  editAble = ['text', 'image'];

  replaceable = ['image', 'SVG', 'lottie', 'mask'];

  apis: ConfigApis = {
    getSpecificWord: '',
    getAeAnimationDetail: '',
    getWebmFrameImage: '',
  };

  classNameCreator?: CreateClassName;

  container?: string;

  assetHoverTip = true;

  specificWordsFetcher?: CacheFetch;

  // 事件钩子
  onChange?: EventHooks['onChange'];

  onError?: EventHooks['onError'];

  onAssetChange = debounce(onAssetChange, 500);

  static getPrecisionTime = (value: number) => {
    if (value === undefined) return 0;
    const valueString = value.toString();
    const dotPosition = valueString.indexOf('.');
    let precision = 0;
    if (dotPosition !== -1) {
      precision = valueString.length - dotPosition - 1;
    }
    return precision;
  };

  constructor({ baseFrames = 1 }) {
    this.setBaseFrames(baseFrames);
  }

  getApi = (apiName: keyof ConfigApis) => {
    return `${this.hostName}${this.apis?.[apiName] ?? ''}`;
  };

  /**
   * @description 自动处理视频播放状态
   * @param playStatus
   * @param onPlay
   * @param onStop
   * @param onPause
   */
  handleVideoStatus = (
    playStatus: PlayStatus,
    {
      onPlay,
      onStop,
      onPause,
    }: Record<'onPlay' | 'onStop' | 'onPause', () => void>,
  ) => {
    switch (playStatus) {
      case this.PlayStatus.Playing:
        onPlay();
        break;
      case this.PlayStatus.Stopped:
        onStop();
        break;
      case this.PlayStatus.Paused:
        onPause();
        break;
    }
  };

  /**
   * 设置基本帧率
   * @param baseFrames
   */
  setBaseFrames = (baseFrames: number) => {
    if (baseFrames < 1) {
      throw new Error(
        'baseFrames Must be a positive integer（baseFrames必须是正整数） ',
      );
    }
    this.baseFrames = baseFrames;
    this.frameInterval = 1 / this.baseFrames;
    this.precision = Config.getPrecisionTime(this.frameInterval);
  };

  /**
   * @description 处理时间对应帧
   * @param time
   */
  getFramesPointTime = (time: number) => {
    const precision = this?.precision ?? 0;
    const frameInterval = this?.frameInterval ?? 0;
    const precisionFactor = 10 ** precision;

    const frames = Math.round(time / frameInterval);
    const newTime =
      (frames * precisionFactor * frameInterval) / precisionFactor;
    return Number(newTime.toFixed(3)); // 精确到 ms
  };

  /**
   * @description 视频预检失败处理
   */
  videoTimerLoadError = (src: string) => {
    console.error(`预检失败,请检查videoTimerSrc是否是有效链接---src:${src}`);
  };

  /**
   * @description 由于视频时间为实际时间*1000后整数化的数据，实际操作视频时，需要还原时间
   * @param currentTime
   */
  calculateVideoTime = (currentTime: number) => {
    const result = currentTime / 1000;
    return Number.isNaN(result) ? 0 : result;
  };

  updateConfig = (newConfig: Partial<CustomConfigType>) => {
    Object.keys(newConfig).forEach((key) => {
      // @ts-ignore
      if (newConfig[key] !== undefined) {
        // @ts-ignore
        this[key] = newConfig[key];
      }
    });
  };
}

const config = new Config({ baseFrames });

export function customConfig(newConfig: CustomConfigType) {
  config.updateConfig(newConfig);
  // 挂载特效字请求缓存接口
  const getSpecificWordApi = config.getApi('getSpecificWord');
  config.specificWordsFetcher = new CacheFetch(getSpecificWordApi);
  // initFontFamily();
}

export function loadHooks(hooks: EventHooks) {
  config.updateConfig(hooks);
}

export function reportChange(currentAsset: any, needSave = false) {
  setTimeout(() => {
    config.onChange?.(currentAsset, needSave);
  });
}

export { config };
