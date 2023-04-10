import { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { RGBA } from '@hc/editor-core/src/typing';
import SvgColorSelector from './SvgColorSelector';
import BackColorSelector from './BackColorSelector';
import SvgPathFillSelector from './SvgPathFillSelector';
import './index.less';

// 双色
const colors = [
  [
    { r: 0, g: 0, b: 0, a: 1 },
    { r: 68, g: 68, b: 68, a: 1 },
  ],
  [
    { r: 0, g: 0, b: 0, a: 1 },
    { r: 255, g: 255, b: 255, a: 1 },
  ],
  [
    { r: 191, g: 191, b: 191, a: 1 },
    { r: 255, g: 255, b: 255, a: 1 },
  ],
  [
    { r: 255, g: 0, b: 60, a: 1 },
    { r: 255, g: 92, b: 151, a: 1 },
  ],
  [
    { r: 255, g: 0, b: 60, a: 1 },
    { r: 255, g: 204, b: 198, a: 1 },
  ],
  [
    { r: 255, g: 0, b: 60, a: 1 },
    { r: 20, g: 40, b: 196, a: 1 },
  ],
  [
    { r: 251, g: 152, b: 23, a: 1 },
    { r: 255, g: 204, b: 128, a: 1 },
  ],
  [
    { r: 251, g: 152, b: 23, a: 1 },
    { r: 255, g: 248, b: 225, a: 1 },
  ],
  [
    { r: 251, g: 152, b: 23, a: 1 },
    { r: 70, g: 34, b: 221, a: 1 },
  ],
  [
    { r: 255, g: 224, b: 0, a: 1 },
    { r: 251, g: 191, b: 46, a: 1 },
  ],
  [
    { r: 255, g: 224, b: 0, a: 1 },
    { r: 255, g: 253, b: 231, a: 1 },
  ],
  [
    { r: 255, g: 224, b: 0, a: 1 },
    { r: 0, g: 0, b: 0, a: 1 },
  ],
  [
    { r: 109, g: 196, b: 20, a: 1 },
    { r: 242, g: 245, b: 185, a: 1 },
  ],
  [
    { r: 109, g: 196, b: 20, a: 1 },
    { r: 219, g: 255, b: 189, a: 1 },
  ],
  [
    { r: 109, g: 196, b: 20, a: 1 },
    { r: 73, g: 34, b: 196, a: 1 },
  ],
  [
    { r: 0, g: 121, b: 107, a: 1 },
    { r: 165, g: 214, b: 167, a: 1 },
  ],
  [
    { r: 0, g: 121, b: 107, a: 1 },
    { r: 225, g: 242, b: 241, a: 1 },
  ],
  [
    { r: 0, g: 121, b: 107, a: 1 },
    { r: 3, g: 36, b: 38, a: 1 },
  ],
  [
    { r: 54, g: 200, b: 248, a: 1 },
    { r: 25, g: 118, b: 210, a: 1 },
  ],
  [
    { r: 54, g: 200, b: 248, a: 1 },
    { r: 227, g: 242, b: 253, a: 1 },
  ],
  [
    { r: 54, g: 200, b: 248, a: 1 },
    { r: 255, g: 182, b: 206, a: 1 },
  ],
  [
    { r: 60, g: 94, b: 243, a: 1 },
    { r: 27, g: 2, b: 104, a: 1 },
  ],
  [
    { r: 60, g: 94, b: 243, a: 1 },
    { r: 255, g: 255, b: 255, a: 1 },
  ],
  [
    { r: 60, g: 94, b: 243, a: 1 },
    { r: 31, g: 19, b: 71, a: 1 },
  ],
  [
    { r: 140, g: 32, b: 186, a: 1 },
    { r: 255, g: 149, b: 202, a: 1 },
  ],
  [
    { r: 140, g: 32, b: 186, a: 1 },
    { r: 214, g: 189, b: 255, a: 1 },
  ],
  [
    { r: 140, g: 32, b: 186, a: 1 },
    { r: 255, g: 224, b: 0, a: 1 },
  ],
  [
    { r: 21, g: 46, b: 163, a: 1 },
    { r: 54, g: 200, b: 248, a: 1 },
  ],
  [
    { r: 21, g: 46, b: 163, a: 1 },
    { r: 227, g: 242, b: 253, a: 1 },
  ],
  [
    { r: 21, g: 46, b: 163, a: 1 },
    { r: 255, g: 221, b: 125, a: 1 },
  ],
  [
    { r: 247, g: 225, b: 186, a: 1 },
    { r: 199, g: 50, b: 41, a: 1 },
  ],
  [
    { r: 247, g: 225, b: 186, a: 1 },
    { r: 255, g: 211, b: 159, a: 1 },
  ],
  [
    { r: 247, g: 225, b: 186, a: 1 },
    { r: 0, g: 0, b: 0, a: 1 },
  ],
  [
    { r: 62, g: 39, b: 35, a: 1 },
    { r: 121, g: 85, b: 72, a: 1 },
  ],
  [
    { r: 62, g: 39, b: 35, a: 1 },
    { r: 239, g: 235, b: 233, a: 1 },
  ],
  [
    { r: 62, g: 39, b: 35, a: 1 },
    { r: 255, g: 197, b: 93, a: 1 },
  ],
  [
    { r: 79, g: 84, b: 65, a: 1 },
    { r: 226, g: 232, b: 221, a: 1 },
  ],
  [
    { r: 129, g: 60, b: 243, a: 1 },
    { r: 255, g: 92, b: 151, a: 1 },
  ],
  [
    { r: 255, g: 0, b: 60, a: 1 },
    { r: 0, g: 0, b: 0, a: 1 },
  ],
  [
    { r: 255, g: 179, b: 197, a: 1 },
    { r: 255, g: 126, b: 169, a: 1 },
  ],
  [
    { r: 255, g: 179, b: 197, a: 1 },
    { r: 255, g: 231, b: 192, a: 1 },
  ],
  [
    { r: 255, g: 179, b: 197, a: 1 },
    { r: 205, g: 170, b: 242, a: 1 },
  ],
];

// 单色
export const monochrome = [
  'rgb(255, 255, 255)',
  'rgba(204, 204, 204)',
  'rgb(153, 153, 153)',
  'rgb(92, 91, 91)',
  'rgb(68, 68, 68)',
  'rgb(44, 44, 44)',
  'rgb(0, 0, 0)',
  'rgb(255, 217, 198)',
  'rgb(255, 177, 140)',
  'rgb(249, 133, 76)',
  'rgb(221, 151, 117)',
  'rgb(187, 125, 85)',
  'rgb(170, 75, 55)',
  'rgb(183, 27, 28)',
  'rgba(183, 220, 246)',
  'rgba(69, 157, 243)',
  'rgba(1, 123, 255)',
  'rgba(18, 112, 214)',
  'rgba(0, 69, 144)',
  'rgba(27, 88, 254)',
  'rgba(2, 48, 176)',
  'rgba(105, 240, 174)',
  'rgba(0, 230, 118)',
  'rgba(52, 204, 130)',
  'rgba(115, 181, 134)',
  'rgba(90, 133, 30)',
  'rgba(57, 131, 46)',
  'rgba(60, 92, 55)',
  'rgba(197, 195, 255)',
  'rgba(142, 127, 229)',
  'rgba(136, 99, 255)',
  'rgba(121, 63, 234)',
  'rgba(120, 52, 255)',
  'rgba(96, 81, 202)',
  'rgba(71, 56, 179)',
  'rgba(249, 243, 196)',
  'rgba(255, 245, 137)',
  'rgba(254, 222, 0)',
  'rgba(237, 189, 53)',
  'rgba(230, 163, 36)',
  'rgba(255, 184, 0)',
  'rgba(157, 90, 20)',
  'rgba(149, 231, 237)',
  'rgba(97, 219, 228)',
  'rgba(0, 205, 228)',
  'rgba(0, 169, 205)',
  'rgba(22, 157, 186)',
  'rgba(11, 140, 154)',
  'rgba(1, 111, 135)',
];

const ColorSelector = ({
  grid = 7,
  divide = 1,
  onSelect,
}: PropsWithChildren<{
  divide?: number;
  grid?: number;
  onSelect?: (item: Array<RGBA>) => void;
}>) => {
  const getColorSelector = () => {
    switch (divide) {
      case 1:
        return (
          <>
            <div className="box-title">预设颜色</div>
            <div
              className={classNames({
                'grid-box': true,
                'gap-10': true,
                // 'padding-16': true,
                'grid-columns-4': grid === 4,
                'grid-columns-6': grid === 6,
                'grid-columns-7': grid === 7,
              })}
              style={{ flex: 1, padding: '1px' }}
            >
              {monochrome.map((color, index) => (
                <div
                  className="gap-item box-border"
                  style={{ background: color }}
                  key={`color-wrap-${index}`}
                  onClick={() => {
                    const rgb = color.replace(/[^\d,]/g, '').split(',');
                    const tempColor: RGBA = {
                      r: rgb[0],
                      g: rgb[1],
                      b: rgb[2],
                      a: 1,
                    };
                    onSelect && onSelect([tempColor]);
                  }}
                />
              ))}
            </div>
          </>
        );
      case 3:
        return <SvgColorSelector monochrome={monochrome} />;

      case 4:
        return <BackColorSelector monochrome={monochrome} />;
      case 5:
        return <SvgPathFillSelector monochrome={monochrome} />;

      default:
        return (
          <>
            <div className="box-title">预设颜色</div>
            <div
              className={classNames({
                'grid-box': true,
                'gap-10': true,
                // 'padding-16': true,
                'grid-columns-4': grid === 4,
                'grid-columns-6': grid === 6,
              })}
              style={{ flex: 1, padding: '1px' }}
            >
              {colors.map((item, index) => (
                <div
                  className="grid-box grid-columns-2 box-border"
                  key={`color-wrap-${index}`}
                >
                  {item.map((color, i) => (
                    <div
                      key={`color-select-${i}`}
                      className="gap-item"
                      style={{
                        height: 30,
                        background: `rgba(${color.r},${color.g},${color.b},${color.a})`,
                      }}
                      onClick={() => {
                        onSelect && onSelect(item);
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        );
    }
  };
  return <>{getColorSelector()}</>;
};

export default ColorSelector;
