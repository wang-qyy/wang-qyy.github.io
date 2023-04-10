import { observer } from 'mobx-react';
import { Button } from 'antd';
import classNames from 'classnames';

import {
  useFlipX,
  useFlipY,
  useCurrentTemplate,
  getAllAsset,
  useAssetCrop,
  getCurrentTemplate,
  updateCanvasSize,
  getCanvasInfo,
  setCanvasInfo,
  assetBlur,
  resetFilters,
} from '@/kernel';
import { reportChange } from '@/kernel/utils/config';
import FiltersAdjust from '../AssetSettings/FiltersAdjust';
import Icon from '@/components/Icon';
import Filters from '../AssetSettings/Filters';

import { getScale } from '@/utils';

import './index.less';

const recommendedSize = [
  { width: 1000, height: 1500, icon: ['iconpnterest'] },
  { width: 1280, height: 720, icon: ['iconyutube'] },
  { width: 1500, height: 500, icon: ['icontwitter', 'iconfacebook'] },
];

/**
 * @description 图片设置面板
 */
function BackgroundSetting() {
  const { startCrop, inMask } = useAssetCrop();

  const { template } = useCurrentTemplate();
  const [flipX, updateFlipX] = useFlipX(template?.backgroundAsset);
  const [flipY, updateFlipY] = useFlipY(template?.backgroundAsset);
  const { width, height } = getCanvasInfo();

  /**
   * @description 旋转画布 （旋转画布的同时也会旋转背景图片）
   * @param clockwise true-顺时针方向｜false逆时针方向
   */
  function updateCanvasRotate(clockwise: boolean = true) {
    const scale = getScale({ width: height, height: width });

    const ratio = height / width;
    setCanvasInfo({
      width: height,
      height: width,
      scale,
    });

    getAllAsset().forEach((asset) => {
      if (asset.meta.isBackground) {
        let { rotate } = asset.transform;

        rotate += clockwise ? 90 : -90;
        rotate = rotate % 360;

        if (rotate < 0) {
          rotate = 360 + rotate;
        }

        asset.update({
          attribute: {
            width: asset.attribute.height,
            height: asset.attribute.width,
            crop: asset.attribute.crop || {
              size: {
                width: asset.attribute.width,
                height: asset.attribute.height,
              },
              position: { x: 0, y: 0 },
            },
          },
          transform: { rotate },
        });
      } else {
        let fontSize = undefined;
        if (asset.meta.type === 'text' && asset.attribute.fontSize) {
          fontSize = asset.attribute.fontSize * ratio;
        }
        asset.update({
          attribute: {
            width: asset.attribute.width * ratio,
            height: asset.attribute.height * ratio,
            fontSize,
          },
          transform: {
            posX: asset.transform.posX * ratio,
            posY: asset.transform.posY * ratio,
          },
        });
      }
    });

    reportChange('updateCanvasRotate');
  }

  function resize(size: { width: number; height: number }) {
    assetBlur();
    updateCanvasSize(size);
  }

  return (
    <>
      <Button
        type="text"
        className="action w-full mb-16"
        icon={<Icon type="iconcrop" />}
        onClick={() => startCrop(getCurrentTemplate().backgroundAsset)}
      >
        Crop
      </Button>

      <div className="flex-box gap-16">
        <div className="action-group flex-box flex-1">
          <div className="flex-box gap-2 w-full">
            <Button
              type="text"
              className={classNames('action', 'flex-1', {
                'action-active': flipX,
              })}
              icon={<Icon type="iconfanzhuan" />}
              onClick={() => updateFlipX(!flipX)}
            />
            <Button
              type="text"
              className={classNames('action', 'flex-1', {
                'action-active': flipY,
              })}
              icon={
                <Icon
                  type="iconfanzhuan"
                  style={{ transform: 'rotate(90deg)' }}
                />
              }
              onClick={() => updateFlipY(!flipY)}
            />
          </div>
          <label className="text-sm">Flip</label>
        </div>
        <div className="action-group flex-box flex-1">
          <div className="flex-box gap-2 w-full">
            <Button
              type="text"
              className="action flex-1"
              icon={
                <Icon
                  type="iconzhongzhi"
                  style={{ transform: 'rotateY(180deg)' }}
                />
              }
              onClick={() => updateCanvasRotate(true)}
            />
            <Button
              type="text"
              className="action flex-1"
              icon={<Icon type="iconzhongzhi" />}
              onClick={() => updateCanvasRotate(false)}
            />
          </div>
          <label className="text-sm">Rotate</label>
        </div>
      </div>

      <label className="label">Size:</label>
      <div
        className="mb-24"
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr', gap: 10 }}
      >
        {recommendedSize.map((size, index) => (
          <div
            key={index}
            className={classNames('recommended-size', {
              'recommended-size-active':
                size.width === width && size.height == height,
            })}
            onClick={() => resize(size)}
          >
            {size.icon.map((icon) => (
              <Icon key={icon} type={icon} />
            ))}
          </div>
        ))}
      </div>
      {template?.backgroundAsset && (
        <>
          <label className="label">Presets:</label>
          <Filters asset={template.backgroundAsset} />
        </>
      )}

      {template?.backgroundAsset && (
        <>
          <div
            className="flex-box"
            style={{ justifyContent: 'space-between', marginTop: 16 }}
          >
            <label className="label">Settings: </label>
            <span
              className="filter-reset"
              onClick={() => resetFilters(template.backgroundAsset)}
            >
              <Icon type="iconzhongzhi1" style={{ marginRight: 4 }} />
              reset
            </span>
          </div>

          <div>
            <FiltersAdjust asset={template.backgroundAsset} />
          </div>
        </>
      )}
    </>
  );
}

export default observer(BackgroundSetting);
