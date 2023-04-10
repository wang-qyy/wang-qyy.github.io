import { observer } from 'mobx-react';
import classNames from 'classnames';
import React from 'react';

import { setAssetEditStatus } from '@/utils/assetHandler';
import { AssetType } from '@/components/TimeLine/store';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { XiuIcon } from '@/components';

import { clickActionWeblog } from '@/utils/webLog';
import { getRealAsset } from '@/kernel';
import Image from './Image';
import Video from './Video';
import SvgPath from './SvgPath';
import Text from './Text';
import Group from './Group';
import EmptyBg from './EmptyBg';
import styles from './index.less';
import { emptyBgType } from '../../options';

export interface PreviewItemProps {
  asset: AssetType;
  active?: boolean;
}

const Preview: React.FC<PreviewItemProps> = props => {
  const { asset } = props;

  const { source } = asset;
  const sourceAsset = source.asset as AssetItemState | undefined;

  const tempAsset = sourceAsset && getRealAsset(sourceAsset);

  const type: string = tempAsset?.meta.type || asset.source.type || '';
  const attribute = tempAsset?.attribute || ({} as any);
  const { text = [], picUrl, SVGUrl, rt_svgString, rt_preview_url } = attribute;

  const getPreview = () => {
    switch (type) {
      case 'image':
      case 'pic':
      case 'background':
        return <Image src={picUrl || ''} />;
      case 'SVG':
      case 'mask':
        return <Image src={(rt_preview_url ?? SVGUrl) || ''} />;
      case 'lottie':
      case 'videoE':
        return <Image src={rt_preview_url || ''} />;
      case 'text':
        return <Text text={text || ''} />;
      case 'svgPath':
        return <SvgPath shapeType={tempAsset?.meta.shapeType || 'path'} />;
      case 'video':
        if (sourceAsset?.meta.isBackground) {
          return <Video asset={asset} />;
        }
        return <Image src={rt_preview_url || ''} />;
      case 'module':
        return <Group />;
      case emptyBgType:
        return <EmptyBg asset={asset} />;
      default:
        return <div>empty</div>;
    }
  };

  // setAssetEditStatus(getCurrentAsset());
  const setLocked = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAssetEditStatus(source.asset);
    clickActionWeblog('Timeline10');
  };

  const ain = { i: false, o: false };
  if (sourceAsset?.attribute.animation) {
    if (sourceAsset?.attribute.animation.enter.baseId) ain.i = true;
    if (sourceAsset?.attribute.animation.exit.baseId) ain.o = true;
  }

  if (sourceAsset?.attribute.aeA) {
    if (sourceAsset?.attribute.aeA.i.resId) ain.i = true;
    if (sourceAsset?.attribute.aeA.o.resId) ain.o = true;
  }

  return (
    <div className={classNames(styles.previewWrapper, type && styles[type])}>
      {tempAsset?.meta.type && (
        <div
          onClick={setLocked}
          className={classNames(styles.lock, {
            [styles.locked]: tempAsset.meta.locked,
          })}
        >
          <XiuIcon
            type={
              tempAsset.meta.locked
                ? 'iconmdi_lock-outline'
                : 'iconmdi_lock-open-variant-outline'
            }
          />
        </div>
      )}
      <div className={styles.previewAsset}>{getPreview()}</div>
      <div className={styles.aniMark}>
        {ain.i && (
          <div className={styles.aniStart}>
            <div className={styles.line} />
            <XiuIcon type="iconbofang" />
          </div>
        )}
        {ain.o && (
          <div className={styles.aniEnd}>
            <div className={styles.line} />
            <XiuIcon type="iconbofang" />
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(Preview);
