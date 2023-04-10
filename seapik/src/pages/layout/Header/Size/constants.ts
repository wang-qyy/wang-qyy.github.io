type SizeUnit = 'px' | 'mm';

export interface SizeItem {
  key: string;
  label: string;
  width: number;
  height: number;
  unit: SizeUnit;
  icon: string;
}

// 画布尺寸
export const SIZE: SizeItem[] = [
  {
    key: 'pinterest',
    label: 'Pinterest pin',
    width: 1000,
    height: 1500,
    unit: 'px',
    icon: 'iconpnterest',
  },
  {
    key: 'YoutubeThumbnail',
    label: 'Youtube thumbnail',
    width: 1280,
    height: 720,
    icon: 'iconyutube',
    unit: 'px',
  },
  {
    key: 'twitter',
    label: 'Twitter Header',
    width: 1500,
    height: 500,
    icon: 'icontwitter',
    unit: 'px',
  },
  {
    key: 'FacebookCovers',
    label: 'Facebook Covers',
    width: 851,
    height: 315,
    icon: 'iconfacebook',
    unit: 'px',
  },
  {
    key: 'FacebookSquarePost',
    label: 'Facebook Square Post',
    width: 1200,
    height: 1200,
    icon: 'iconfacebook',
    unit: 'px',
  },

  {
    key: 'YoutubeChannelArt',
    label: 'Youtube Channel Art',
    width: 2560,
    height: 1440,
    icon: 'iconyutube',
    unit: 'px',
  },

  {
    key: 'InstagramStores',
    label: 'Instagram Stores',
    width: 1080,
    height: 1920,
    icon: 'iconinstagramStories',
    unit: 'px',
  },

  {
    key: 'instagram',
    label: 'Instagram Post',
    width: 1080,
    height: 1080,
    icon: 'iconinstagram',
    unit: 'px',
  },

  {
    key: 'Desktop',
    label: 'Desktop Wallpaper',
    width: 1920,
    height: 1080,
    icon: 'icondesktop',
    unit: 'px',
  },
];
