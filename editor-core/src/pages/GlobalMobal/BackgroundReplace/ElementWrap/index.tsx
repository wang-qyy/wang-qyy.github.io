import { PropsWithChildren, CSSProperties, useMemo } from 'react';
import classNames from 'classnames';
import {
  observer,
  useAssetReplaceByObserver,
  Meta,
  isMaskType,
  getCurrentAsset,
} from '@hc/editor-core';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import ClipModal from '@/pages/GlobalMobal/VideoClipModal';

import { useBeforeAddVideo } from '@/hooks/useAddElement';
import Image from '@/pages/SidePanel/Upload/FileItem/Image';
import Lottie from '@/components/Lottie';
import {
  useAssetReplaceModal,
  useOneKeyReplace,
} from '@/store/adapter/useGlobalStatus';
import { formatNumberToTime } from '@/utils/single';
import { useBackgroundSet } from '@/hooks/useBackgroundSet';

import { handleReplaceAsset } from '@/utils/assetHandler';
import { clickActionWeblog } from '@/utils/webLog';
import { getTargetAssetById } from '@/kernel/store/assetHandler/utils';
import styles from './index.less';
import { useSelectItem, useSelectItemOneKeyReplace } from '../hooks';

function Empty() {
  return <></>;
}
function useElement(type: Meta['type']) {
  return useMemo(() => {
    switch (type) {
      case 'mask':
      case 'SVG':
      case 'pic':
      case 'image':
        return Image;
      case 'module':
      case 'video':
      case 'videoE':
        return AutoDestroyVideo;
      case 'lottie':
        return Lottie;
      case 'element':
        return Image;
      default:
        return Empty;
    }
  }, [type]);
}

interface ElementData {
  id: string;
  resId: string;
  ufsId?: string;
  width: number;
  height: number;
  picUrl?: string; // 图片地址
  rt_url?: string; // 视频地址
  rt_total_time?: number; // 视频时长
  rt_preview_url: string; // 预览图
  rt_total_frame?: number; // 视频总帧数
  rt_frame_file?: string; // webm 帧图片
  isUser?: boolean; // 是否为用户上传资源
}

interface ElementWrapProps {
  data: ElementData;
  type: Meta['type'];
  style?: CSSProperties;
  isBackground?: boolean;
  // onSelect?: () => void;
  // onSelect?: () => void;
}
//
export const ElementWrap = observer(
  (props: PropsWithChildren<ElementWrapProps>) => {
    const { data, type, style, children } = props;
    const {
      value: {
        type: replaceModalType,
        selectedList,
        replaceIngAsset: replaceId,
      },
      close: closeAssetReplaceModal,
    } = useAssetReplaceModal();

    const { isOneKeyReplace } = useOneKeyReplace();

    const selectItem = useSelectItem();
    const selectItemOneKeyReplace = useSelectItemOneKeyReplace();
    const replaceIngAsset = replaceId && getTargetAssetById(replaceId);
    const asset = replaceIngAsset ?? getCurrentAsset();
    const { rt_total_time: duration, rt_url, rt_preview_url } = data;
    const { onVideoReplace, onImgReplace } = useBackgroundSet();
    const { endClip } = useAssetReplaceByObserver();
    const {
      check,
      state: clipInfo,
      closeClipModal,
    } = useBeforeAddVideo({ data: { ...data, duration }, meta: { type } });

    const Element = useElement(type);

    const isVideo = ['video', 'videoE'].includes(type);
    const isReplaceBatch = replaceModalType === 'replace-batch';
    const isAudio = replaceModalType === 'replace-audio';

    const activeIndex = useMemo(() => {
      const index = selectedList.findIndex(
        t => `${t.resId}${t.ufsId}` === `${data.resId}${data.ufsId}`,
      );
      return index + 1;
    }, [selectedList, data]);

    /**
     * 关闭相关弹窗
     */
    function closeModal() {
      closeClipModal();
      closeAssetReplaceModal();
      endClip();
    }

    // 图片替换
    function bindImgReplace() {
      if (replaceModalType !== 'modal-replace') {
        if (type === 'image') {
          onImgReplace(data, () => {
            closeModal();
          });
        } else {
          check();
        }
      } else {
        const replaceAsset = {
          meta: {
            type,
          },
          attribute: data,
          transform: {},
        };
        // 替换元素
        handleReplaceAsset({ params: replaceAsset, asset });
        closeModal();
      }
    }

    // 视频替换
    function bindVideoReplace(clip: { cst: number; cet: number }) {
      if (!data) return;
      // 替换背景
      onVideoReplace(clip, data, () => {
        closeModal();
      });
    }
    return (
      <>
        <ClipModal
          onCancel={closeClipModal}
          visible={clipInfo.visible}
          contentProps={{
            data: {
              duration,
              preview_video: rt_url,
              height: data.height,
              width: data.width,
            },
            actionType: 'addAsset',
            onOk: bindVideoReplace,
          }}
        />

        <div
          className={classNames(styles.elementWarp)}
          style={style}
          onClick={() => {
            if (isReplaceBatch) {
              if (isOneKeyReplace) {
                selectItemOneKeyReplace(data);
              } else {
                selectItem(data);
              }
            } else {
              isVideo && replaceModalType !== 'modal-replace'
                ? check()
                : bindImgReplace();
              clickActionWeblog('concise15');
            }
          }}
        >
          {/* 视频时长 */}
          {duration && isVideo && replaceModalType === 't_b_replace' && (
            <div className={styles.elementDuration}>
              {formatNumberToTime(parseInt(`${duration / 1000}`, 10))}
            </div>
          )}
          {!!activeIndex && (
            <div className={styles.selector}>{activeIndex}</div>
          )}
          {!isReplaceBatch && !isAudio && (
            <div
              className={styles.elementReplace}
              onClick={() => {
                isVideo && replaceModalType !== 'modal-replace'
                  ? check()
                  : bindImgReplace();
                clickActionWeblog('concise15');
              }}
            >
              {replaceModalType === 't_b_add' ||
              (isMaskType(asset) &&
                (!asset?.assets || asset?.assets.length == 0))
                ? '添加'
                : '替换'}
            </div>
          )}
          {children || (
            <Element
              poster={rt_preview_url}
              preview={rt_preview_url}
              path={rt_url}
              src={rt_url}
              loop
              {...data}
            />
          )}
        </div>
      </>
    );
  },
);
