import { observer } from 'mobx-react';
import { useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { PlusOutlined, EllipsisOutlined } from '@ant-design/icons';
import { XiuIcon } from '@/components';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { setAssetIntoView } from '@/utils/assetHandler';
import {
  assetBlur,
  assetUpdater,
  getCurrentAsset,
  removeAsset,
  useReplaceStatusByObserver,
} from '@/kernel';
import { getPicUrl } from '@/utils/assetHandler/assetUtils';
import { msToSeconds } from '@/components/TimeLine/utils/common';
import ClipModalContent from '@/pages/GlobalMobal/VideoClipModal';
import { getRealAsset, stopPropagation } from '@/utils/single';

import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';
import Card from '../Card';

const MediaItem = ({
  asset,
  isDrag,
}: {
  asset: AssetItemState;
  isDrag: boolean;
}) => {
  const realAsset = getRealAsset(asset);
  const {
    meta: { isBackground },
    attribute,
  } = realAsset;
  const { rt_total_time, rt_url } = attribute;
  const [playing, _playing] = useState(false);
  const currentAsset = getCurrentAsset();
  const { updateReplaceIngAsset } = useAssetReplaceModal();
  const { startReplace } = useReplaceStatusByObserver();

  // 视频裁剪数据
  const [videoClip, setVideoClip] = useState<{
    visible: boolean;
    data?: {
      duration: number;
      preview_video: string;
      height: number;
      width: number;
      cst?: number;
      cet?: number;
    };
  }>({
    visible: false,
  });

  const url = getPicUrl(realAsset);

  const realType = realAsset.meta.type;

  const isVideo = ['video', 'videoE'].includes(realType);
  const timeInfo = msToSeconds(rt_total_time || 0);
  const isBG = realType === 'video' && isBackground;

  const clipVideo = (result: { cst: number; cet: number }) => {
    assetUpdater(realAsset, { attribute: result });
    setVideoClip({ visible: false });
  };
  const selectAsset = () => {
    setAssetIntoView({
      asset,
      template: asset.template,
      withAbsoluteTime: true,
    });
    updateReplaceIngAsset(realAsset.id);
  };

  const deleteAsset = () => {
    removeAsset(asset);
    assetBlur();
  };
  return (
    <Card
      active={false}
      style={{ width: '100%', height: 0, paddingBottom: '100%' }}
      onClick={e => {
        e.stopPropagation();
        selectAsset();
      }}
      onMouseDown={stopPropagation}
      hiddenContent={
        <>
          <div className={styles.operation}>
            <Button
              size="small"
              onClick={e => {
                e.stopPropagation();
                selectAsset();
                startReplace(asset);
                clickActionWeblog('onkeyReplace_007');
              }}
              icon={<XiuIcon type="icontihuan2" />}
            >
              替换
            </Button>
            {isVideo && realAsset.meta.replaced && (
              <Button
                size="small"
                style={{ marginLeft: 4 }}
                icon={<XiuIcon type="iconjianji" />}
                onClick={() => {
                  const { startTime, endTime } = asset.assetDuration;
                  const cst = realAsset.attribute.cst ?? 0;
                  const cet =
                    realAsset.attribute.cet ??
                    Math.min(
                      cst + endTime - startTime,
                      realAsset.attribute.rt_total_time,
                    );

                  setVideoClip({
                    visible: true,
                    data: {
                      width: realAsset.attribute.width,
                      height: realAsset.attribute.height,
                      duration: realAsset.attribute.rt_total_time,
                      preview_video: realAsset.attribute.rt_url,
                      cst,
                      cet,
                    },
                  });
                  clickActionWeblog('onkeyReplace_008');
                }}
              >
                剪辑
              </Button>
            )}
          </div>
          {!isBG && (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={({ item, key, keyPath, domEvent }) => {
                      domEvent.stopPropagation();
                      deleteAsset();
                      clickActionWeblog('onkeyReplace_009');
                    }}
                  >
                    删除
                  </Menu.Item>
                </Menu>
              }
            >
              <div className={styles.actionDrop}>
                <EllipsisOutlined />
              </div>
            </Dropdown>
          )}
        </>
      }
      showContent={
        isVideo && (
          <div className={styles.duration}>
            <XiuIcon type="shipin-624jcji7" style={{ marginRight: 3 }} />
            {timeInfo.m}:{timeInfo.s}
          </div>
        )
      }
    >
      <div
        className={styles.MediaItem}
        style={{ backgroundImage: `url(${url})` }}
        onMouseEnter={() => {
          _playing(true);
        }}
        onMouseLeave={() => {
          _playing(false);
        }}
      >
        {playing && isVideo && (
          <video
            src={rt_url}
            loop
            width="100%"
            height="100%"
            autoPlay
            disablePictureInPicture
          />
        )}
      </div>
      <ClipModalContent
        visible={videoClip.visible}
        contentProps={{
          data: videoClip.data,
          actionType: 'cut',
          onOk: clipVideo,
        }}
        onCancel={() => {
          setVideoClip({ visible: false });
        }}
      />
    </Card>
  );
};

export default observer(MediaItem);
