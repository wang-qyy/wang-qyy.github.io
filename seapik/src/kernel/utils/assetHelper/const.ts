import { Shadow, Outline, GradientColor } from '@/kernel/typing';

export const VIDEO_TYPES = ['video', 'videoE'];
export const IMAGE_TYPES = ['image'];
export const DEFAULT_FONT_SIZE = 100;
export const DEFAULT_SVG_STRING = `<svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 830 830" enable-background="new 0 0 830 830" xml:space="preserve">
   <g>
     <defs>
       <rect id="SVGID_1_1526035162" width="830" height="830"/>
     </defs>
     <clipPath id="SVGID_2_1526035162">
       <use xlink:href="#SVGID_1_1526035162"  overflow="visible"/>
     </clipPath>
     <g transform="matrix(1 0 0 1 -1.525879e-05 0)" clip-path="url(#SVGID_2_1526035162)">
         <image overflow="visible" width="3898" height="2480" xlink:href="https://js.tuguaishou.com/index_img/editorV6.0/containerBg.jpg"  transform="matrix(0.3536 0 0 0.3536 -230.5513 -27.1287)">
       </image>
     </g>
   </g>
</svg>`;
export const CANT_SET_TEXT_ANIMATION = [
  25, 48, 21, 12, 56, 4, 10, 49, 50, 24, 46, 47, 9, 45, 41, 20, 5, 18, 37, 16,
  38, 39, 40, 55, 54, 65, 51,
];
export const EFFECT_COLORFUL_LINEAR = [
  3, 4, 6, 7, 8, 10, 12, 13, 14, 28, 28, 29, 35, 37, 39, 43, 45, 57, 61, 62, 70,
  81, 82, 83, 84,
];

export const DEFAULT_SHADOW: Shadow = {
  blur: 0,
  x: 0,
  y: 0,
  spread: 0,
  color: '#000',
};

export const DEFAULT_OUTLINE: Outline = {
  color: { r: 0, g: 0, b: 0, a: 1 },
  width: 3,
};

export const DEFAULT_GRADIENT_COLOR: GradientColor = {
  coords: {
    x1: 0,
    y1: 0.3420201433256687,
    x2: 0.9396926207859084,
    y2: 0,
  },
  colorStops: [
    {
      color: {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      },
      offset: 0,
    },
    {
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      },
      offset: 1,
    },
  ],
  angle: 20,
  type: 'linear',
};
