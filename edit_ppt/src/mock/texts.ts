import { Attribute, Transform, Meta, AssetType } from '@/kernel';
export type PosXType = 'left' | 'center' | 'right' | number;
export type PosYType = 'top' | 'middle' | 'bottom' | number;

const DEFAULT_FONT_COLOR = { r: 0, g: 0, b: 0, a: 1 };

export interface TextItemInfo {
  meta: { type: AssetType };
  attribute: Partial<Attribute>;
  transform?: Partial<Transform>;
  assets?: TextItemInfo[];
}

export interface TextPosition {
  posX: PosXType;
  posY: PosYType;
  maxPosY?: number;
}

interface TextItem {
  id: number;
  title: string;
  description: string;
  preview: string;
  info: TextItemInfo[];
  position?: TextPosition;
}

export const commonText: {
  [key: string]: {
    info: TextItemInfo[];
    position?: TextPosition;
    sizeRatio?: number;
  };
} = {
  header: {
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          width: 800,
          height: 73,
          fontSize: 56,
          text: ['Your awesome header text'],
          fontWeight: 'bold',
          color: DEFAULT_FONT_COLOR,
        },
      },
    ],
    position: {
      posX: 'center',
      // posY: 'top',
      posY: 50,
    },
    sizeRatio: 3 / 4,
  },
  text: {
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          fontSize: 42,
          width: 600,
          height: 55,
          text: ['Click twice here to edit text'],
          fontWeight: 'normal',
          color: DEFAULT_FONT_COLOR,
        },
      },
    ],
    position: {
      posX: 'center',
      // posY: 'top',
      posY: 200,
      maxPosY: 1 / 2,
    },
    sizeRatio: 3 / 5,
  },
  caption: {
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          fontSize: 36,
          width: 496,
          height: 47,
          text: ['Your fantastic caption text'],
          fontWeight: 'normal',
          color: DEFAULT_FONT_COLOR,
        },
      },
    ],
    position: {
      posX: 'center',
      // posY: 'bottom',
      posY: 350,
      maxPosY: 2 / 3,
    },
    sizeRatio: 1 / 2,
  },
};

