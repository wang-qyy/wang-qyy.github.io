import type { GradientColor } from "./types";

// 渐变色
export const gradientColors = [
  "linear-gradient(90deg, rgba(34, 84, 244,1) 25.39%, rgba(10, 207, 254,1) 100%)",
  "linear-gradient(90deg, rgba(2, 179, 244,1) 16.53%, rgba(0, 242, 254,1) 100%)",
  "linear-gradient(90deg, rgba(211, 255, 254,1) 0%, rgba(1, 237, 253,1) 100%)",
  "linear-gradient(90deg, rgba(102, 22, 206,1) 0%, rgba(34, 84, 244,1) 100%)",
  "linear-gradient(90deg, rgba(248, 54, 0,1) 0%, rgba(250, 204, 34,1) 100%)",
  "linear-gradient(90deg, rgba(255, 226, 89,1) 0%, rgba(255, 167, 81,1) 100%)",
  "linear-gradient(90deg, rgba(255, 225, 6,1) 0%, rgba(179, 255, 218,1) 100%)",
  "linear-gradient(90deg, rgba(247, 121, 125,1) 0%, rgba(249, 212, 35,1) 95%, rgba(255, 246, 41,1) 100%)",
  "linear-gradient(90deg, rgba(255, 11, 13,1) 0%, rgba(255, 121, 121,1) 100%)",
  "linear-gradient(90deg, rgba(255, 15, 147,1) 0%, rgba(254, 84, 85,1) 82.16%, rgba(245, 68, 68,1) 100%)",
  "linear-gradient(90deg, rgba(252, 92, 125,1) 0%, rgba(255, 251, 213,1) 100%)",
  "linear-gradient(90deg, rgba(255, 15, 147,1) 0%, rgba(196, 113, 237,1) 1%, rgba(246, 79, 89,1) 100%)",
  "linear-gradient(90deg, rgba(17, 153, 142,1) 0%, rgba(56, 239, 125,1) 100%)",
  "linear-gradient(90deg, rgba(171, 255, 203,1) 0%, rgba(0, 226, 104,1) 100%)",
  "linear-gradient(90deg, rgba(97, 255, 156,1) 0%, rgba(95, 175, 250,1) 100%)",
  "linear-gradient(90deg, rgba(140, 244, 190,1) 0%, rgba(250, 255, 209,1) 100%)",
  "linear-gradient(90deg, rgba(44, 241, 253,1) 0%, rgba(154, 192, 129,1) 50%, rgba(249, 149, 22,1) 94%)",
  "linear-gradient(90deg, rgba(48, 34, 238,1) 0%, rgba(143, 20, 128,1) 54%, rgba(236, 7, 19,1) 100%)",
  "linear-gradient(90deg, rgba(18, 214, 223,1) 0%, rgba(134, 113, 239,1) 48%, rgba(247, 15, 255,1) 94%)",
  "linear-gradient(90deg, rgba(30, 150, 0,1) 0%, rgba(255, 242, 0,1) 51%, rgba(243, 41, 53,1) 100%)",
  "linear-gradient(90deg, rgba(217, 255, 255,1) 0%, rgba(255, 232, 180,1) 100%)",
  "linear-gradient(90deg, rgba(217, 255, 255,1) 0%, rgba(255, 232, 179,1) 100%)",

  "linear-gradient(90deg, rgba(255,154,158,1) 0%,  rgba(250,208,196,1) 100%)",
  "linear-gradient(90deg, rgba(161,140,209) 0%,  rgba(251,194,235,1) 100%)",
  "linear-gradient(90deg, rgba(250,208,196,1) 0%,  rgba(255,209,255,1) 100%)",
  "linear-gradient(90deg, rgba(255,154,158,1) 0%,  rgba(254,207,239,1) 100%)",
  "linear-gradient(90deg, rgba(251,194,235,1) 0%,  rgba(166,193,238,1) 100%)",
  "linear-gradient(90deg, rgba(212,252,121,1) 0%,  rgba(150,230,161,1) 100%)",
  "linear-gradient(90deg, rgba(161,196,253,1) 0%,  rgba(194,233,251,1) 100%)",
  "linear-gradient(90deg, rgba(132,250,176,1) 0%,  rgba(143,211,244,1) 100%)",
  "linear-gradient(90deg, rgba(166,192,254,1) 0%,  rgba(246,128,132,1) 100%)",
  "linear-gradient(90deg, rgba(252,203,144,1) 0%,  rgba(213,126,235,1) 100%)",
  "linear-gradient(90deg, rgba(207,217,223,1) 0%,  rgba(226,235,240,1) 100%)",
  "linear-gradient(90deg, rgba(224,195,252,1) 0%,  rgba(142,197,252,1) 100%)",
  "linear-gradient(90deg, rgba(79,172,254,1) 0%,  rgba(0,242,254,1) 100%)",
  "linear-gradient(90deg, rgba(250,112,154,1) 0%,  rgba(254,225,64,1) 100%)",
  "linear-gradient(90deg, rgba(168,237,234,1) 0%,  rgba(254,214,227,1) 100%)",
  "linear-gradient(90deg, rgba(94,231,223,1) 0%,  rgba(180,144,202,1) 100%)",

  "linear-gradient(90deg, rgba(185, 252, 249,1) 0%, rgba(255, 231, 239,1) 100%)",
  "linear-gradient(90deg, rgba(255, 250, 224,1) 0%, rgba(255, 209, 241,1) 100%)",
  "linear-gradient(90deg, rgba(214, 255, 205,1) 0%, rgba(181, 253, 238,1) 100%)",
  "linear-gradient(90deg, rgba(0, 0, 0,1) 26.5%, rgba(255, 255, 255, 0.22) 100%)",
  "linear-gradient(90deg, rgba(0, 0, 0,1) 17.6%, rgba(196, 196, 196, 0) 100%)",
  "linear-gradient(90deg, rgba(190, 190, 190,1) 0%, rgba(0, 0, 0,1) 100%)",
  "linear-gradient(90deg, rgba(48, 67, 82,1) 0%, rgba(215, 210, 204,1) 100%)",
  "linear-gradient(90deg, rgba(203, 166, 77,1) 0%, rgba(237, 205, 91,1) 26.5%, rgba(255, 251, 187,1) 50%, rgba(237, 205, 91,1) 72.3%, rgba(206, 171, 74,1) 100%)",
  "linear-gradient(90deg, rgba(185, 147, 13,1) 0%, rgba(254, 246, 149,1) 50%, rgba(183, 144, 9,1) 100%)",
  "linear-gradient(90deg, rgba(168, 182, 196,1) 0%, rgba(250, 246, 242,1) 53.5%, rgba(168, 182, 196,1) 100%)",
  "linear-gradient(90deg, rgba(104, 116, 125,1) 0%, rgba(240, 240, 240,1) 53.5%, rgba(104, 116, 125,1) 100%)",
];

