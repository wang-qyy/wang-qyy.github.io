import { ReactNode } from 'react';

interface typeProps {
  key: string;
  mapKey: string;
  title: string | ReactNode;
  classify?: boolean;
}
export const MaterialTypeList: Array<typeProps> = [
  { key: 'icon', title: '二维码', mapKey: 'preview', classify: true },
  { key: 'shape', title: '矢量图形', mapKey: 'preview', classify: true },
  { key: 'td', title: '3D元素', mapKey: 'preview', classify: true },
  { key: 'png', title: 'PNG元素', mapKey: 'preview', classify: true },
  { key: 'lottie', title: 'lottie动图', mapKey: 'sample', classify: true },
  { key: 'gif', title: 'GIF表情包', mapKey: 'sample' },
  { key: 'video', title: '视频动图', mapKey: 'sample', classify: true },
];

export const requestCatalogUrl = {
  icon: {
    title: '二维码',
    mapKey: 'preview',
    url: '/creator-api/resource/mix-material',
  },
  shape: {
    title: '矢量图形',
    mapKey: 'preview',
    url: '/label-api/material-svg',
  },
  td: {
    title: '3D元素',
    mapKey: 'preview',
    url: '/resource-api/sub-filters?filter_id=1230825',
  },
  png: {
    url: '/label-api/material-png',
    title: 'PNG元素',
    mapKey: 'preview',
  },
  lottie: {
    url: '/label-api/material-lottie',
    title: 'lottie动图',
    mapKey: 'preview',
  },
  gif: {
    title: 'GIF表情包',
    mapKey: 'sample',
  },
  video: {
    url: '/label-api/material-video',
    title: '视频动图',
    mapKey: 'sample',
  },
  image: {
    title: '图片',
    mapKey: 'preview',
  },
};

export const requestUrl = {
  icon: {
    title: '二维码',
    mapKey: 'preview',
    url: '/creator-api/resource/mix-material',
  },
  shape: {
    url: '/creator-api/resource/material-shape',
    title: '矢量图形',
    mapKey: 'preview',
  },

  td: {
    url: '/creator-api/resource/material-td',
    title: '3D元素',
    mapKey: 'preview',
  },
  png: {
    url: '/creator-api/resource/material-png',
    title: 'PNG元素',
    mapKey: 'preview',
  },
  lottie: {
    url: '/creator-api/resource/material-lottie',
    title: 'lottie动图',
    mapKey: 'preview',
  },
  gif: {
    url: '/creator-api/resource/material-gif',
    title: 'GIF表情包',
    mapKey: 'sample',
  },
  video: {
    url: '/creator-api/resource/material-video',
    title: '视频动图',
    mapKey: 'sample',
  },
  image: {
    url: '/creator-api/resource/material-image',
    title: '图片',
    mapKey: 'preview',
  },
  svg: {
    url: '/creator-api/resource/material-svg',
    title: 'svg',
    mapKey: 'preview',
  },
  mask: {
    url: '/creator-api/resource/material-mask',
    title: '蒙版',
    mapKey: 'preview',
  },
};