const texts: TextItem[] = [
  {
    id: 1,
    title: 'header',
    preview: '',
    description: '标题',
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          text: ['We are Open'],
          fontSize: 36.4,
          fontWeight: 'bold',
          textAlign: 'center',
          width: 276,
          height: 48,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          writingMode: 'horizontal-tb',
          color: {
            r: 255,
            g: 255,
            b: 255,
            a: 1,
          },
          fontFamily: 'Potta One',
          crop: {
            position: {
              x: 0,
              y: 0,
            },
            size: {
              width: 276,
              height: 54,
            },
          },
          outline: {
            width: 6,
            color: {
              r: 57,
              g: 75,
              b: 243,
              a: 1,
            },
          },
          dropShadow: {
            blur: 8,
            x: 0,
            y: -1,
            spread: 0,
            color: 'rgba(57,75,243,1)',
          },
        },
      },
    ],
  },
  {
    id: 7,
    title: 'Gradient',
    description: '文字渐变',
    preview: '',
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          width: 400,
          height: 78,
          text: ['Example text'],
          fontSize: 60,
          fontWeight: 'bold',
          color: {
            type: 'linear',
            colorStops: [
              {
                color: {
                  r: 200,
                  g: 213,
                  b: 255,
                  a: 1,
                },
                offset: 0,
              },

              {
                color: { r: 0, g: 106, b: 251, a: 1 },
                offset: 1,
              },
            ],
            angle: 90,
            coords: {
              x1: 0,
              y1: 0,
              x2: 1,
              y2: 0,
            },
          },
        },
      },
    ],
  },
  {
    id: 2,
    title: 'shadow',
    description: '文字投影',
    preview: '',
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          text: ['HAPPY ', 'DATE'],
          fontSize: 54.1,
          fontWeight: 'bold',
          textAlign: 'center',
          width: 276,
          height: 141,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          writingMode: 'horizontal-tb',
          color: {
            r: 101,
            g: 240,
            b: 167,
            a: 1,
          },
          fontFamily: 'Taviraj',
          dropShadow: {
            color: 'rgba(101,240,167,1)',
            blur: 9,
            x: 5,
            y: -3,
          },
        },
      },
    ],
  },

  {
    id: 5,
    title: 'rotate',
    description: '字体',
    preview: '',
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          text: ['Stay', 'Fearless'],
          fontSize: 150,
          fontWeight: 'bold',
          textAlign: 'center',
          width: 540,
          height: 390,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          color: DEFAULT_FONT_COLOR,
          fontFamily: 'Dancing Script',
        },
        transform: {
          rotate: 341,
        },
      },
    ],
  },
  {
    id: 6,
    title: 'module',
    preview: '',
    description: '文字组合',
    info: [
      {
        meta: {
          type: 'text',
        },
        attribute: {
          text: ['Save the date'],
          fontSize: 130,
          fontWeight: 'bold',
          textAlign: 'center',
          width: 900,
          height: 170,
          lineHeight: 13,
          letterSpacing: 0,
          color: {
            r: 184,
            g: 159,
            b: 122,
            a: 1,
          },
          fontFamily: 'A39 Pngtree',
        },
        transform: {
          rotate: 0,
          posX: 0,
          posY: 0,
        },
      },
      {
        meta: {
          type: 'text',
        },
        attribute: {
          text: ['krish & ananya'],
          fontSize: 25,
          fontWeight: 'normal',
          textAlign: 'center',
          width: 190,
          height: 33,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          color: {
            r: 184,
            g: 159,
            b: 122,
            a: 1,
          },
        },
        transform: {
          posX: 320,
          posY: 175.87,
          rotate: 0,
        },
      },
      {
        meta: {
          type: 'text',
        },
        attribute: {
          text: ['are getting married'],
          fontSize: 25,
          fontWeight: 'normal',
          textAlign: 'center',
          width: 250.27,
          height: 33,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          color: {
            r: 184,
            g: 159,
            b: 122,
            a: 1,
          },
        },
        transform: {
          posX: 280,
          posY: 218.87,
          rotate: 0,
        },
      },
      {
        meta: {
          type: 'text',
        },
        attribute: {
          text: ['12 - 05 - 2022'],
          fontSize: 25,
          fontWeight: 'normal',
          textAlign: 'center',
          width: 188.87,
          height: 33,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          color: {
            r: 184,
            g: 159,
            b: 122,
            a: 1,
          },
        },
        transform: {
          posX: 310,
          posY: 258.87,
          rotate: 0,
        },
      },
    ],
  },
  {
    id: 8,
    title: 'Outline',
    description: 'Outline',
    preview: '',
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          text: ['Wild'],
          fontSize: 29.16,
          fontWeight: 'normal',
          textAlign: 'center',
          width: 97.73,
          height: 38,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          writingMode: 'horizontal-tb',
          color: DEFAULT_FONT_COLOR,
          fontFamily: 'Spirax',
        },
        transform: {
          posX: 101.13,
          posY: 50.75,
          flipX: false,
          flipY: false,
          rotate: 0,
          zindex: 1,
        },
      },
      {
        meta: { type: 'text' },
        attribute: {
          text: ['UP TO 50% OFF!'],
          fontSize: 23.36,
          fontWeight: 'normal',
          textAlign: 'center',
          width: 180,
          height: 25.76,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          writingMode: 'horizontal-tb',
          color: {
            r: 0,
            g: 0,
            b: 0,
            a: 1,
          },
          fontFamily: 'Cinzel',
        },
        transform: {
          posX: 49.78,
          posY: 225.75,
          flipX: false,
          flipY: false,
          rotate: 0,
        },
      },
      {
        meta: {
          type: 'text',
        },
        attribute: {
          text: ['SALE'],
          fontSize: 101.71,
          fontWeight: 'bold',
          textAlign: 'center',
          width: 281.43,
          height: 133,
          opacity: 100,
          lineHeight: 13,
          letterSpacing: 0,
          writingMode: 'horizontal-tb',
          color: {
            r: 255,
            g: 255,
            b: 255,
            a: 0,
          },
          fontFamily: 'Averia Serif Libre',
          outline: {
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
            width: 4,
          },
        },
        transform: {
          posX: 9.28,
          posY: 83.5,
          flipX: false,
          flipY: false,
          rotate: 0,
          zindex: 4,
        },
      },
    ],
  },
  {
    id: 9,
    title: 'Underline',
    description: '下划线',
    preview: '',
    info: [
      {
        meta: { type: 'text' },
        attribute: {
          width: 400,
          height: 78,
          text: ['Example text'],
          fontSize: 60,
          fontWeight: 'bold',
          color: DEFAULT_FONT_COLOR,
          textDecoration: 'underline',
        },
      },
    ],
  },
];
export default texts;

