import { useState, useMemo } from 'react';
import { Tabs } from 'antd';
import { useDownloadPopover } from '@/store/adapter/useGlobalStatus';
import { ossEditorPath } from '@/config/urls';
import type { PixelType } from '@/typing';

import NoTitleModal from '@/components/NoTitleModal';
import {
  usePreviewPlayHandlerByObserver,
  setPreviewCurrentTime,
} from '@hc/editor-core';
import { clickActionWeblog } from '@/utils/webLog';
import { getUserInfo } from '@/store/adapter/useUserInfo';

import Pixel from './PixelType';

import styles from './index.modules.less';
import Main from './Main';

import PreviewCover from './PreviewCover/index';

export default function DownloadModal(props: { platform: string }) {
  const { platform = '' } = props;
  const { value: visible, close } = useDownloadPopover();

  const { pauseVideo } = usePreviewPlayHandlerByObserver();

  const [pixelType, setPixelType] = useState<PixelType>();

  const onClose = () => {
    close();
  };

  const showWatermark = useMemo(() => {
    const { vip_type } = getUserInfo();

    if (pixelType === '480P' && vip_type === 0) return true;

    return false;
  }, [pixelType]);

  return (
    <NoTitleModal
      visible={Boolean(visible)}
      width={1000}
      footer={false}
      destroyOnClose
      onCancel={onClose}
      centered
      maskClosable={false}
    >
      <div className={styles.wrap}>
        <div className={styles.left}>
          <Tabs
            onChange={key => {
              // 暂停
              pauseVideo();
              setPreviewCurrentTime(0);
              clickActionWeblog('download_001', { action_label: key });
            }}
          >
            <Tabs.TabPane tab="视频预览" key="preview">
              <Main watermark={showWatermark} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <span>视频封面设置</span>
                  {/* <img
                    src={ossEditorPath('/image/new.png')}
                    alt="img"
                    width={30}
                    height={14}
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -29,
                    }}
                  /> */}
                </div>
              }
              key="cover"
            >
              <PreviewCover watermark={showWatermark} />
            </Tabs.TabPane>
          </Tabs>
        </div>
        <div className={styles.right}>
          <Pixel close={onClose} platform={platform} onChange={setPixelType} />
        </div>
      </div>
    </NoTitleModal>
  );
}
