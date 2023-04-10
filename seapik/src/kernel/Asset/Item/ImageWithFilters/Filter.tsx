import React from 'react';
import { observer } from 'mobx-react';
import { Filters } from '@/kernel/typing';
import { defaultFilters } from '@/kernel/utils/const';

interface IProps {
  filters?: Partial<Filters>;
  filterId: string;
}

const Filter = (props: IProps) => {
  const { filters = {}, filterId } = props;

  const {
    blur,
    brightness,
    contrast,
    gammaR,
    gammaG,
    gammaB,
    hue,
    saturate,
    grayscale,
  } = { ...defaultFilters, ...filters };

  // const filterId = `${blur}_${brightness}_${contrast}_${gammaR}_${gammaG}_${gammaB}_${hue}_${saturate}_${grayscale}`;

  return (
    <filter id={filterId} colorInterpolationFilters="linearRGB">
      {/* 模糊 */}
      <feGaussianBlur stdDeviation={`${blur} ${blur}`} />
      {/* 色相 */}
      <feColorMatrix type="hueRotate" values={`${hue}`} />
      {/* 色调 gamma-r gamma-g gamma-b */}
      <feComponentTransfer>
        <feFuncR type="gamma" amplitude={gammaR} exponent="1" offset="0" />
        <feFuncG type="gamma" amplitude={gammaG} exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude={gammaB} exponent="1" offset="0" />
        <feFuncA type="gamma" amplitude="1" exponent="1" offset="0" />
      </feComponentTransfer>
      {/* 饱和度 */}
      <feColorMatrix type="saturate" values={`${saturate}`} />
      {/* 亮度 */}
      <feComponentTransfer>
        <feFuncR type="linear" slope={brightness} />
        <feFuncG type="linear" slope={brightness} />
        <feFuncB type="linear" slope={brightness} />
      </feComponentTransfer>
      {/* 对比度 */}
      <feComponentTransfer>
        <feFuncR
          type="linear"
          slope={contrast}
          intercept={-(0.5 * contrast) + 0.5}
        />
        <feFuncG
          type="linear"
          slope={contrast}
          intercept={-(0.5 * contrast) + 0.5}
        />
        <feFuncB
          type="linear"
          slope={contrast}
          intercept={-(0.5 * contrast) + 0.5}
        />
      </feComponentTransfer>
      {/* 灰度 */}
      <feColorMatrix
        type="matrix"
        values={`${0.2126 + 0.7874 * (1 - grayscale)} ${
          0.7152 - 0.7152 * (1 - grayscale)
        } ${0.0722 - 0.0722 * (1 - grayscale)} 0 0
                       ${0.2126 - 0.2126 * (1 - grayscale)} ${
          0.7152 + 0.2848 * (1 - grayscale)
        } ${0.0722 - 0.0722 * (1 - grayscale)} 0 0
                       ${0.2126 - 0.2126 * (1 - grayscale)} ${
          0.7152 - 0.7152 * (1 - grayscale)
        } ${0.0722 + 0.9278 * (1 - grayscale)} 0 0
                       0 0 0 1 0`}
      />
    </filter>
  );
};

Filter.defaultProps = {
  filters: {},
};

export default observer(Filter);
