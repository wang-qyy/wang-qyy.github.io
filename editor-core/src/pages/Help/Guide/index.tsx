import { useRef, useMemo, useEffect, useState } from 'react';
import { useSize } from 'ahooks';
import classNames from 'classnames';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { observer } from '@hc/editor-core';
import { useGuideInfo } from '@/store/adapter/useGlobalStatus';

import { XiuIcon } from '@/components';
import Lottie from '@/components/Lottie';
import { ossEditorPath } from '@/config/urls';
import { userGuidePopLog } from '@/utils/webLog';
import { getLocalStorage, setLocalstorage } from '@/utils/single';
import { useGuide } from './hook';
import GuideContent from './GuideContent';

import styles from './index.modules.less';

const Guide = () => {
  const { guideInfo, close, open } = useGuideInfo();
  const { getPopupContainer } = useGuide();

  const [pixelTip, setPixelTip] = useState(false);

  const guideRef = useRef<HTMLDivElement>(null);
  const size = useSize(guideRef);
  const guide = useMemo(() => {
    if (!guideInfo.visible) return { visible: guideInfo.visible, position: [] };
    const { left, top, position } = getPopupContainer({
      size,
      selector: guideInfo.popupContainer,
      position: guideInfo.position,
      offset: guideInfo.offset,
    });

    return {
      left,
      top,
      visible: guideInfo.visible,
      position,
    };
  }, [guideInfo, size]);

  useEffect(() => {
    // 新手引导埋点
    if (guideInfo?.webLog) {
      userGuidePopLog(guideInfo?.webLog);
    }
  }, [guideInfo]);

  useEffect(() => {
    if (!getLocalStorage('pixeltip')) {
      setPixelTip(true);
    }
  }, []);

  return (
    <>
      <Modal
        keyboard={false}
        visible={pixelTip}
        mask={false}
        wrapClassName={styles['xdd-pixel-tip']}
        width={530}
        okText="知道了"
        closable={false}
        footer={false}
      >
        <ExclamationCircleOutlined
          style={{ color: '#FF5A21', fontSize: 16, marginRight: 16 }}
        />
        <div>
          为获得更流畅的编辑体验，采用低分辨率进行预览，不会影响视频高清导出
        </div>
        <Button
          type="link"
          style={{ fontSize: 12 }}
          onClick={() => {
            setPixelTip(false);
            setLocalstorage('pixeltip', true);
          }}
        >
          知道了
        </Button>
      </Modal>
      <div
        ref={guideRef}
        className={classNames(styles['guide-wrap'])}
        style={{
          display: guideInfo.visible ? 'block' : 'none',
          left: guide.left,
          top: guide.top,
          zIndex: 998,
        }}
      >
        <div className={styles['guide-content']}>
          <div className={styles.closeIcon} onClick={close}>
            <XiuIcon type="iconchahao" />
          </div>
          <div
            className={classNames(styles.arrowTip, styles[guideInfo.position])}
            style={guideInfo?.arrowStyle}
          >
            <Lottie
              autoPlay
              alwaysPlay
              path={ossEditorPath('/help/guideJianTou.json')}
              preview=""
            />
          </div>
          <GuideContent />
        </div>
      </div>
    </>
  );
};
export default observer(Guide);
