import {
  PropsWithChildren,
  CSSProperties,
  useMemo,
  useState,
  useRef,
  useEffect,
  MouseEvent,
} from 'react';
import { PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer, useGetCurrentAsset, Meta } from '@hc/editor-core';
import { clickActionWeblog } from '@/utils/webLog';
import { ossEditorPath } from '@/config/urls';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import ClipModal from '@/pages/GlobalMobal/VideoClipModal';
import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import { handleAddAsset, handleReplaceAsset } from '@/utils/assetHandler';
import { useBeforeAddVideo, useExpandPageTime } from '@/hooks/useAddElement';
import Image from '@/pages/SidePanel/Upload/FileItem/Image';
import Lottie from '@/components/Lottie';
import {
  getSidePanelInfo,
  getSettingPanel,
} from '@/store/adapter/useGlobalStatus';
import { getNewAssetDuration } from '@/utils/assetHandler/init';
import { useDebounceFn, useHover } from 'ahooks';
import { formatNumberToTime, stopPropagation } from '@/utils/single';
import { ElementAction } from './Action';

import './index.less';

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
      default:
        return Empty;
    }
  }, [type]);
}

interface ElementData {
  id: string;
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
  className?: string;
  style?: CSSProperties;
  onSuccess?: () => void;
}

//
export const ElementWrap = observer(
  (props: PropsWithChildren<ElementWrapProps>) => {
    const { data, type, className, style, children, onSuccess } = props;
    const { rt_total_time: duration, rt_url, rt_preview_url } = data;
    const { onVideoReplace, onImgReplace } = useBackgroundSet();
    const [isBackground, setIsBackground] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const isHover = useHover(itemRef);
    const timer = useRef();

    useEffect(() => {
      if (isHover) {
        timer.current = setTimeout(() => {
          const { menu } = getSidePanelInfo();
          const { panelKey } = getSettingPanel();

          clickActionWeblog(`asset_hover_${panelKey || menu}`, {
            action_label: '',
            asset_id: data.id,
          });
        }, 2000);
      } else {
        clearTimeout(timer.current);
      }
    }, [isHover]);

    const currentAsset = useGetCurrentAsset();
    const [expandPageTime] = useExpandPageTime();
    const {
      check,
      state: clipInfo,
      closeClipModal,
    } = useBeforeAddVideo({ data: { ...data, duration }, meta: { type } });

    const attribute = data;

    const Element = useElement(type);

    const isVideo = ['video', 'videoE'].includes(type);

    function webLog(logType: 'add' | 'replace', suffix?: string) {
      const { menu } = getSidePanelInfo();
      const { panelKey } = getSettingPanel();

      clickActionWeblog(
        `action_${panelKey || menu}_${logType}_${type}${
          suffix ? `_${suffix}` : ''
        }`,
      );
    }

    function onAdd(params?: { cst: number; cet: number }) {
      Object.assign(attribute, params);

      if (isVideo && params) {
        expandPageTime(params);
      }

      setTimeout(() => {
        if (isVideo && params) {
          const newDuration = getNewAssetDuration(params.cet - params.cst);
          Object.assign(attribute, newDuration);
        }

        handleAddAsset({ meta: { type, isUserAdd: true }, attribute });
        closeClipModal();
      });

      onSuccess && onSuccess();
      webLog('add');
    }

    const { run: onReplace } = useDebounceFn(
      () => {
        handleReplaceAsset({ params: { meta: { type }, attribute } });
        onSuccess && onSuccess();
        webLog('replace');
      },
      { wait: 300 },
    );

    // 背景图片替换
    const bingBackImgReplace = () => {
      onImgReplace(data, () => {
        closeClipModal();
      });
    };

    // 背景视频替换
    const bingBackVideoReplace = (params: { cst: number; cet: number }) => {
      onVideoReplace(params, data, () => {
        closeClipModal();
      });
      setIsBackground(false);
    };

    const canReplace =
      currentAsset &&
      (currentAsset.meta.type === 'mask' && currentAsset.assets?.length
        ? ['video', 'videoE', 'image', 'pic'].includes(type)
        : true);

    // 点击添加
    const { run: onItemClick } = useDebounceFn(
      e => {
        isVideo ? check() : onAdd();
      },
      { wait: 300 },
    );

    const { run: setBackground } = useDebounceFn(
      () => {
        webLog('add', 'b');
        isVideo ? check() : bingBackImgReplace();
        setIsBackground(true);
      },
      { wait: 300 },
    );

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
            onOk: isBackground ? bingBackVideoReplace : onAdd,
            // onOk: onAdd,
            trigger: `menu_${getSidePanelInfo().menu}`,
          }}
        />

        <div
          className={classNames('element-warp', className)}
          style={style}
          ref={itemRef}
          onClick={onItemClick}
        >
          {/* 视频时长 */}
          {duration && isVideo && (
            <div className="element-duration">
              {formatNumberToTime(parseInt(`${duration / 1000}`, 10))}
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
          {/* <div className="element-actions-wrap"> */}
          {/* <ElementAction
            tip="添加"
            className="element-action-add"
            onClick={() => (isVideo ? check() : onAdd())}
          >
            <PlusOutlined style={{ color: '#fff', fontSize: 14 }} />
          </ElementAction> */}

          <ElementAction
            tip="设为背景"
            className="background-replace"
            onClick={e => {
              stopPropagation(e);
              setBackground();
            }}
            hidden={
              currentAsset ||
              !['videoE', 'img', 'user-space', 'background'].includes(
                getSidePanelInfo().menu,
              )
            }
          >
            <img
              src={ossEditorPath(`/image/backgroundAnimation/tihuan.png`)}
              alt=""
            />
          </ElementAction>

          <ElementAction
            tip="替换"
            className="element-action-replace"
            onClick={e => {
              stopPropagation(e);
              onReplace();
            }}
            icon="icontihuan"
            hidden={
              type === 'module' || currentAsset?.meta.isBackground
                ? true
                : !canReplace
            }
          />
        </div>
        {/* </div> */}
      </>
    );
  },
);
