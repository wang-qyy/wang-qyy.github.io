import { ossEditorPath } from '@/config/urls';
import { usePasteModal } from '@/store/adapter/useGlobalStatus';
import { Button, Modal } from 'antd';
import './index.less';

const PasteTip = () => {
  const { visible, close } = usePasteModal();
  return (
    <Modal
      title={null}
      visible={visible}
      onCancel={close}
      keyboard={false}
      centered
      maskClosable
      cancelText={null}
      width={511}
      footer={null}
      getContainer={document.getElementById('xiudodo')}
    >
      <div className="paste-tip">
        <div className="paste-tip-title">
          编辑器右键菜单功能被浏览器默认禁止，你可以
        </div>
        {/* <div className="paste-tip-title2">方法一、通过快捷键方式复制粘贴</div>
        <div className="paste-tip-content">
          <div className="content-item">Ctrl + C（复制）</div>
          <div className="content-item">Ctrl + X（剪切）</div>
          <div className="content-item">Ctrl + V（粘贴）</div>
        </div> */}
        <div className="paste-tip-title2">
          浏览器解除禁止读取剪切板， 方法如下：
        </div>
        <div className="paste-tip-image">
          <img src={ossEditorPath('/image/help/pasteTip.png')} alt="提示" />
        </div>
        <Button className="paste-tip-button" type="primary" onClick={close}>
          知道了
        </Button>
      </div>
    </Modal>
  );
};
export default PasteTip;
