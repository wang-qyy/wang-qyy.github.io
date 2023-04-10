import { GradientColor, RGBA } from '@/kernel/typing';
import { assetIdPrefix } from '@/kernel/utils/const';
import { RGBAToString } from '@/kernel/utils/single';
import { SVGProps } from 'react';
import { getId } from './options';

const StaticPathSvg = (props: {
  width: number;
  height: number;
  path: string;
  fill: RGBA | GradientColor;
  attr: SVGProps<SVGPathElement>;
  id?: number;
}) => {
  const { width, height, path, attr, fill, id } = props;
  const gradientFill = fill as GradientColor;
  const { x1, y1, x2, y2 } = gradientFill.coords || {};
  const isGradient = !!gradientFill.colorStops;
  const fillId = isGradient ? getId(gradientFill) : '';
  const color = isGradient ? `url(#${fillId})` : RGBAToString(fill as RGBA);

  const scaleX = 1 - (Number(attr.strokeWidth) || 0) / width;
  const scaleY = 1 - (Number(attr.strokeWidth) || 0) / height;

  return (
    <div style={{ width, height }}>
      <svg
        // version="1.1"
        data-asset-id={`${assetIdPrefix}${id}`}
        style={{
          overflow: 'inherit',
          verticalAlign: 'top',
        }}
        width={width}
        height={height}
        preserveAspectRatio="none"
        // viewBox={`0 0 100 100`}
        // xmlns="http://www.w3.org/2000/svg"
        // xmlns="http://www.w3.org/2000/svg"
        // xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        {isGradient && (
          <linearGradient id={fillId} x1={x1} y1={y1} x2={x2} y2={y2}>
            {gradientFill.colorStops.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                style={{ stopColor: RGBAToString(stop.color) }}
              />
            ))}
          </linearGradient>
        )}
        {/* <g>
          <path
            style={{
              vectorEffect: 'non-scaling-stroke',
              transformOrigin: 'center',
            }}
            // transform={`scale(${scaleX} ${scaleY})`}
            d={path}
            {...attr}
            strokeWidth={0}
          />
        </g> */}
        <g>
          <path
            style={{
              vectorEffect: 'non-scaling-stroke',
              transformOrigin: 'center',
            }}
            transform={`scale(${scaleX} ${scaleY})`}
            d={path}
            {...attr}
            fill={color}
          />
        </g>
      </svg>
    </div>
  );
};

StaticPathSvg.defaultProps = {
  id: undefined,
};

export default StaticPathSvg;
