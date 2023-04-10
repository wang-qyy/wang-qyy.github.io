/* eslint-disable no-template-curly-in-string */
export const assetMinDuration = 1000; // 元素最短时间 单位：ms
export const audioMinDuration = 300; // 元素最短时间 单位：ms

export const templateTotalDurationLimit = 180000; // 模板总时长限制

export const TEMPLATE_MIN_DURATION = 500; // 片段最短时长

// 默认添加个空片段的时长 用户编辑器、设计师编辑器公用，慎重修改
export const DEFAULT_TEMPLATE_PAGE_TIME = 5000;

export const MAX_ANIMATION_PBR = 10; // 元素动画最大倍速

export const TEMPLATE_MIN_DURATION_TRANSFER = 1000; // 片段最短时长-带有转场时

export const TRANSITION_MIN_DURATION = 1000; // 转场最短时长
export const TRANSITION_MAX_DURATION = 3000; // 转场最短时长

export const CAMERA_MIN_DURATION = 500; // 镜头最短时长
export const CAMERA_DEFAULT_DURATION = 2000; // 镜头默认时长
export const CAMERA_DISTANCE_DURATION = 1000; // 2个镜头的间隔时长

export const TIME_OUT_TIP = `仅支持制作${
  templateTotalDurationLimit / 1000 / 60
}分钟以内的视频`;

export const IS_WINDOWS = navigator.appVersion.indexOf('Win') > -1;

const OS = IS_WINDOWS ? 'Windows' : 'Mac';

// const ctrlKey = IS_WINDOWS ? 'ctrl' : '⌘';

export const KEY_PRESS_Tooltip = {
  Windows: {
    undo: 'Ctrl + Z',
    redo: 'Ctrl + Y',
    group: 'Ctrl G',
    unGroup: 'Shift Ctrl G',
    delete: 'Delete',
    copy: 'Ctrl + C',
    noCopyPaste: 'Ctrl + D',
    save: 'Ctrl + S',
    clone: 'Ctrl + D',
    paste: 'Ctrl + V',
    cut: 'Ctrl + X',
    moveUp: 'Ctrl + Shift + ↑',
    moveDown: 'Ctrl + Shift + ↓',
    moveToTop: 'Ctrl + ↑',
    moveToBottom: 'Ctrl + ↓',
    enlarge: 'Ctrl ++',
    narrow: 'Ctrl + -',
    move: '← ↑ → ↓',
    multipleChoice: 'Ctrl + 鼠标左键点击',
    moveLayerUp: 'Ctrl + ]',
    moveToTopLevel: 'Ctrl + Shift + ]',
    moveLayerDown: 'Ctrl + [',
    moveToBottomLevel: 'Ctrl + Shift + [',
    splitFragment: 'S',
    referenceLine: 'Ctrl + ;',
  },
  Mac: {
    undo: '⌘ + Z',
    redo: '⌘ + Y',
    group: '⌘ + G',
    unGroup: '⇧ + ⌘ + G',
    delete: 'Delete',
    copy: '⌘ + C',
    noCopyPaste: '⌘ + D',
    save: '⌘ + S',
    clone: '⌘ + D',
    paste: '⌘ + V',
    cut: '⌘ + X',
    moveUp: '⌘ + ⇧ + ↑',
    moveDown: '⌘ + ⇧ + ↓',
    moveToTop: '⌘ + ↑',
    moveToBottom: '⌘ + ↓',
    enlarge: '⌘ ++',
    narrow: '⌘ + -',
    move: '← ↑ → ↓',
    multipleChoice: '⌘ + 鼠标左键点击',
    moveLayerUp: '⌘ + ]',
    moveToTopLevel: '⌘ + Shift + ]',
    moveLayerDown: '⌘ + [',
    moveToBottomLevel: '⌘ + Shift + [',
    splitFragment: 'S',
    referenceLine: '⌘ + ;',
  },
}[OS];

export const OptionalSize = [
  12, 14, 16, 18, 22, 36, 40, 50, 80, 120, 140, 160, 180, 200, 250, 300, 350,
  400, 500, 600,
];
export const pathAnimationSpeed = [
  // 先快后慢 ease-out
  {
    type: 'easeOut',
    desc: '减速',
    p1x: 0,
    p1y: 0,
    p2x: 0.58,
    p2y: 1,
  },
  // 匀速 linear
  {
    type: 'linear',
    desc: '匀速',
    p1x: 0,
    p1y: 0,
    p2x: 1,
    p2y: 1,
  },
  // 先慢后快 ease-in
  {
    type: 'easeIn',
    desc: '加速',
    p1x: 0.42,
    p1y: 0,
    p2x: 1,
    p2y: 1,
  },
];
