import { QrcodeInfo } from '@/kernel';

import { getQrCodeIconUrl } from '@/components/QrCodeCanvas/icons';

export const qrCodeList: QrcodeInfo[] = [
  {
    foreground: { r: 0, g: 0, b: 0 },
    background: { r: 255, g: 255, b: 255 },
    text: '', // 文本内容
    textType: 'url',
    iconType: undefined,
  },
  {
    foreground: {
      type: 'gradient',
      angle: 45,
      colorStops: [
        { color: { r: 90, g: 76, b: 219 }, offset: 0 },
        { color: { r: 133, g: 74, b: 255 }, offset: 1 },
      ],
      coords: { x1: 0, y1: 0, x2: 0, y2: 0 },
    },
    background: { r: 255, g: 255, b: 255 },
    text: '', // 文本内容
    textType: 'url',
    iconType: undefined,
  },
  {
    foreground: { r: 112, g: 178, b: 91 },
    background: { r: 255, g: 255, b: 255 },
    // TODO: 测试数据
    rt_url: getQrCodeIconUrl('finger'),
    text: '', // 文本内容
    textType: 'url',
    iconType: 'finger',
  },
  {
    foreground: {
      type: 'gradient',
      angle: 45,
      colorStops: [
        { color: { r: 247, g: 181, b: 0 }, offset: 0 },
        { color: { r: 182, g: 32, b: 224 }, offset: 0.5 },
        { color: { r: 50, g: 197, b: 255 }, offset: 1 },
      ],
      coords: { x1: 0, y1: 0, x2: 0, y2: 0 },
    },
    background: { r: 255, g: 255, b: 255 },
    text: '', // 文本内容
    textType: 'url',
    iconType: undefined,
  },
];
