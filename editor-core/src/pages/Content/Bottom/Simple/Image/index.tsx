import { useState } from 'react';
import {
  observer,
  AssetClass,
  toJS,
  assetUpdater,
  getCurrentAsset,
} from '@hc/editor-core';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import Image from '@/pages/SidePanel/Upload/FileItem/Image';
import { setAssetIntoView } from '@/utils/assetHandler';
import XiuIcon from '@/components/XiuIcon';

import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';
import ClipModalContent from '@/pages/GlobalMobal/VideoClipModal';

import { clickActionWeblog } from '@/utils/webLog';
import Empty from '../Empty';

import styles from './index.modules.less';

const Item = observer(({ data }: { data: AssetClass }) => {
  const { meta, attribute } = data;
  const { type } = meta;
  const { picUrl = '', SVGUrl = '', rt_preview_url = '', rt_url } = attribute;
  switch (type) {
    case 'image':
    case 'pic':
      return <Image poster={picUrl} />;
    case 'SVG':
    case 'mask':
      return <Image poster={SVGUrl} />;
    case 'lottie':
      return <Image poster={rt_preview_url} />;
    case 'video':
    case 'videoE':
      return <AutoDestroyVideo poster={rt_preview_url} src={rt_url} />;
    default:
      return <></>;
  }
});

export default observer(({ list }: { list: AssetClass[] }) => {
  const { open: openAssetReplaceModal } = useAssetReplaceModal();

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

  function clipVideo(result: { cst: number; cet: number }) {
    assetUpdater(getCurrentAsset(), { attribute: result });
    setVideoClip({ visible: false });
  }

  return (
    <>
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
      {list.length ? (
        <div className={styles['image-list']}>
          {list.map(item => {
            let asset = item;

            if (item.meta.type === 'mask') {
              asset = item.assets?.[0] as AssetClass;
            }

            if (!asset) {
              return <></>;
            }
            const {
              attribute,
              meta: { type },
            } = asset;
            const { startTime, endTime } = asset.assetDuration;

            return (
              <div
                key={`image-${item.meta.id}`}
                className={styles['image-item']}
              >
                <div
                  className={styles['image-item-mask']}
                  onClick={() => setAssetIntoView({ asset: item })}
                >
                  <div
                    className={styles.action}
                    onClick={() => {
                      clickActionWeblog('bottom_0003');
                      openAssetReplaceModal('modal-replace');
                    }}
                  >
                    替换
                  </div>
                  <div
                    hidden={!['videoE', 'video'].includes(type)}
                    className={styles.action}
                    onClick={() => {
                      clickActionWeblog('bottom_0004');
                      const cst = attribute.cst ?? 0;
                      const cet = attribute.cet ?? cst + endTime - startTime;

                      setVideoClip({
                        visible: true,
                        data: {
                          width: attribute.width,
                          height: attribute.height,
                          duration: attribute.rt_total_time,
                          preview_video: attribute.rt_url,
                          cst,
                          cet,
                        },
                      });
                    }}
                  >
                    裁剪
                  </div>
                </div>
                <div className={styles.duration}>
                  <XiuIcon
                    type={
                      ['image', 'pic'].includes(type)
                        ? 'icontupian'
                        : 'iconshipin2'
                    }
                  />
                  {'  '}
                  {((endTime - startTime) / 1000).toFixed(1)}s
                </div>

                <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
                  <Item data={asset} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty />
      )}
    </>
  );
});
