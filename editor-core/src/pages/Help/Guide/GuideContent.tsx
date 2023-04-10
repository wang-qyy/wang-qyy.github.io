import { Button } from 'antd';
import { observer } from '@hc/editor-core';

import { useGuideInfo, useLoginModal } from '@/store/adapter/useGlobalStatus';

import classNames from 'classnames';
import { getNoviceProcess } from '@/utils/guide';
import { XiuIcon } from '@/components';
import { getUserId } from '@/store/adapter/useUserInfo';
import styles from './index.modules.less';
import { NoviceGuide } from './variable';

const GuideContent = () => {
  const { guideInfo, open, close, next } = useGuideInfo();
  const { open: openLoginModal } = useLoginModal();
  const handleOnClick = (e: Event, index = -1) => {
    // 触发式新手引导
    if (guideInfo.buttonType === 0) {
      close();
      const novice = getNoviceProcess();
      if (novice) {
        open(novice);
      }
      return;
    }
    // 新手引导
    if (guideInfo.type === 1) {
      // 新手引导
      if (guideInfo.currentStep < guideInfo.totalStep || index !== -1) {
        if (index !== -1) {
          open(NoviceGuide[guideInfo.index][index]);
        } else {
          open(NoviceGuide[guideInfo.index][guideInfo.currentStep]);
        }
      } else {
        close();
      }
      return;
    }

    if (guideInfo.type === 4) {
      // 注册登录
      if (getUserId() < 0) {
        openLoginModal();
      }
      close();
    }

    if (guideInfo.type === 5) {
      close();
    }
  };
  const list = new Array(guideInfo.totalStep).fill('');
  return (
    <div className={styles.content}>
      {guideInfo.src ? (
        <div className={styles.title}>
          <video
            // ref={videoRef}
            src={guideInfo.src}
            loop
            width="100%"
            height="100%"
            autoPlay
            disablePictureInPicture
          />
        </div>
      ) : (
        <div className={styles.title}>{guideInfo.title}</div>
      )}
      {guideInfo.key === 'NoviceGuide00' ? (
        <div className={styles.desc}>
          <div className={styles.NoviceGuidedesc}>
            <p>
              按空格键或者
              <div className={styles.icon}>
                <XiuIcon type="iconbofang" />
              </div>
              播放视频，双击需要修改的文字/图片/视频。
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.desc}>{guideInfo?.desc}</div>
      )}

      <div className={styles.nextWrap}>
        {(guideInfo.ignoreBtn || true) && (
          <Button className={styles.next} onClick={handleOnClick}>
            {guideInfo.buttonText}
          </Button>
        )}
      </div>
      <div className={styles.bottomWrap}>
        <div className={styles.progress}>
          {guideInfo.currentStep && (
            <>
              {list.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={classNames(styles.progressPoint, {
                      [styles.choosed]: index === guideInfo.currentStep - 1,
                    })}
                    onClick={e => {
                      handleOnClick(e, index);
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
      <Button
        onClick={close}
        type="link"
        aria-selected
        aria-disabled
        size="small"
        className={styles.close}
      >
        关闭教学
      </Button>
    </div>
  );
};
export default observer(GuideContent);