export const colors: GradientColor[] = [
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(34, 84, 244,1)",
        offset: 0.2539,
      },
      {
        color: "rgba(10, 207, 254,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(2, 179, 244,1)",
        offset: 0.1653,
      },
      {
        color: "rgba(0, 242, 254,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(211, 255, 254,1)",
        offset: 0,
      },
      {
        color: "rgba(1, 237, 253,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(102, 22, 206,1)",
        offset: 0,
      },
      {
        color: "rgba(34, 84, 244,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(248, 54, 0,1)",
        offset: 0,
      },
      {
        color: "rgba(250, 204, 34,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255, 226, 89,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 167, 81,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255, 225, 6,1)",
        offset: 0,
      },
      {
        color: "rgba(179, 255, 218,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(247, 121, 125,1)",
        offset: 0,
      },
      {
        color: "rgba(249, 212, 35,1)",
        offset: 0.95,
      },
      {
        color: "rgba(255, 246, 41,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255, 11, 13,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 121, 121,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255, 15, 147,1)",
        offset: 0,
      },
      {
        color: "rgba(254, 84, 85,1)",
        offset: 0.8216,
      },
      {
        color: "rgba(245, 68, 68,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(252, 92, 125,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 251, 213,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255, 15, 147,1)",
        offset: 0,
      },
      {
        color: "rgba(196, 113, 237,1)",
        offset: 0.01,
      },
      {
        color: "rgba(246, 79, 89,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(17, 153, 142,1)",
        offset: 0,
      },
      {
        color: "rgba(56, 239, 125,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(171, 255, 203,1)",
        offset: 0,
      },
      {
        color: "rgba(0, 226, 104,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(97, 255, 156,1)",
        offset: 0,
      },
      {
        color: "rgba(95, 175, 250,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(140, 244, 190,1)",
        offset: 0,
      },
      {
        color: "rgba(250, 255, 209,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(44, 241, 253,1)",
        offset: 0,
      },
      {
        color: "rgba(154, 192, 129,1)",
        offset: 0.5,
      },
      {
        color: "rgba(249, 149, 22,1)",
        offset: 0.94,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(48, 34, 238,1)",
        offset: 0,
      },
      {
        color: "rgba(143, 20, 128,1)",
        offset: 0.54,
      },
      {
        color: "rgba(236, 7, 19,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(18, 214, 223,1)",
        offset: 0,
      },
      {
        color: "rgba(134, 113, 239,1)",
        offset: 0.48,
      },
      {
        color: "rgba(247, 15, 255,1)",
        offset: 0.94,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(30, 150, 0,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 242, 0,1)",
        offset: 0.51,
      },
      {
        color: "rgba(243, 41, 53,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(217, 255, 255,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 232, 180,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(217, 255, 255,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 232, 179,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255,154,158,1)",
        offset: 0,
      },
      {
        color: "rgba(250,208,196,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(161,140,209)",
        offset: 0,
      },
      {
        color: "rgba(251,194,235,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(250,208,196,1)",
        offset: 0,
      },
      {
        color: "rgba(255,209,255,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255,154,158,1)",
        offset: 0,
      },
      {
        color: "rgba(254,207,239,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(251,194,235,1)",
        offset: 0,
      },
      {
        color: "rgba(166,193,238,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(212,252,121,1)",
        offset: 0,
      },
      {
        color: "rgba(150,230,161,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(161,196,253,1)",
        offset: 0,
      },
      {
        color: "rgba(194,233,251,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(132,250,176,1)",
        offset: 0,
      },
      {
        color: "rgba(143,211,244,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(166,192,254,1)",
        offset: 0,
      },
      {
        color: "rgba(246,128,132,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(252,203,144,1)",
        offset: 0,
      },
      {
        color: "rgba(213,126,235,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(207,217,223,1)",
        offset: 0,
      },
      {
        color: "rgba(226,235,240,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(224,195,252,1)",
        offset: 0,
      },
      {
        color: "rgba(142,197,252,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(79,172,254,1)",
        offset: 0,
      },
      {
        color: "rgba(0,242,254,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(250,112,154,1)",
        offset: 0,
      },
      {
        color: "rgba(254,225,64,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(168,237,234,1)",
        offset: 0,
      },
      {
        color: "rgba(254,214,227,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(94,231,223,1)",
        offset: 0,
      },
      {
        color: "rgba(180,144,202,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(185, 252, 249,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 231, 239,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(255, 250, 224,1)",
        offset: 0,
      },
      {
        color: "rgba(255, 209, 241,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(214, 255, 205,1)",
        offset: 0,
      },
      {
        color: "rgba(181, 253, 238,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(0, 0, 0,1)",
        offset: 0.265,
      },
      {
        color: "rgba(255, 255, 255, 0.22)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(0, 0, 0,1)",
        offset: 0.17600000000000002,
      },
      {
        color: "rgba(196, 196, 196, 0)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(190, 190, 190,1)",
        offset: 0,
      },
      {
        color: "rgba(0, 0, 0,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(48, 67, 82,1)",
        offset: 0,
      },
      {
        color: "rgba(215, 210, 204,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(203, 166, 77,1)",
        offset: 0,
      },
      {
        color: "rgba(237, 205, 91,1)",
        offset: 0.265,
      },
      {
        color: "rgba(255, 251, 187,1)",
        offset: 0.5,
      },
      {
        color: "rgba(237, 205, 91,1)",
        offset: 0.723,
      },
      {
        color: "rgba(206, 171, 74,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(185, 147, 13,1)",
        offset: 0,
      },
      {
        color: "rgba(254, 246, 149,1)",
        offset: 0.5,
      },
      {
        color: "rgba(183, 144, 9,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(168, 182, 196,1)",
        offset: 0,
      },
      {
        color: "rgba(250, 246, 242,1)",
        offset: 0.535,
      },
      {
        color: "rgba(168, 182, 196,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
  {
    coords: {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    },
    colorStops: [
      {
        color: "rgba(104, 116, 125,1)",
        offset: 0,
      },
      {
        color: "rgba(240, 240, 240,1)",
        offset: 0.535,
      },
      {
        color: "rgba(104, 116, 125,1)",
        offset: 1,
      },
    ],
    type: "linear",
  },
];
