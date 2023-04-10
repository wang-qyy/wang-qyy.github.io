import { useState } from 'react';
import {
  useCurrentTemplate,
  setTemplateEndTime,
  observer,
  getCurrentTemplateIndex,
  addTemplateWithNewAsset,
  useAllTemplateVideoTimeByObserver,
} from '@hc/editor-core';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import DragBox from '@/components/DragBox';
import { getNewAssetSize } from '@/utils/assetHandler/init';
import { stopPropagation, formatNumberToTime } from '@/utils/single';
import { ElementAction } from '@/CommonModule/ElementActions/Action';
import { useDebounceFn } from 'ahooks';
import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import Image from '@/pages/SidePanel/Upload/FileItem/Image';
import ClipModal from '@/pages/GlobalMobal/VideoClipModal';
import { handleAddAsset } from '@/utils/assetHandler';
import { templateTotalDurationLimit } from '@/config/basicVariable';
import { clickActionWeblog } from '@/utils/webLog';
import { setActiveTemplate } from '@/utils/assetHandler/templateHandler';
import { message } from 'antd';

import './index.less';

export type ItemClickType =
  | 'add'
  | 'replace'
  | 'addInCurrent'
  | 'addAsset'
  | 'cut';
interface BackgroundVideoListProps {
  data: any;
  type: string;
  isSearch: boolean;
}

interface VideoInfo {
  width: number;
  height: number;
  gid: number;
  asset_type: string;
  bg_music: string;
  description: string;
  duration: number;
  frame_file: string;
  frame_rate: number;
  preview: string;
  sample: string;
  preview_video: string;
  scope_type: string;
  title: string;
  total_frame: number;
  video_type: string;
  url: string;
  cover_url: string;
}

function BackItem(props: BackgroundVideoListProps) {
  const { data, type, isSearch = false } = props;
  const isVideo = type === 'VB';
  const { onImgReplace, onVideoReplace } = useBackgroundSet();
  const [clipModal, setClipModal] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo>();
  const [actionType, setActionType] = useState<ItemClickType>();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();

  const { template } = useCurrentTemplate();

  const hasBackgroundAsset = template?.assets.find(
    item => item.meta.isBackground,
  );

  const getType = () => {
    if (isVideo) {
      if (data.gid.indexOf('VB') > -1) {
        return 'video';
      }
      return 'videoE';
    }
    return 'pic';
  };

  function onCancel() {
    setClipModal(false);
  }

  function getAttribute() {
    if (isVideo) {
      return {
        width: data.width,
        height: data.height,
        resId: data.gid,
        rt_url: data.url,
        rt_preview_url: data.cover_url,
        rt_frame_url: data?.frame_file || '',
        rt_total_frame: data.total_frame,
        rt_total_time: data.duration,
        assetWidth: data.width,
        assetHeight: data.height,
      };
    }
    return {
      width: data.width,
      height: data.height,
      resId: data.gid,
      picUrl: data.url,
      rt_preview_url: data.cover_url,
    };
  }
  const dragAsset = () => {
    return {
      meta: { type: getType(), isBackground: true },
      attribute: getAttribute(),
    };
  };

  //  添加一个带背景的片段
  async function addNewTemplateWithBackgroundAsset(
    pageTime: number,
    attribute: any,
  ) {
    const insertIndex = getCurrentTemplateIndex() + 1;

    addTemplateWithNewAsset({
      assets: [
        {
          type: getType(),
          isBackground: true,
          ...attribute,
          ...getNewAssetSize(attribute, { isBackground: true }),
        },
      ],
      pageTime,
      index: insertIndex,
    });

    setTimeout(() => {
      setActiveTemplate(insertIndex);
    }, 10);
  }

  // 图片背景替换或添加
  const bingBackImgReplace = (type: string) => {
    if (type === 'add') {
      addNewTemplateWithBackgroundAsset(3000, getAttribute());
    } else {
      onImgReplace(getAttribute(), () => {});
    }
  };
  function onOk(clip: { cst: number; cet: number }) {
    const newMeta = { type: getType(), isBackground: true };

    const clipDuration = clip.cet - clip.cst;
    const newAttribute = {
      ...getAttribute(),
      ...clip,
      startTime: 0,
      endTime: clipDuration,
    };
    switch (actionType) {
      case 'addInCurrent':
        setTemplateEndTime(clipDuration);

        setTimeout(() => {
          handleAddAsset({
            meta: newMeta,
            attribute: newAttribute,
          });
        });
        break;
      case 'add':
        addNewTemplateWithBackgroundAsset(clipDuration, newAttribute);
        break;
      case 'replace':
        // 替换背景
        onVideoReplace(clip, { type: getType(), ...newAttribute }, () => {});
        break;
    }

    onCancel();
  }

  // 点击视频添加或者替换背景
  const onItemClick = (info: any, actionType: ItemClickType) => {
    // 埋点
    const action_type = isSearch ? 'bgModule_009' : 'bgModule_008';
    clickActionWeblog(action_type, {
      action_label: isVideo ? 'video' : 'image',
    });

    if (
      actionType === 'add' &&
      templateTotalDurationLimit - videoTotalTime < 1000
    ) {
      message.info(
        `不能再添加啦~~,仅支持制作${
          templateTotalDurationLimit / 1000
        }s以内的视频`,
      );
      return;
    }
    if (isVideo) {
      setVideoInfo({ ...info, preview_video: data.url });
      setActionType(actionType);
      setClipModal(true);
    } else {
      bingBackImgReplace(actionType);
    }
  };

  const { run: setBackground } = useDebounceFn(
    prams => {
      onItemClick({ ...data, preview_video: data.url }, prams);
    },
    { wait: 300 },
  );

  return (
    <>
      <ClipModal
        visible={clipModal}
        onCancel={onCancel}
        contentProps={{
          data: videoInfo,
          onOk,
          actionType,
          trigger: 'menu_background',
        }}
      />
      <DragBox
        key={data.id}
        data={dragAsset()}
        type={isVideo ? getType() : 'image'}
      >
        <div
          className="background-video-item"
          onClick={() =>
            setBackground(hasBackgroundAsset ? 'add' : 'addInCurrent')
          }
        >
          {isVideo && (
            <div className="background-video-duration">
              {formatNumberToTime(parseInt(`${data.duration / 1000}`, 10))}
            </div>
          )}

          <ElementAction
            tip="替换当前背景"
            className="background-video-replace"
            onClick={e => {
              stopPropagation(e);
              setBackground('replace');
            }}
            icon="icontihuan"
            hidden={!hasBackgroundAsset}
          />

          {isVideo ? (
            <AutoDestroyVideo poster={data.cover_url} src={data.url} />
          ) : (
            <Image poster={data.cover_url} />
          )}
        </div>
      </DragBox>
    </>
  );
}

export default observer(BackItem);
