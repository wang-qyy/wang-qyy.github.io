import React, { useState, useEffect } from 'react';
import NoTitleModal from '@/components/NoTitleModal';
import styles from './index.less';

function index(props: {
  bindResult: object | null;
  setBindResult: (obj: any) => void;
  bindChange: (obj: object) => void;
}) {
  const { bindResult, setBindResult, bindChange } = props;
  const [visible, setVisible] = useState(false);

  const bindOk = () => {
    bindChange({
      phoneNum: bindResult?.phoneNum,
      phoneMsgNum: bindResult?.phoneMsgNum,
    });
  };

  const Content = (bindResult: {
    message: string;
    tel: string | number;
    originalUid: string;
    uid: string;
  }) => {
    switch (bindResult?.message) {
      case 'alreadyBindOther':
        return (
          <>
            <div className={styles.bindResultWarpContent}>
              您输入的手机号{bindResult?.tel} 已经绑定到账号
              <br />"{bindResult?.originalUid}"
              <br />
              <br />
              你可以选择将该手机号从该账号中解绑,并绑定之
              <br />
              当前账号“{bindResult?.uid}”
            </div>
            <div className={styles.bindResultWarpFooter}>
              <div className={styles.leftButton} onClick={bindOk}>
                确认绑定
              </div>
              <div
                className={styles.rightButton}
                onClick={() => {
                  setBindResult(null);
                }}
              >
                暂不绑定
              </div>
            </div>
          </>
        );

      case 'alreadyUpFile':
        return (
          <>
            <div className={styles.bindResultWarpContent}>
              您输入的手机号{bindResult?.tel} 已经绑定到账号
              <br />“{bindResult?.originalUid}”
              <br />
              <br />
              并且已有上传文件记录,无法直接解除绑定,你可
              <br />
              用该手机号登录后,在账号设置中更换手机号后,
              <br />
              重新绑定.
            </div>
            <div
              className={styles.bindResultWarpButton}
              onClick={() => {
                setBindResult(null);
              }}
            >
              知道了
            </div>
          </>
        );

      case 'noBindOther':
        return (
          <>
            <div className={styles.bindResultWarpContent}>
              {bindResult?.tel} 用户只有当前登录方式,绑定后
              <br />
              原账号将无法登录,并且相关权益将会注销
              <br />
              需谨慎操作
            </div>
            <div className={styles.bindResultWarpFooter}>
              <div className={styles.leftButton} onClick={bindOk}>
                确认绑定
              </div>
              <div
                className={styles.rightButton}
                onClick={() => {
                  setBindResult(null);
                }}
              >
                暂不绑定
              </div>
            </div>
          </>
        );

      default:
        break;
    }
  };
  useEffect(() => {
    if (bindResult) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [bindResult]);
  return (
    <NoTitleModal
      visible={visible}
      width={385}
      centered
      onCancel={() => {
        setBindResult(null);
      }}
      footer={null}
      wrapClassName="bindResultModal"
    >
      <div className={styles.bindResultWarp}>
        <div className={styles.bindResultWarpTitle}>绑定失败</div>
        {Content(bindResult)}
      </div>
    </NoTitleModal>
  );
}

export default index;
