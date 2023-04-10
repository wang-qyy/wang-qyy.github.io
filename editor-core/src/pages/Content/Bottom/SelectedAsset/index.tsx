import { useMemo, CSSProperties, useEffect, useState } from 'react';
import {
  useGetCurrentAsset,
  useCurrentTemplate,
  assetBlur,
  getCurrentTimeRange,
  observer,
} from '@hc/editor-core';
import classNames from 'classnames';

import Adjust from './Adjust';
import { useGetUnitWidth } from '../handler';

import './index.less';

function SelectedAsset() {
  const currentAsset = useGetCurrentAsset();
  const { template } = useCurrentTemplate();

  const unitWidth = useGetUnitWidth();

  const [auxiliaryLine, setAuxiliaryLine] = useState<'start' | 'end' | ''>();

  const wrapStyle: CSSProperties = useMemo(() => {
    if (
      !currentAsset ||
      currentAsset.meta.type === '__module' ||
      currentAsset.meta.locked
    ) {
      return { display: 'none' };
    }

    const {
      videoInfo: { allAnimationTimeBySpeed },
    } = template;

    const currentTimeRange = getCurrentTimeRange();

    return {
      width: (allAnimationTimeBySpeed / 1000) * unitWidth - 6,
      transform: `translateX(${(currentTimeRange / 1000) * unitWidth + 4}px)`,
    };
  }, [
    template?.id,
    currentAsset?.meta.id,
    currentAsset?.meta.locked,
    unitWidth,
  ]);

  useEffect(() => {
    assetBlur();
  }, [template?.id]);

  return (
    <div id="bottom_selected_asset" style={{ ...wrapStyle }}>
      <div
        hidden={!auxiliaryLine}
        className={classNames('asset-auxiliary-line', {
          'asset-auxiliary-line-left': auxiliaryLine === 'start',
          'asset-auxiliary-line-right': auxiliaryLine === 'end',
        })}
      />

      {template && currentAsset && !currentAsset.meta.isBackground ? (
        <Adjust
          setAuxiliaryLine={setAuxiliaryLine}
          asset={currentAsset}
          template={template}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default observer(SelectedAsset);
