import { useGetCurrentAsset, observer, isMaskType } from '@hc/editor-core';
import OperationBasicColor from './color';
import OperationBasicFlip from './flip';
import OperationBasicOpacity from './opacity';
import OutlineColor from './outlineColor';
import OutlineStyle from './outlineStyle';
import OutlineWidth from './outlineWidth';
import Volume from './volume';

const OperationBasic = () => {
  const asset = useGetCurrentAsset();
  return (
    <div className="xdd-designer-sider-panel-padding">
      <OperationBasicFlip />
      <OperationBasicOpacity />
      {asset?.meta.type === 'SVG' && (
        <>
          <OperationBasicColor colors={asset?.attribute?.colors} />
          {asset.attribute?.svgStrokes &&
            asset.attribute?.svgStrokes.length === 1 && (
              <>
                <OutlineColor />
                <OutlineStyle />
                <OutlineWidth />
              </>
            )}
        </>
      )}
      {asset &&
        (['video', 'videoE'].includes(asset?.meta.type) ||
          (isMaskType(asset) &&
            asset.assets.length > 0 &&
            ['video', 'videoE'].includes(asset.assets[0]?.meta.type))) && (
          <Volume />
        )}
    </div>
  );
};
export default observer(OperationBasic);
