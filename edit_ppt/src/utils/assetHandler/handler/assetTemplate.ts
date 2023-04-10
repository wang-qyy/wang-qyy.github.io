import randomString from 'crypto-random-string';
import { Asset, TemplateData } from '@kernel/typing';
import { newId } from '@kernel/utils/idCreator';
import { Meta } from '@hc/editor-core';
import { getCanvasInfo } from '@/kernel';

export const createId = () => randomString({ length: 6 });

const getBaseMeta = (other: Partial<Meta> = {}) => {
  const meta = {
    locked: false,
    index: 0,
    name: '',
    group: '',
    isQuickEditor: other.type === 'text',
    trackId: createId(),
  };
  return Object.assign(meta, other);
};

const getBaseTransform = (other = {}) => {
  const transform = {
    posX: 0,
    posY: 0,
    horizontalFlip: false,
    verticalFlip: false,
    rotate: 0,
  };
  return Object.assign(transform, other);
};

const getBaseAttribute = (other = {}) => {
  const attribute = {
    resId: '',
    picUrl: '',
    width: 0,
    height: 0,
    assetHeight: 0,
    assetWidth: 0,
    opacity: 100,
    cropXFrom: 0,
    cropXTo: 1,
    cropYFrom: 0,
    cropYTo: 1,
  };
  return Object.assign(attribute, other);
};

