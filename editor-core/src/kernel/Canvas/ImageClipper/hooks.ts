import { useMemo, useEffect } from 'react';
import { useCreation } from 'ahooks';
import {
  resetImageContainer,
  useGetEditAsset,
  useUpdateAssetStyle,
  useUpdateImageContainer,
  clearContainer,
} from '@kernel/store/AssetAdapter';
import {
  useGetCanvasStatus,
  useGetCanvasInfo,
  useSetCanvasStatus,
} from '@kernel/store/GlobalAdpater';

import { useAssetStyle } from '@kernel/utils/hooks';
import { Asset, Container } from '@kernel/typing';
import { pick } from 'lodash-es';

import {
  calcContainerScale,
  getAssetSizeFormContainer,
} from '@kernel/utils/single';
import {
  calculateRotatedPointCoordinate,
  getCenterPointFromSize,
  positionToCoordinate,
} from '@kernel/utils/mouseHandler/mouseHandlerHelper';
import { reportChange } from '@kernel/utils/config';
import { ImageClipperHandler, getEmptyContainer } from './handler';
// todo 成组以后的裁剪异常，考虑将裁剪转移至渲染层 或 增加裁剪元素的单独操作控件
export function useGetClipInfo() {
  const editAsset = useGetEditAsset();
  const { inClipping } = useGetCanvasStatus();
  const { scale, width } = useGetCanvasInfo();
  const { getTransform, getSize } = useAssetStyle(
    { asset: editAsset as Asset },
    true,
  );
  const attribute = editAsset?.attribute;
  const transform = editAsset?.transform;
  const container = attribute?.container;

  const originImageSrc = useMemo(() => {
    return editAsset?.attribute.picUrl;
  }, [editAsset?.attribute.picUrl]);

  function toolStyle() {
    if (editAsset) {
      const { posX = 0, posY = 0, rotate = 0 } = editAsset.transform;
      const position = {
        left: Number(posX) * scale,
        top: Number(posY) * scale,
      };
      if (rotate) {
        const { width, height } = getSize();
        const center = getCenterPointFromSize(position, { width, height });
        const newPosition = calculateRotatedPointCoordinate(
          positionToCoordinate(position),
          center,
          rotate,
        );
        position.top = newPosition.y;
      }
      // 超出模板后自动回补
      if (position.left > width - 350) {
        position.left = width - 350;
      }
      return {
        left: position.left - 5,
        top: position.top - 60,
      };
    }
    return {};
  }

  const clipperHandler = useCreation(() => {
    if (inClipping && editAsset) {
      return new ImageClipperHandler(editAsset, scale);
    }
    return null;
  }, [inClipping]);

  const imageStyle = useCreation(() => {
    if (inClipping && clipperHandler) {
      return clipperHandler.getStyle();
    }
    return {};
  }, [
    container,
    inClipping,
    attribute?.width,
    attribute?.height,
    transform?.posX,
    transform?.posY,
  ]);

  return {
    toolStyle: toolStyle(),
    imageStyle,
    originImageSrc,
  };
}

export function useImageClipperTool() {
  const { endClip } = useSetCanvasStatus();
  const editAsset = useGetEditAsset();
  const UpdateAssetStyle = useUpdateAssetStyle();
  const UpdateImageContainer = useUpdateImageContainer();
  const attribute = editAsset?.attribute;
  const container = editAsset?.attribute.container;

  const assetBackup = useCreation(() => {
    if (editAsset) {
      const { attribute, transform } = editAsset;
      const { container = getEmptyContainer() } = attribute;
      return {
        attribute: pick(attribute, ['width', 'height']),
        transform: { ...transform },
        container: { ...container },
      };
    }
    return {
      attribute: {
        width: 0,
        height: 0,
      },
      transform: {
        posY: 0,
        posX: 0,
      },
      container: getEmptyContainer(),
    };
  }, []);

  const assetContainer = useCreation(() => {
    return { ...assetBackup.container };
  }, []);

  useEffect(() => {
    if (container) {
      assetContainer.width = container?.width ?? 0;
      assetContainer.height = container?.height ?? 0;
    }
  }, [container?.width, container?.height]);

  // 缩放值
  const value = useMemo(() => {
    if (editAsset) {
      const scala = calcContainerScale(editAsset.attribute, assetContainer);
      return Math.round(scala * 100);
    }
    return 100;
  }, [
    attribute?.width,
    attribute?.height,
    container?.width,
    container?.height,
  ]);

  function onChange(value: number) {
    if (editAsset) {
      const { attribute } = editAsset;
      const { container = getEmptyContainer() } = attribute;
      const scale = value / 100;
      const { width, height } = getAssetSizeFormContainer(
        scale,
        attribute,
        assetBackup.attribute,
        container,
      );

      UpdateImageContainer.focusUpdatePosition({
        left: -(width - attribute.width) / 2 + container.posX,
        top: -(height - attribute.height) / 2 + container.posY,
      });
      UpdateAssetStyle.updateSize({
        width,
        height,
      });
    }
  }

  function onOk() {
    endClip();
  }

  function resetAssetAttr() {
    const { attribute, transform } = assetBackup;
    UpdateAssetStyle.updateSize({
      width: attribute.width,
      height: attribute.height,
    });
    UpdateAssetStyle.focusUpdatePosition(
      {
        left: transform.posX,
        top: transform.posY,
      },
      editAsset,
    );
  }

  function onReset() {
    const { container } = assetBackup;
    resetImageContainer(container as Container, editAsset);
    UpdateImageContainer.focusUpdatePosition({
      left: container.posX,
      top: container.posY,
    });
    UpdateImageContainer.updateSize({
      width: container.width,
      height: container.height,
    });
    resetAssetAttr();
  }

  function onCancel() {
    // 如果不存在svgString，说明是第一次设置裁剪团，取消时需要清空裁剪
    if (assetBackup.container.rt_svgString) {
      onReset();
    } else {
      clearContainer(editAsset);
      resetAssetAttr();
    }
    setTimeout(() => {
      onOk();
    });
  }

  return {
    value,
    onChange,
    onOk,
    onCancel,
    onReset,
  };
}
