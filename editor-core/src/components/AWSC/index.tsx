import React, { useEffect } from 'react';
import NoTitleModal from '@/components/NoTitleModal';
import styles from './index.less';

function index(props: {
  visible: boolean;
  setVisible: (bol: boolean) => void;
  onSuccess: (obj: object) => void;
  onFail?: (obj: object) => void;
  onError?: (obj: object) => void;
}) {
  const { visible, setVisible, onSuccess, onFail, onError } = props;
  function initAliyunNC(el) {
    // 前端接入示例 https://help.aliyun.com/document_detail/193141.html
    // 实例化nc
    AWSC.use('nc', function (state, module) {
      // 初始化
      window.nc = module.init({
        // 应用类型标识。它和使用场景标识（scene字段）一起决定了滑动验证的业务场景与后端对应使用的策略模型。您可以在阿里云验证码控制台的配置管理页签找到对应的appkey字段值，请务必正确填写。
        appkey: 'FFFF0N0000000000A7EC',
        // 使用场景标识。它和应用类型标识（appkey字段）一起决定了滑动验证的业务场景与后端对应使用的策略模型。您可以在阿里云验证码控制台的配置管理页签找到对应的scene值，请务必正确填写。
        scene: 'nc_other',
        // 声明滑动验证需要渲染的目标ID。
        renderTo: el,
        // 前端滑动验证通过时会触发该回调参数。您可以在该回调参数中将会话ID（sessionId）、签名串（sig）、请求唯一标识（token）字段记录下来，随业务请求一同发送至您的服务端调用验签。
        success(data) {
          // window.nc.reset();
          onSuccess(data);
        },
        // 滑动验证失败时触发该回调参数。
        fail(failCode) {
          onFail(failCode);
        },
        // 验证码加载出现异常时触发该回调参数。
        error(errorCode) {
          onError(errorCode);
        },
      });
    });
  }
  useEffect(() => {
    initAliyunNC('nc');
  }, []);
  return (
    <NoTitleModal
      visible={visible}
      width={360}
      onCancel={() => {
        setVisible(false);
      }}
      centered
      footer={null}
    >
      <div className={styles.awsc}>
        <div className={styles.awscTitle}>您需要通过以下验证</div>
        <div id="nc" />
      </div>
    </NoTitleModal>
  );
}

export default index;
