import { XiuIcon } from '@/components';
import { useRef, useMemo, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { isEqual } from 'lodash-es';
import { useHover } from 'ahooks';
import classnames from 'classnames';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import {
  useGetCurrentAsset,
  isModuleType,
  observer,
  AssetClass,
} from '@hc/editor-core';

import { stopPropagation } from '@/utils/single';
import { checkAssetType } from '@/kernel/utils/single';
import { useUpdateReplaceWarn } from '@/store/adapter/useTemplateInfo';

import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { layerWeblog } from '@/utils/webLog';
import AutoImg from './AutoImg/autoImg';
import TextAreaAutoSize from './TextAreaAutoSize';
import useLayerItem from './hook';
import './index.less';

interface LayerPanelItemProps {
  data: AssetClass;
  onCollapsed: () => void;
  collapsed: boolean;
}
const canRecogType = [
  'pic',
  'image',
  'text',
  'SVG',
  'video',
  'videoE',
  'module',
];
const LayerItemWrap = (props: LayerPanelItemProps) => {
  const { data, onCollapsed, collapsed } = props;
  const { checkLoginStatus } = useCheckLoginStatus();
  const currentAsset = useGetCurrentAsset();
  const { value: replaceWarn } = useUpdateReplaceWarn();
  const newAsset = checkAssetType(data) || data;
  const layerItemRef = useRef(null);
  const isHover = useHover(layerItemRef);

  const {
    textAsset,
    showLayerName,
    clickLockFunction,
    clickSeeFunction,
    clearTextAsset,
    handleItemClick,
    handleItemDoubleClick,
  } = useLayerItem(data);

  const isRecogType = (type: string) => {
    let sign = false;
    canRecogType.forEach(item => {
      if (isEqual(item, type)) {
        sign = true;
      }
    });
    return sign;
  };
  const showLayerPic = () => {
    if (newAsset) {
      return (
        <>
          {newAsset.meta.type === 'module' &&
            (collapsed ? (
              <CaretRightOutlined onClick={onCollapsed} />
            ) : (
              <CaretDownOutlined onClick={onCollapsed} />
            ))}
          {(newAsset.meta.type === 'pic' || newAsset.meta.type === 'image') && (
            <AutoImg src={newAsset.attribute.picUrl} className="img" />
          )}
          {newAsset.meta.type === 'text' && <XiuIcon type="iconwenzi1" />}
          {newAsset.meta.type === 'SVG' && (
            <AutoImg src={newAsset.attribute.SVGUrl} className="img" />
          )}
          {(newAsset.meta.type === 'video' ||
            newAsset.meta.type === 'videoE') && (
            <AutoImg src={newAsset.attribute.rt_preview_url} className="img" />
          )}
          {!isRecogType(newAsset?.meta?.type) && (
            <XiuIcon type="iconteshuruanjian" />
          )}
        </>
      );
    }
  };
  // 判断元素是否选中
  const isChoosed = useMemo(() => {
    return (
      currentAsset &&
      (currentAsset.id === data.id || currentAsset.id === data.parent?.id)
    );
  }, [currentAsset?.id]);

  const isModuleChild = useMemo(() => {
    if (data.parent && isModuleType(data.parent)) {
      return true;
    }
    return false;
  }, [data.meta]);
  useEffect(() => {
    if (textAsset?.id !== currentAsset?.id) {
      clearTextAsset();
    }
  }, [currentAsset]);

  const isLocked = data.meta.locked;

  return (
    <>
      <div
        ref={layerItemRef}
        className={classnames('layer-item', {
          'layer-item-choosed': isChoosed,
        })}
        onClick={handleItemClick}
        onDoubleClick={e => {
          // 双击整体埋点
          if (data.meta.type === 'text') {
            layerWeblog('LayerModal_08', {
              action_label: data.meta.type,
            });
          } else {
            layerWeblog('LayerModal_03', {
              action_label: data.meta.type,
            });
          }
          handleItemDoubleClick(e);
        }}
      >
        <div className="layer-item-left">
          <XiuIcon
            type={data.meta.hidden ? 'iconbiyanjing1' : 'iconyanjing'}
            onClick={e => {
              stopPropagation(e);
              layerWeblog('LayerModal_07', {
                action_label: data.meta.type,
              });
              clickSeeFunction(data?.meta.hidden ? '显示成功' : '隐藏成功');
            }}
          />
        </div>
        <div className="layer-item-right">
          <div
            className={classnames('layer-item-right-pic', {
              'layer-item-right-pic-group': isModuleType(data),
            })}
          >
            {showLayerPic()}
          </div>

          <div className="layer-item-right-text">{showLayerName()}</div>

          {isHover && !['text', 'module'].includes(data.meta.type) && (
            <Button
              type="primary"
              className="layer-item-right-button"
              onClick={e => {
                if (!checkLoginStatus()) {
                  // 双击整体埋点
                  layerWeblog('LayerModal_04', {
                    action_label: data.meta.type,
                  });
                  handleItemDoubleClick(e);
                }
              }}
            >
              替换
            </Button>
          )}
          {/* <div style={{ position: 'absolute', top: 12, right: 35 }}>
            {Array.isArray(replaceWarn) &&
              replaceWarn.find(item => item.resId === data.attribute.resId) && (
                <ExclamationCircleFilled
                  style={{ color: 'rgba(251, 124, 56, 1)' }}
                />
              )}
          </div> */}
        </div>
        {/* 组内元素不显示锁定按钮 */}
        {!isModuleChild && (
          <Tooltip title={isLocked ? '解锁' : '锁定'}>
            <div
              className="layer-item-done"
              onClick={e => {
                stopPropagation(e);
                layerWeblog('LayerModal_06', {
                  action_label: data.meta.type,
                });
                clickLockFunction(isLocked ? '解锁成功' : '锁定成功');
              }}
            >
              <XiuIcon
                type={isLocked ? 'iconsuo' : 'icona-huaban11'}
                style={{ color: '#7D8295 ' }}
              />
            </div>
          </Tooltip>
        )}
      </div>
      {textAsset && (
        <TextAreaAutoSize asset={textAsset} onBlur={clearTextAsset} />
      )}
    </>
  );
};
export default observer(LayerItemWrap);
