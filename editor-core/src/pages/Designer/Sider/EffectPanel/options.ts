import { cdnHost, ossEditor } from '@/config/urls';
import { EffectInfo, overlayType } from '@/kernel';

// TODO: 测试地址
export const previewImage = `${ossEditor}/image/effect_preview.png`;

// TODO: 测试地址
export const previewVideo = `${ossEditor}/video/effect_preview.mov`;

// TODO: 测试地址
export const maskVideo = `${cdnHost}/video/fps/tgs.webm`;

export interface Item {
  title: string;
  id: string;
  picUrl?: string;
  overlayType?: overlayType;
  rt_url?: string;
  effectInfo: EffectInfo;
}

export const mockData: Item[] = [
  {
    effectInfo: {
      sepia: 50,
      hue: 30,
      saturate: 140,
    },
    title: '1977',
    id: '1',
  },
  {
    effectInfo: {
      sepia: 20,
      brightness: 115,
      saturate: 140,
      // maskUrl: maskVideo,
      // resType: 'video',
      background: { r: 125, g: 105, b: 24, a: 0.1 },
      mixBlendMode: 'multiply',
    },
    title: 'aden',
    id: '2',
  },
  {
    effectInfo: {
      sepia: 35,
      contrast: 110,
      brightness: 120,
      saturate: 130,
      background: { r: 125, g: 105, b: 24, a: 0.2 },
      mixBlendMode: 'overlay',
    },
    title: 'amaro',
    id: '3',
  },
  {
    effectInfo: {
      sepia: 50,
      contrast: 120,
      saturate: 180,
      background: { r: 125, g: 105, b: 24, a: 0.35 },
      mixBlendMode: 'lighten',
    },
    title: 'ashby',
    id: '4',
  },
  {
    effectInfo: {
      sepia: 40,
      contrast: 125,
      brightness: 110,
      saturate: 90,
      hue: 358,
    },
    title: 'brannan',
    id: '5',
  },
  {
    effectInfo: {
      sepia: 25,
      contrast: 125,
      brightness: 125,
      hue: 5,
      background: { r: 127, g: 187, b: 227, a: 0.2 },
      mixBlendMode: 'overlay',
    },
    title: 'brooklyn',
    id: '6',
  },
  {
    effectInfo: {
      sepia: 25,
      contrast: 125,
      brightness: 125,
      saturate: 135,
      hue: 5,
      background: { r: 125, g: 105, b: 24, a: 0.25 },
      mixBlendMode: 'darken',
    },
    title: 'charmes',
    id: '7',
  },
  {
    effectInfo: {
      sepia: 15,
      contrast: 125,
      brightness: 125,
      hue: 5,
      background: { r: 127, g: 187, b: 227, a: 0.4 },
      mixBlendMode: 'overlay',
    },
    title: 'clarendon',
    id: '8',
  },
  {
    effectInfo: {
      sepia: 50,
      contrast: 125,
      brightness: 115,
      saturate: 90,
      hue: 358,
      background: { r: 125, g: 105, b: 24, a: 0.2 },
      mixBlendMode: 'multiply',
    },
    title: 'crema',
    id: '9',
  },
  {
    effectInfo: {
      sepia: 35,
      contrast: 150,
      saturate: 110,
    },
    title: 'dogpatch',
    id: '10',
  },
  {
    effectInfo: {
      contrast: 110,
      brightness: 110,
      background: { r: 230, g: 230, b: 230, a: 1 },
      mixBlendMode: 'soft-light',
    },
    title: 'gingham',
    id: '11',
  },
  {
    effectInfo: {
      contrast: 85,
      brightness: 125,
      grayscale: 100,
    },
    title: 'inkwell',
    id: '12',
  },
  {
    effectInfo: {
      sepia: 35,
      contrast: 115,
      brightness: 115,
      saturate: 180,
      background: { r: 127, g: 187, b: 227, a: 0.2 },
      mixBlendMode: 'overlay',
    },
    title: 'juno',
    id: '13',
  },
  {
    effectInfo: {
      contrast: 95,
      brightness: 140,
      saturate: 0,
      sepia: 35,
    },
    title: 'moon',
    id: '14',
  },
  {
    effectInfo: {
      contrast: 125,
      brightness: 120,
      saturate: 90,
      sepia: 75,
    },
    title: 'reyes',
    id: '15',
  },
  {
    effectInfo: {
      sepia: 35,
      contrast: 115,
      brightness: 120,
      saturate: 130,
      background: { r: 125, g: 105, b: 24, a: 0.25 },
      mixBlendMode: 'overlay',
    },
    title: 'vesper',
    id: '16',
  },
  {
    effectInfo: {
      sepia: 35,
      contrast: 80,
      brightness: 125,
      saturate: 140,
      background: { r: 229, g: 240, b: 128, a: 0.5 },
      mixBlendMode: 'darken',
    },
    title: 'walden',
    id: '17',
  },
];
