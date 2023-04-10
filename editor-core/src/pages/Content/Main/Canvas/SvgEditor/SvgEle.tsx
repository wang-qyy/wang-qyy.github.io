import React, { useLayoutEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { Filters } from '@/kernel/typing';
import { defaultFilters } from '@/kernel/utils/const';

const strokeWidth = 1;
const radio = 0.552284749831;

const SvgEle = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  // getBBox

  useLayoutEffect(() => {
    if (!svgRef.current) return;
    console.log('getBBox', svgRef.current?.getBBox());
    const { width, height, x, y } = svgRef.current?.getBBox();

    const W = width + x;
    const H = height + y;

    svgRef.current.setAttribute('width', `${W}px`);
    svgRef.current.setAttribute('height', `${H}px`);

    svgRef.current.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }, []);

  return (
    <span
      style={{
        position: 'absolute',
        left: 20,
        top: 20,
        padding: strokeWidth,
      }}
    >
      <svg
        ref={svgRef}
        // version="1.1"
        style={{
          overflow: 'inherit',
        }}
        // preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        // xmlns="http://www.w3.org/2000/svg"
        // xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g>
          <path
            strokeWidth={strokeWidth}
            d={`M 20 0
            C ${20 + 20 * radio} 0, 40 ${20 - 20 * radio}, 40 20
            C 40 ${20 + 20 * radio}, ${20 + 20 * radio} 40, 20 40
            C ${20 - 20 * radio} 40, 0 ${20 + 20 * radio}, 0 20
            C 0 ${20 - 20 * radio}, ${20 - 20 * radio} 0, 20 0
            `}
            strokeDasharray="none"
            stroke="black"
            fill="transparent"
          />
        </g>
      </svg>
    </span>
  );
};

SvgEle.defaultProps = {
  filters: undefined,
  preset: undefined,
};

export default observer(SvgEle);
