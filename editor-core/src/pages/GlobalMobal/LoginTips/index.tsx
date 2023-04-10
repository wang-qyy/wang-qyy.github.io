import {
  useUserCheckerStatus,
  useUserLoginModal,
} from '@/store/adapter/useGlobalStatus';
import { Modal, Typography, Button } from 'antd';

import styles from './index.modules.less';

const LoginAlert = () => {
  const { loginAlert, closeReLoginTips, reLoginTips, closeLoginAlert } =
    useUserCheckerStatus();
  const { showLoginModal } = useUserLoginModal();

  function handleOk() {
    closeReLoginTips();
    showLoginModal();
  }

  if (loginAlert) {
    return (
      <div className={styles.loginAlert}>
        登录即享 每日1次免费下载{' '}
        <span className={styles.btn} onClick={showLoginModal}>
          立即登录
        </span>
        <span className={styles.closeBtn} onClick={closeLoginAlert}>
          {/* todo 替换为svgIcon */}
          &times;
        </span>
      </div>
    );
  }
  return (
    <Modal
      title={null}
      visible={reLoginTips}
      onOk={handleOk}
      keyboard={false}
      centered
      closable={false}
      maskClosable={false}
      cancelText={null}
      width={400}
      footer={[
        <Button key="login-btn" type="primary" onClick={handleOk}>
          重新登录
        </Button>,
      ]}
      getContainer={document.getElementById('xiudodo')}
    >
      <Typography.Title level={5}>
        为避免作品保存失败，请重新登录！
      </Typography.Title>
      <p>可能的原因：您切换了账号、退出登录，或在其他终端登录了此账号</p>
    </Modal>
  );
};

export default LoginAlert;
