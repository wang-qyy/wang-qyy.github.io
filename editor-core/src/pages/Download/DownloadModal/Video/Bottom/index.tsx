import classNames from 'classnames';

import XiuIcon from '@/components/XiuIcon';

import { useUserInfo } from '@/store/adapter/useUserInfo';

import styles from './index.modules.less';
import douYinImg from './img/add.png';

const Right = () => {
  const userInfo = useUserInfo();

  return (
    <div className={styles['right-wrap']}>
      <div className={styles.avatar}>
        <img src={userInfo.avatar} alt="avatar" />
      </div>
      <div>
        <XiuIcon type="icondouyindianzan" className={classNames(styles.icon)} />
        39.9w
      </div>
      <div>
        <XiuIcon
          type="iconkuaishouxiaoxi"
          className={classNames(styles.icon)}
        />
        1.5w
      </div>
      <div>
        <XiuIcon
          type="iconkuaishoufenxiang"
          className={classNames(styles.icon)}
        />
        2223w
      </div>
    </div>
  );
};

function ShiPinHao() {
  const userInfo = useUserInfo();

  return (
    <div className={classNames(styles.wrap, styles['flex-box'])}>
      <div>
        <div
          className={classNames(styles.avatar)}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'scale(4) translateY(-50%)',
            transformOrigin: ' 0 0',
          }}
        >
          <img src={userInfo.avatar} alt="avatar" />
          <span className={styles.ellipsis}>秀多多编辑器</span>
        </div>
      </div>
      <div className={styles['flex-box']}>
        <div className={styles['bottom-menu']}>
          <XiuIcon
            type="iconshipinhaozhuanfa"
            className={classNames(styles.icon, styles['font-size-18'])}
          />
          6624
        </div>
        <div className={styles['bottom-menu']}>
          <XiuIcon
            type="iconshipinhaoredu"
            className={classNames(styles.icon, styles['font-size-18'])}
          />
          3.2万
        </div>
        <div className={styles['bottom-menu']}>
          <XiuIcon
            type="iconshipinhaoxiaoxi"
            className={classNames(styles.icon, styles['font-size-18'])}
          />
          2223
        </div>
      </div>
    </div>
  );
}

function DouYin() {
  return (
    <div
      className={classNames(
        styles.wrap,
        styles['flex-box'],
        styles['border-top'],
      )}
    >
      <Right />

      <div className={classNames(styles.active, styles['bottom-menu'])}>
        首页
      </div>
      <div className={styles['bottom-menu']}>朋友</div>
      <div className={styles['bottom-menu']}>
        <img width="30" src={douYinImg} alt="douYinImg" />
      </div>
      <div className={styles['bottom-menu']}>消息</div>
      <div className={styles['bottom-menu']}>我</div>
    </div>
  );
}

function KuaiShou() {
  return (
    <div
      className={classNames(
        styles.wrap,
        styles['flex-box'],
        styles['border-top'],
      )}
    >
      <Right />
      <div className={classNames(styles.active, styles['bottom-menu'])}>
        首页
      </div>
      <div className={styles['bottom-menu']}>同城</div>
      <div className={styles['bottom-menu']}>
        <XiuIcon className={styles.icon} type="iconkuaishoushipin" />
      </div>
      <div className={styles['bottom-menu']}>消息</div>
      <div className={styles['bottom-menu']}>我</div>
    </div>
  );
}

interface BottomProps {
  type: string;
}

const Bottom = ({ type }: BottomProps) => {
  switch (type) {
    case 'ShiPinHao':
      return <ShiPinHao />;
    case 'DouYin':
      return <DouYin />;
    case 'KuaiShou':
      return <KuaiShou />;
    default:
      return <></>;
  }
};

export default Bottom;
