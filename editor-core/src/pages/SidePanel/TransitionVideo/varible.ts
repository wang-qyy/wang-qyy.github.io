import { cdnHost, ossEditor } from '@/config/urls';

export const TRANSTION_ANIMATION_LIST: any[] = [
  // {
  //   name: '白色圆形螺旋转场',
  //   key: '',
  //   animation: null,
  //   asset_type: 'lottie',
  //   description: '水墨 笔刷 转场 毛笔 中国风 动画 元素 Lottie',
  //   frame_rate: 30,
  //   gid: 'LP42',
  //   height: 1080,
  //   id: 42,
  //   init_state: 2,
  //   preview:
  //     'https://img3.xiudodo.com/designer_upload_lottie_preview/15/66/88/96/10/2c/2c442710052f78bb2ff8b649e4b57a0f.png!w300_s?auth_key=1662622800-0-0-c344ae396895d71f9776df0b7bf5badb',
  //   sample:
  //     'https://img2.xiudodo.com/designer_upload_lottie/15/66/88/96/03/8f/8fbbe55c1707d675526ca8ca748b49e4.json?auth_key=1662622800-0-0-ad2be161542c7807bba681dceaa4d981',
  //   title: '白色圆形螺旋转场',
  //   total_frame: 30,
  //   width: 1920,
  // },
  // {
  //   name: '秀多多四边形',
  //   key: '',
  //   animation: null,
  //   asset_type: 'lottie',
  //   description: '秀多多',
  //   frame_rate: 30,
  //   gid: 'LP2000274',
  //   height: 1080,
  //   id: 2000274,
  //   init_state: 2,
  //   preview:
  //     'https://img2.xiudodo.com/lottie-uploads/2022-09-08/70f66ef8-0805-3c6c-86b6-c84e397b3388.png!w300_s?auth_key=1662622800-0-0-c3de5de9e45424235914986b43175d7f',
  //   sample:
  //     'https://img3.xiudodo.com/lottie-uploads/2022-09-08/70f66ef8-0805-3c6c-86b6-c84e397b3388.json?auth_key=1662622800-0-0-3557aa66d692bb6ee9d7078e669b2654',
  //   title: '秀多多四边形',
  //   total_frame: 30,
  //   width: 1920,
  // },
  // {
  //   name: '水墨笔刷转场',
  //   key: '',
  //   animation: null,
  //   asset_type: 'lottie',
  //   description: '水墨 笔刷 转场 毛笔 中国风 动画 元素 Lottie',
  //   frame_rate: 30,
  //   gid: 'LP55',
  //   height: 1080,
  //   id: 55,
  //   init_state: 2,
  //   preview:
  //     'https://img1.xiudodo.com/designer_upload_lottie_preview/15/66/99/11/16/ce/cef55ce9e09c9e93356bcd0ae2dc5b88.png!w300_s?auth_key=1662381000-0-0-60b39a0e978ec63f80aa4767c476f472',
  //   sample:
  //     'https://img3.xiudodo.com/designer_upload_lottie/15/66/99/11/10/a4/a430f8de5fa4bea6166dd2418a70c752.json?auth_key=1662381000-0-0-6f7c2ae85f3daa6b239f35f1bb2f5789',
  //   title: '水墨笔刷转场',
  //   total_frame: 90,
  //   width: 1920,
  // },
  // {
  //   name: '翻转的星星转场',
  //   key: '',
  //   animation: null,
  //   asset_type: 'lottie',
  //   description: '旋转 星星 转场 白色 动画 元素 Lottie ',
  //   frame_rate: 30,
  //   gid: 'LP53',
  //   height: 1080,
  //   id: 53,
  //   init_state: 2,
  //   preview:
  //     'https://img1.xiudodo.com/designer_upload_lottie_preview/15/66/97/58/09/33/3349cda2c4e26544fbcf6862dd44e969.png!w300_s?auth_key=1662373800-0-0-c7b68566bf3390673fc77e9abfb0003a',
  //   sample:
  //     'https://img2.xiudodo.com/designer_upload_lottie/15/66/97/58/02/db/db8b2ea15b132d10c38b107cdf067b93.json?auth_key=1662373800-0-0-7df6add282e58cbc48a4347d8e757b96',
  //   title: '翻转的星星转场',
  //   total_frame: 60,
  //   width: 1920,
  // },
  {
    name: '从左移入',
    key: 'moveIntoLeft',
    videoUrl: `${ossEditor}/transition/moveLeft.mp4`,
    imageUrl: `${ossEditor}/transition/moveLeft.png`,
    animation: {
      exit: {
        baseId: 1,
        duration: 0,
        details: {
          direction: 2,
        },
      },
      enter: {
        baseId: 1,
        duration: -1,
        details: {
          direction: 2,
        },
      },
    },
    total_frame: 30,
    asset_type: 'plain',
  },
  {
    name: '从右移入',
    key: 'moveIntoRight',
    videoUrl: `${ossEditor}/transition/moveRight.mp4`,
    imageUrl: `${ossEditor}/transition/moveRight.png`,
    animation: {
      exit: {
        baseId: 1,
        duration: 0,
        details: {
          direction: 4,
        },
      },
      enter: {
        baseId: 1,
        duration: -1,
        details: {
          direction: 4,
        },
      },
    },
    total_frame: 30,
    asset_type: 'plain',
  },
  {
    name: '从上移入',
    key: 'moveIntoTop',
    videoUrl: `${ossEditor}/transition/moveTop.mp4`,
    imageUrl: `${ossEditor}/transition/moveTop.png`,
    animation: {
      exit: {
        baseId: 1,
        duration: 0,
        details: {
          direction: 3,
        },
      },
      enter: {
        baseId: 1,
        duration: -1,
        details: {
          direction: 3,
        },
      },
    },
    total_frame: 30,
    asset_type: 'plain',
  },
  {
    name: '从下移入',
    key: 'moveIntoBottom',
    videoUrl: `${ossEditor}/transition/moveBottom.mp4`,
    imageUrl: `${ossEditor}/transition/moveBottom.png`,
    animation: {
      exit: {
        baseId: 1,
        duration: 0,
        details: {
          direction: 1,
        },
      },
      enter: {
        baseId: 1,
        duration: -1,
        details: {
          direction: 1,
        },
      },
    },
    total_frame: 30,
    asset_type: 'plain',
  },
  {
    name: '淡入淡出',
    key: 'fadeIn',
    videoUrl: `${ossEditor}/transition/fade.mp4`,
    imageUrl: `${ossEditor}/transition/fade.png`,
    animation: {
      exit: {
        baseId: 3,
        duration: -1,
        details: {
          direction: -1,
        },
      },
      enter: {
        baseId: 3,
        duration: 0,
        details: {
          direction: -1,
        },
      },
    },
    total_frame: 30,
    asset_type: 'plain',
  },
  {
    name: '放大',
    key: 'fadeIn',
    videoUrl: `${ossEditor}/transition/enlarge.mp4`,
    imageUrl: `${ossEditor}/transition/enlarge.png`,
    animation: {
      exit: {
        baseId: 2,
        duration: -1,
        details: {
          direction: -1,
        },
      },
      enter: {
        baseId: 2,
        duration: 0,
        details: {
          direction: -1,
        },
      },
    },
    total_frame: 30,
    asset_type: 'plain',
  },
  {
    name: '缩小',
    key: 'fadeOut',
    videoUrl: `${ossEditor}/transition/reducec.mp4`,
    imageUrl: `${ossEditor}/transition/reduce.png`,
    animation: {
      exit: {
        baseId: 2,
        duration: 0,
        details: {
          direction: -1,
        },
      },
      enter: {
        baseId: 2,
        duration: -1,
        details: {
          direction: -1,
        },
      },
    },
    total_frame: 30,
    asset_type: 'plain',
  },
  // {
  //   name: '缩放-放大',
  //   key: 'circle',
  //   animation: null,
  //   total_frame: 30,
  //   asset_type: 'plain',
  //   transition: {
  //     key: 'CIRCLE',
  //     type: 'Enlarge',
  //   },
  // },
  // {
  //   name: '缩放-缩小',
  //   key: 'circle',
  //   animation: null,
  //   total_frame: 30,
  //   asset_type: 'plain',
  //   transition: {
  //     key: 'CIRCLE',
  //     type: 'Reduce',
  //   },
  // },
];
