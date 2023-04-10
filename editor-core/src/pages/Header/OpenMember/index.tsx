import React, { useState } from 'react';
import OverwritePopover from '@/components/OverwritePopover';
import { ossEditorPath } from '@/config/urls';
import styles from './index.less';

function index(props: any) {
  const { bindOpenMember, children } = props;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [popoverVisible, setPopoverVisible] = useState(false);

  const content = () => {
    return (
      <div className={styles.openMember}>
        <div className={styles.openMemberTop}>
          <div className={styles.topItem}>
            <img
              className={styles.topItemImg}
              src={ossEditorPath('/image/VIP/muban.png')}
              alt=""
            />
            <div className={styles.topItemTxt}>海量模板</div>
          </div>
          <div className={styles.topItem}>
            <img
              className={styles.topItemImg}
              src={ossEditorPath('/image/VIP/wushuiyin.png')}
              alt=""
            />
            <div className={styles.topItemTxt}>高清无水印</div>
          </div>
          <div className={styles.topItem}>
            <img
              className={styles.topItemImg}
              src={ossEditorPath('/image/VIP/shangyong.png')}
              alt=""
            />
            <div className={styles.topItemTxt}>个人商用</div>
          </div>
        </div>
        <div
          className={styles.openMemberContent}
          style={{
            backgroundImage: `url(${ossEditorPath(
              '/image/VIP/beijingkuai.png',
            )})`,
          }}
        >
          <div className={styles.contentTag}>年中钜惠</div>
          <div className={styles.contentTop}>
            <div className={styles.topLeft}>加入秀多多会员</div>
            <div className={styles.topRight}>
              <span className={styles.topRightLeft}>49</span>
              <span className={styles.topRightRight}>元起</span>
            </div>
          </div>

          <div className={styles.contentBottom}>
            <div className={styles.bottomLeft}>现在加入可享受最低价格</div>
            <div
              className={styles.bottomRight}
              onClick={() => {
                bindOpenMember();
                setPopoverVisible(false);
              }}
            >
              立即成为会员
            </div>
          </div>
        </div>

        <div className={styles.openMemberBottom}>
          <div className={styles.openMemberBottomTitle}>
            现在加入，还送以下特权：
          </div>
          <div className={styles.openMemberBottomTitleItem}>
            <img
              className={styles.itemImg}
              src={ossEditorPath('/image/VIP/duihao.png')}
              alt=""
            />
            <span>70+AI智能配音任选使用</span>
          </div>
          <div className={styles.openMemberBottomTitleItem}>
            <img
              className={styles.itemImg}
              src={ossEditorPath('/image/VIP/duihao.png')}
              alt=""
            />
            <span>云端储存空间最高10G</span>
          </div>
          <div className={styles.openMemberBottomTitleItem}>
            <img
              className={styles.itemImg}
              src={ossEditorPath('/image/VIP/duihao.png')}
              alt=""
            />
            <span>百万正版字体、图片、元素、花字素材</span>
          </div>
          <div className={styles.openMemberBottomTitleItem}>
            <img
              className={styles.itemImg}
              src={ossEditorPath('/image/VIP/duihao.png')}
              alt=""
            />
            <span>视频高速优先合成</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <OverwritePopover
      visible={popoverVisible}
      onVisibleChange={visible => {
        setPopoverVisible(visible);
      }}
      content={content}
    >
      {children}
    </OverwritePopover>
  );
}

export default index;
