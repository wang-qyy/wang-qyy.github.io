import {
  useReplaceStatusByObserver,
  AssetClass,
  useGetCurrentAsset,
  useMaskClipByObserver,
  observer,
  useRotateStatusByObserver,
  useMoveStatusByObserver,
  getEditAsset,
} from '@hc/editor-core';

import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';

// import classNames from 'classnames';
import AssetItemState from '@/kernel/store/assetHandler/asset';

import { useCheckLoginStatus } from '@/hooks/loginChecker';
import styles from './index.modules.less';
import { checkCanReplace } from '../utils';
import StaticButton from './StaticButton';
// import { comOptions } from './options';

interface ActionHelperProps {
  asset: AssetClass;
  activeAsset: AssetClass;
  containerSizeScale: { width: number; height: number };
  assetPositionScale: { left: number; top: number };
}

const ActionHelper = observer(
  ({
    asset,
    activeAsset,
    containerSizeScale,
    assetPositionScale,
  }: ActionHelperProps) => {
    const { meta, assets } = asset;

    const replaced =
      meta.replaced || (meta.type === 'mask' && assets[0]?.meta.replaced);

    const { checkLoginStatus } = useCheckLoginStatus();
    const { startReplace } = useReplaceStatusByObserver();
    const { startMask } = useMaskClipByObserver();

    const style = {
      ...containerSizeScale,
      left: Math.max(assetPositionScale.left, 0),
      top: Math.max(activeAsset.auxiliary.vertical.start - 50, 0),
    };

    const options = [
      {
        key: 'replace',
        text: '替换',
        iconType: 'beijingtihuan',
        show: true,
        onClick: () => {
          if (!checkLoginStatus()) {
            startReplace();
            clickActionWeblog('concise3');
          }
        },
      },
      {
        key: 'mask-clip',
        show: replaced,
        iconType: 'tailoring',
        text: '裁剪',
        onClick: () => {
          startMask();
          clickActionWeblog('concise25');
        },
      },
    ];

    return (
      <>
        <div className={styles.ActionHelper} style={{ ...style }}>
          <div className={styles.content} onMouseDown={stopPropagation}>
            {options
              .filter(t => t.show)
              .map(record => {
                const { iconType, text, onClick, key } = record;
                return (
                  <StaticButton
                    key={key}
                    text={text}
                    iconType={iconType}
                    onClick={onClick!}
                  />
                );
              })}
          </div>
        </div>
      </>
    );
  },
);

const ReplaceActions = () => {
  const editAsset = useGetCurrentAsset();
  const activeAsset = getEditAsset() as AssetItemState;
  const { inRotating } = useRotateStatusByObserver();
  const inMoving = useMoveStatusByObserver();
  const { inMask } = useMaskClipByObserver();
  const isLocked = editAsset?.meta.locked;
  const { assetPositionScale, containerSizeScale } = activeAsset || {};
  const canReplace = editAsset && checkCanReplace(editAsset);

  return (
    <>
      {editAsset &&
        activeAsset &&
        canReplace &&
        !inMask &&
        !inRotating &&
        !inMoving &&
        !isLocked && (
          <ActionHelper
            asset={editAsset}
            activeAsset={activeAsset}
            containerSizeScale={containerSizeScale}
            assetPositionScale={assetPositionScale}
          />
        )}
    </>
  );
};

export default observer(ReplaceActions);
