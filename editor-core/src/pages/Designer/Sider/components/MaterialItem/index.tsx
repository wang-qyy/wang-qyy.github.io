import { PropsWithChildren, ReactNode, useState, useMemo } from 'react';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { Popover } from 'antd';
import {
  addTemplateWithNewAsset,
  AssetType,
  observer,
  useCurrentTemplate,
  getTemplateIndexById,
  setTemplateEndTime,
  Meta,
} from '@hc/editor-core';
import DragBox from '@/components/DragBox';
import XiuIcon from '@/components/XiuIcon';
import { getBackgroundAssetSize } from '@/utils/assetHandler/assetUtils';
import Lottie from '@/components/Lottie';

import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { handleAddAsset, handleReplaceAsset } from '@/utils/assetHandler';
import { getNewVideoAssetDuration } from '@/utils/assetHandler/init';
import { formatNumberToTime } from '@/utils/single';

import Preview from '../Preview';

import MaterialAutoImg from './MaterialAutoImg';

import './index.less';

interface TextItemProps {
  attribute: any;
  style?: any;
  poster?: string;
  src?: string;
  icon?: ReactNode;
  active?: Boolean;
  type: AssetType;
  name?: string | ReactNode;
  defaultBackground?: boolean;
  isBackground?: boolean;
  previewNode?: React.ReactNode;
  meta: Partial<Meta>;
}

/**
 * @prama poster 视频封面
 * @prama src 资源地址
 * */
function MaterialItem(props: PropsWithChildren<TextItemProps>) {
  const {
    style,
    src,
    poster,
    type,
    name,
    active,
    icon = <PlusOutlined />,
    attribute,
    defaultBackground,
    previewNode,
    isBackground = false,
    children,
    meta,
  } = props;

  const [loading, setLoading] = useState(false);
  const [loadingReplace, setLoadingReplace] = useState(false);

  const { template } = useCurrentTemplate();

  async function onAdd() {
    setLoading(true);

    if (isBackground) {
      if (template.backgroundAsset) {
        await addTemplateWithNewAsset({
          assets: [
            {
              type,
              isBackground: true,
              ...attribute,
              ...getBackgroundAssetSize(attribute),
            },
          ],
          pageTime: attribute.rt_total_time || 3000,
          index: getTemplateIndexById(template.id) + 1,
        });
      } else {
        const endTime = Math.min(
          template.videoInfo.endTime,
          attribute.rt_total_time,
        );
        await handleAddAsset({
          meta: { type, isBackground },
          attribute: {
            ...attribute,
            startTime: 0,
            endTime,
          },
        });

        setTemplateEndTime(endTime, getTemplateIndexById(template.id));
      }
    } else {
      let duration = {};
      if (['video', 'videoE'].includes(type)) {
        duration = getNewVideoAssetDuration(attribute.rt_total_time);
      }

      await handleAddAsset({
        meta: { type, ...meta },
        attribute: {
          ...attribute,
          ...duration,
        },
      });
    }

    setLoading(false);
  }

  // 替换
  async function onReplace() {
    setLoadingReplace(true);

    await handleReplaceAsset({
      params: {
        meta: { type, isBackground },
        attribute,
      },
      asset: template.backgroundAsset,
    });

    setLoadingReplace(false);
  }

  return (
    <Preview
      type={type}
      previewNode={previewNode}
      src={type === 'lottie' ? attribute.rt_url : src}
      poster={attribute.rt_preview_url}
    >
      <DragBox
        type={type}
        data={{ meta: { type }, attribute }}
        style={style}
        className={classNames('materialItem', {
          materialItemActive: active,
        })}
      >
        {children}
        {['videoE', 'lottie'].includes(type) && (
          <>
            {poster && <MaterialAutoImg src={poster} />}
            {attribute.rt_total_time > 0 && (
              <div className="video-duration">
                {formatNumberToTime(
                  parseInt(`${attribute.rt_total_time / 1000}`, 10),
                )}
              </div>
            )}
          </>
        )}
        {src && type !== 'videoE' ? (
          <MaterialAutoImg src={src} />
        ) : (
          name && <div className="materialItemName">{name}</div>
        )}

        {isBackground &&
          template.backgroundAsset &&
          (loadingReplace ? (
            <LoadingOutlined className="materialItemLoading" spin />
          ) : (
            <span
              className="materialItemAdd"
              style={{ left: 6 }}
              onClick={onReplace}
            >
              <XiuIcon type="iconexchange" />
            </span>
          ))}

        {loading ? (
          <LoadingOutlined className="materialItemLoading" spin />
        ) : (
          <span className="materialItemAdd" onClick={onAdd}>
            {icon}
          </span>
        )}
        {/* </div> */}
      </DragBox>
    </Preview>
  );
}

export default observer(MaterialItem);
