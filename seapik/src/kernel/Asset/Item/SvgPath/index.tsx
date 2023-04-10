import { useMemo } from 'react';
import { AssetItemProps, SvgInfo } from '@/kernel/typing';
import StaticPathSvg from '@/kernel/Components/StaticPathSvg';
import { generatePath, formatToPath } from '@/kernel/utils/svgPath';
import { RGBAToString } from '@/kernel/utils/single';
import { getDefaultSvgInfo } from '@/components/SvgEditor/options';
import { observer } from 'mobx-react';
// import styles from './index.less';

const SvgPath = (props: AssetItemProps) => {
  const { asset } = props;
  const {
    meta: { shapeType },
    attribute: { width, height, svgInfo = getDefaultSvgInfo() },
    id,
  } = asset;

  const {
    stroke,
    strokeDash,
    strokeWidth,
    fill,
    strokeLinecap,
    closed,
    radius,
    pathItems,
  } = svgInfo as SvgInfo;

  // console.log('asset', asset);

  const pathItem = useMemo(() => {
    if (!width || !height || !shapeType) return [];
    if (pathItems) return pathItems;
    return generatePath({
      width,
      height,
      type: shapeType,
      radius,
    });
  }, [width, height, shapeType, radius, pathItems]);

  const path = formatToPath(pathItem, closed);

  // const svgFill = isGradient ?

  const attr = {
    stroke: RGBAToString(stroke),
    strokeDasharray: strokeDash,
    // fill: RGBAToString(fill),
    strokeWidth,
    strokeLinecap,
  };

  return (
    <div
      style={{
        transform: `scaleX(${asset.transform.horizontalFlip ? -1 : 1}) scaleY(${
          asset.transform.verticalFlip ? -1 : 1
        })`,
      }}
    >
      <StaticPathSvg
        path={path}
        width={width}
        height={height}
        fill={fill}
        attr={attr}
        id={id}
      />
    </div>
  );
};

export default observer(SvgPath);
