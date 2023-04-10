import { ossEditor } from '@/config/urls';

const commonQrCodeIcon = [
  'wx',
  'wx2',
  'alipay',
  'qq',
  'wb',
  'tb',
  'finger',
  'home',
  'contact',
  'link',
];

export function getQrCodeIconUrl(iconType?: string) {
  return iconType ? `${ossEditor}/third-icon/${iconType}.png` : '';
}
export const imgs = commonQrCodeIcon.map((icon) => ({
  iconType: icon,
  url: getQrCodeIconUrl(icon),
}));