export const textRes = {
  code: 200,
  data: [
    {
      id: '26',
      image_url:
        'https://png.pngtree.com/edit/asset/6e9a30db38915e29c528e28033e608be.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['Lantern Festival'],
                fontSize: 29.36,
                fontWeight: 'bold',
                textAlign: 'center',
                width: 265.9,
                height: 39,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 255,
                  g: 255,
                  b: 255,
                  a: 1,
                },
                fontFamily: 'Potta One',
                outline: {
                  width: 2,
                  color: {
                    r: 255,
                    g: 17,
                    b: 206,
                    a: 1,
                  },
                },
                dropShadow: {
                  blur: 3,
                  x: 0,
                  y: 0,
                  spread: 0,
                  color: 'rgba(255,66,214,1)',
                },
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 5.05,
                posY: 118.5,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '31',
      image_url:
        'https://png.pngtree.com/edit/asset/771ae50b7823681b47711b42b1eeae0f.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['Thank you for coming!'],
                fontSize: 35.89,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 270.13,
                height: 47,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Allura',
                fontStyle: 'normal',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 2.93,
                posY: 71.23,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 4,
              },
              attribute: {
                text: [
                  'It made me look like a duck in water.',
                  'Life was like a box of chocolates，',
                  "younever know what you're gonna get.",
                ],
                fontSize: 11,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 258.77,
                height: 43,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Montserrat Light',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 8.62,
                posY: 122.23,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 2,
              },
            },
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 5,
              },
              attribute: {
                text: ['HAPPY & Lucky'],
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
                width: 138,
                height: 19,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Montserrat Light',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 69,
                posY: 177.21,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 3,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '32',
      image_url:
        'https://png.pngtree.com/edit/asset/9db79a8eb325fb0985b50b87605c203e.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['Happy', "Mother's", 'Day!'],
                fontSize: 38.88,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 193.47,
                height: 135,
                opacity: 100,
                lineHeight: 11.5,
                letterSpacing: 0.6,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Playfair Display',
                fontStyle: 'normal',
                textDecoration: 'none',
                crop: {
                  position: {
                    x: 0,
                    y: 0,
                  },
                  size: {
                    width: 165.6,
                    height: 44,
                  },
                },
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 41.26,
                posY: 70.5,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 4,
              },
              attribute: {
                text: [
                  'Remember to leave a copy of the romance and',
                  'pampering in this life for your mother.',
                ],
                fontSize: 10,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 248.3,
                height: 26,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0.4,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Playfair Display',
                fontStyle: 'italic',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 13.85,
                posY: 37.2,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 2,
              },
            },
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 5,
              },
              attribute: {
                text: ['All the love from mother'],
                fontSize: 10,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 138,
                height: 13,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Playfair Display',
                fontStyle: 'normal',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 69,
                posY: 222.45,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 3,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '33',
      image_url:
        'https://png.pngtree.com/edit/asset/684fab809518aa0c9f328bafe287dc0c.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['New year'],
                fontSize: 80.69,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 272.26,
                height: 105,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 244,
                  g: 227,
                  b: 77,
                  a: 1,
                },
                fontFamily: 'Sacramento',
                crop: {
                  position: {
                    x: 0,
                    y: 0,
                  },
                  size: {
                    width: 165.6,
                    height: 16,
                  },
                },
                dropShadow: {
                  blur: 0,
                  x: 1,
                  y: 2,
                  spread: 0,
                  color: 'rgba(239,0,151,1)',
                },
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 1.87,
                posY: 85.5,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '34',
      image_url:
        'https://png.pngtree.com/edit/asset/4d37507717094f81f060d286c43b0a07.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['happy Birthday'],
                fontSize: 35.8,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 275.26,
                height: 47,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  coords: {
                    x1: 0,
                    y1: 1,
                    x2: 0,
                    y2: 0,
                  },
                  colorStops: [
                    {
                      color: {
                        r: 94,
                        g: 178,
                        b: 252,
                        a: 1,
                      },
                      offset: 0,
                    },
                    {
                      color: {
                        r: 18,
                        g: 115,
                        b: 235,
                        a: 1,
                      },
                      offset: 0.95,
                    },
                  ],
                  angle: 90,
                  type: 'linear',
                },
                fontFamily: 'Elsie Black',
                dropShadow: [],
                fontStyle: 'normal',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 0.37,
                posY: 114.5,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '35',
      image_url:
        'https://png.pngtree.com/edit/asset/9b4c3f985f60b88d3936eacbfe79cfda.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['Happy', 'Birthday!'],
                fontSize: 65.67,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 266.01,
                height: 217,
                opacity: 100,
                lineHeight: 11,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Lobster',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 7.27,
                posY: 78.18,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 4,
              },
              attribute: {
                text: ['remember to eat birthday cake'],
                fontSize: 14,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 220.82,
                height: 19,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'Roboto',
                crop: {
                  position: {
                    x: 0,
                    y: 0,
                  },
                  size: {
                    width: 207,
                    height: 12,
                  },
                },
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 27.59,
                posY: 53.26,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 2,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '36',
      image_url:
        'https://png.pngtree.com/edit/asset/bc75f14e4d1dbf82d278f7259fff0721.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['December'],
                fontSize: 65.35,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 271.17,
                height: 85,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 255,
                  g: 110,
                  b: 177,
                  a: 1,
                },
                fontFamily: 'A12 Pngtree',
                dropShadow: {
                  blur: 0,
                  x: 1,
                  y: 1,
                  spread: 0,
                  color: 'rgba(116,0,116,1)',
                },
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 2.41,
                posY: 95.5,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '37',
      image_url:
        'https://png.pngtree.com/edit/asset/fcb68ffafdc6e65b97215fd948b485fb.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['cactus'],
                fontSize: 62.13,
                fontWeight: 'normal',
                textAlign: 'center',
                width: 260.77,
                height: 81,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 28,
                  g: 133,
                  b: 0,
                  a: 1,
                },
                fontFamily: 'A25 Pngtree',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 7.62,
                posY: 97.5,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
    {
      id: '41',
      image_url:
        'https://png.pngtree.com/edit/asset/31a508345576c6159958fecab4074849.png',
      doc: {
        assets: [
          [
            {
              meta: {
                locked: false,
                index: 0,
                name: '',
                type: 'text',
                id: 3,
              },
              attribute: {
                text: ['Happy New Year'],
                fontSize: 43.32,
                fontWeight: 'bold',
                textAlign: 'center',
                width: 270.53,
                height: 57,
                opacity: 100,
                lineHeight: 13,
                letterSpacing: 0,
                writingMode: 'horizontal-tb',
                color: {
                  r: 255,
                  g: 93,
                  b: 211,
                  a: 1,
                },
                fontFamily: 'Dancing Script',
                dropShadow: {
                  blur: 6,
                  x: 4,
                  y: 2,
                  spread: 0,
                  color: 'rgba(255,73,235,1)',
                },
                outline: {
                  width: 0,
                  color: {
                    r: 255,
                    g: 17,
                    b: 206,
                    a: 1,
                  },
                },
                fontStyle: 'normal',
                textDecoration: 'none',
                startTime: 0,
                endTime: 100,
              },
              transform: {
                posX: 2.74,
                posY: 109.5,
                flipX: false,
                flipY: false,
                rotate: 0,
                zindex: 1,
              },
            },
          ],
        ],
        width: 276,
        height: 276,
        scale: 1.8,
      },
      online: '1',
    },
  ],
};