export const assetTemplate = {
  SVG: {
    meta: getBaseMeta({ type: 'SVG' }),
    attribute: {
      resId: '',
      picUrl: '',
      width: '',
      height: '',
      assetHeight: '',
      assetWidth: '',
      opacity: 100,
      cropXFrom: 0,
      cropYFrom: 0,
      cropXTo: '',
      cropYTo: '',
      colors: {},
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
      // viewBox: {},
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  },
  image: {
    meta: getBaseMeta({ type: 'image' }),
    attribute: {
      resId: '',
      picUrl: '',
      width: '',
      height: '',
      assetHeight: '',
      assetWidth: '',
      opacity: 100,
      cropXFrom: 0,
      cropYFrom: 0,
      cropXTo: '',
      cropYTo: '',
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  },
  background: {
    meta: getBaseMeta({
      type: 'background',
      locked: true,
      isQuickEditor: false,
    }),
    attribute: {
      resId: '',
      picUrl: '',
      width: '',
      height: '',
      assetHeight: '',
      assetWidth: '',
      opacity: 100,
      cropXFrom: 0,
      cropYFrom: 0,
      cropXTo: '',
      cropYTo: '',
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  },
  pic: {
    meta: getBaseMeta({ type: 'pic' }),
    attribute: {
      resId: '',
      picUrl: '',
      width: '',
      height: '',
      assetHeight: '',
      assetWidth: '',
      opacity: 100,
      cropXFrom: 0,
      cropYFrom: 0,
      cropXTo: '',
      cropYTo: '',
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  },
  container: {
    meta: getBaseMeta({ type: 'container', isQuickEditor: false }),
    attribute: {
      resId: '',
      picUrl: '',
      width: '',
      height: '',
      assetHeight: '',
      assetWidth: '',
      opacity: 100,
      contentInfo: [],
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  },
  text: {
    meta: getBaseMeta({ type: 'text' }),
    attribute: {
      width: '',
      text: '',
      fontSize: '',
      fontWeight: '',
      textAlign: '',
      lineHeight: '',
      letterSpacing: '',
      fontFamily: '',
      opacity: 100,
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  },
  group: {
    meta: getBaseMeta({ type: 'group' }),
    attribute: {
      width: '',
      height: '',
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      rotate: 0,
    },
  },
  chart: {
    meta: getBaseMeta({
      type: 'chart',
      isEqualTransform: false,
      isQuickEditor: false,
    }),
    attribute: {
      // 画布缩放100%的时候,在画布上的显示最终宽度
      width: 800,
      // 画布缩放100%的时候,在画布上时间的最终高度
      height: 800,
      // 0全透明,1不透明,浮点数
      opacity: 100,
      // 颜色表
      colorTable: [],
      // 基础图表编号
      chartBaseId: 1,
      // 图表绘制详情
      chartDrawInfo: {},
      // 图表绘制规则
      chartRule: {
        // 数据第一行是否是新维度（默认"false"）
        isFirstTitle: false,
      },
      // 默认数据
      rt_defaultData: [],
      // 用户数据
      userData: [],
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  },
  table: {
    meta: getBaseMeta({ type: 'table', id: '', isQuickEditor: false }),
    // 节点属性
    attribute: {
      // 画布缩放100%的时候,在画布上的显示最终宽度
      width: 800,
      // 画布缩放100%的时候,在画布上时间的最终高度
      height: 800,
      // 单元格详情
      cell: {},
      // 单元格大小
      cellSize: {},
      // 单元格文本
      text: {},
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      // 水平翻转
      horizontalFlip: false,
      // 垂直翻转
      verticalFlip: false,
      // 度数
      rotate: 0,
      // 整数
      posX: 100,
      // 整数
      posY: 100,
      // 0全透明,1不透明,浮点数
      alpha: 1.0,
      // Z排序
      zindex: 1,
    },
  },
  lottie: {
    // groupWordID 如果是从文字组合创建,这个表示组合模板ID,字符串
    meta: getBaseMeta({
      type: 'lottie',
      groupWordID: '',
      isQuickEditor: false,
    }),
    attribute: {
      // 唯一ID
      resId: 1,
      width: 662,
      height: 435,
      // 开始时间（单位ms）
      startTime: 0,
      // 结束时间（单位ms）
      endTime: 1000,
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
      loopTimes: 1,
      isLoop: true,
      rt_isloaded: false,
    },
    transform: {
      posX: 69,
      posY: 137,
      rotate: 0,
      zindex: 2,
    },
  },
  video: {
    // groupWordID 如果是从文字组合创建,这个表示组合模板ID,字符串
    meta: getBaseMeta({
      type: 'video',
      isBackground: true,
      groupWordID: '',
      isQuickEditor: false,
    }),
    attribute: {
      // 唯一ID
      resId: 1,
      rt_url: '',
      width: 662,
      height: 435,
      // 开始时间（单位ms）
      startTime: 0,
      // 结束时间（单位ms）
      rt_total_frame: 100,
      // 预览图
      rt_preview: '',
    },
    transform: {
      posX: 69,
      posY: 137,
      rotate: 0,
      zindex: 2,
    },
  },
  // 内嵌视频 START
  videoE: {
    // groupWordID 如果是从文字组合创建,这个表示组合模板ID,字符串
    meta: getBaseMeta({
      type: 'videoE',
      groupWordID: '',
      isQuickEditor: false,
    }),
    attribute: {
      // 唯一ID
      resId: 1,
      width: 662,
      height: 435,
      // 开始时间（单位ms）
      startTime: 0,
      // 结束时间（单位ms）
      endTime: 1000,
      // 是否循环
      isLoop: false,
      // 不透明度
      opacity: 100,

      // 视频链接
      rt_url: '',
      // 结束时间（单位ms）
      rt_total_frame: 100,
      // 预览图
      rt_preview_url: '',
      // 单帧位置链接
      rt_frame_url: '',
    },
    transform: {
      posX: 69,
      posY: 137,
      rotate: 0,
      zindex: 2,
      // 水平翻转
      horizontalFlip: false,
      // 垂直翻转
      verticalFlip: false,
    },
  },
  // 内嵌视频 END
};

export function newTemplate(pageTime = 10000) {
  pageTime = Number(pageTime);
  const newData: TemplateData = {
    // 本地id，作为模板唯一标识使用
    // 模板id，空白模板不存在该数据
    poster: '',
    pageAttr: {
      backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
      pageInfo: {
        gifInfo: undefined,
        pageTime,
        baseTime: pageTime,
        rt_preview_image: '',
        rt_preview_video: '',
        tid: '',
      },
      sound: {
        list: [],
      },
    },
    videoInfo: {
      startTime: 0,
      endTime: pageTime,
      allAnimationTime: pageTime,
      pageTime,
      baseTime: pageTime,
      allAnimationTimeBySpeed: pageTime,
      offsetTime: [0, 0],
    },
    assets: [],
    id: `${newId()}`,
    maxZIndex: 0,
    minZIndex: 0,
  };
  return newData;
}

export function newLottie() {
  return {
    // groupWordID 如果是从文字组合创建,这个表示组合模板ID,字符串
    meta: getBaseMeta({ type: 'lottie', groupWordID: '' }),
    attribute: {
      // 唯一ID
      resId: 0,
      width: 0,
      height: 0,
      // 开始时间（单位ms）
      startTime: 0,
      // 结束时间（单位ms）
      endTime: 1000,
      // 是否循环
      isLoop: true,
      // 不透明度
      opacity: 100,

      // 视频链接
      rt_url: '',
      // 结束时间（单位ms）
      rt_total_frame: 100,
      // 预览图
      rt_preview_url: '',
      // 单帧位置链接
      rt_frame_url: '',
    },
    transform: {
      posX: 0,
      posY: 0,
      rotate: 0,
      // 水平翻转
      horizontalFlip: false,
      // 垂直翻转
      verticalFlip: false,
    },
  };
}

export function newText() {
  return {
    meta: getBaseMeta({
      type: 'text',
      addOrigin: 'specificWord',
    }),
    attribute: {
      text: ['双击编辑文字'],
      fontSize: 24,
      fontWeight: 'normal',
      textAlign: 'center',
      width: 200,
      height: 50,
      opacity: 100,
      lineHeight: 13,
      letterSpacing: 0,
      color: { r: 0, g: 0, b: 0, a: 1 },
      animation: {
        // 进入动画
        enter: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
        // 停留动画 - 暂无
        stay: {},
        // 出场动画
        exit: {
          // 动画类型（0为无动画）
          baseId: 0,
          // 动画持续时间（单位ms）
          duration: 500,
          // 动画详情
          details: {
            // 详情见“动画属性详情”
            direction: 2,
          },
        },
      },
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  };
}

export function newImage() {
  return {
    meta: getBaseMeta({ type: 'image' }),
    attribute: {
      resId: '',
      picUrl: '',
      width: 0,
      height: 0,
      assetHeight: 0,
      assetWidth: 0,
      opacity: 100,
      cropXFrom: 0,
      cropXTo: 1,
      cropYFrom: 0,
      cropYTo: 1,
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  };
}

export function newSVG() {
  return {
    meta: getBaseMeta({ type: 'SVG' }),
    attribute: {
      resId: '',
      picUrl: '',
      width: 0,
      height: 0,
      assetHeight: 0,
      assetWidth: 0,
      opacity: 100,
      cropXFrom: 0,
      cropXTo: 1,
      cropYFrom: 0,
      cropYTo: 1,
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  };
}

export function newSvgPath() {
  return {
    meta: getBaseMeta({ type: 'svgPath' }),
    attribute: getBaseAttribute(),
    transform: getBaseTransform(),
  };
}

export function newEffect() {
  const { width, height } = getCanvasInfo();

  return {
    meta: getBaseMeta({ type: 'effect' }),
    attribute: getBaseAttribute({ width, height }),
    transform: getBaseTransform(),
  };
}

export function newQrCode() {
  return {
    meta: getBaseMeta({ type: 'qrcode' }),
    attribute: {
      resId: '',
      picUrl: '',
      width: 0,
      height: 0,
      assetHeight: 0,
      assetWidth: 0,
      opacity: 100,
      cropXFrom: 0,
      cropXTo: 1,
      cropYFrom: 0,
      cropYTo: 1,
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  };
}

export function newMask() {
  return {
    meta: getBaseMeta({ type: 'mask', isClip: false }),
    attribute: {
      resId: '',
      picUrl: '',
      width: 0,
      height: 0,
      assetHeight: 0,
      assetWidth: 0,
      opacity: 100,
      cropXFrom: 0,
      cropXTo: 1,
      cropYFrom: 0,
      cropYTo: 1,
    },
    transform: {
      posX: 0,
      posY: 0,
      horizontalFlip: false,
      verticalFlip: false,
      rotate: 0,
    },
  };
}

export function newVideoE() {
  return {
    // groupWordID 如果是从文字组合创建,这个表示组合模板ID,字符串
    meta: getBaseMeta({ type: 'videoE', groupWordID: '' }),
    attribute: {
      // 唯一ID
      resId: 0,
      width: 0,
      height: 0,
      // 开始时间（单位ms）
      startTime: 0,
      // 结束时间（单位ms）
      endTime: 1000,
      // 是否循环
      isLoop: false,
      // 不透明度
      opacity: 100,

      // 视频链接
      rt_url: '',
      // 结束时间（单位ms）
      rt_total_frame: 100,
      // 预览图
      rt_preview_url: '',
      // 单帧位置链接
      rt_frame_url: '',
    },
    transform: {
      posX: 0,
      posY: 0,
      rotate: 0,
      // 水平翻转
      horizontalFlip: false,
      // 垂直翻转
      verticalFlip: false,
    },
  };
}

export function newModule(isTemp = false) {
  return {
    meta: getBaseMeta({
      type: isTemp ? '__module' : 'module',
      groupWordID: '',
    }),
    attribute: {
      width: 0,
      height: 0,
    },
    transform: {
      posX: 0,
      posY: 0,
      rotate: 0,
    },
    assets: [],
  };
}
