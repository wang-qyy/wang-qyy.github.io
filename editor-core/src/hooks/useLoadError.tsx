import { Modal, Button } from 'antd';
import { goPrev } from '@hc/editor-core';

import { windowBeforeUnload } from '@/utils/single';
import serviceQRcode from '@/assets/image/serviceQRcode.png';
import getUrlParams from '@/utils/urlProps';

export const BtnType = {
  workbench: 1, // 进入工作台
  reload: 2, // 刷新
  help: 3, // 联系客服
};

export function openLoadError(
  title: string,
  content: string,
  btnType?: number,
) {
  let okText = '进入工作台';

  let handleOk = () => {
    const { redirect } = getUrlParams();

    windowBeforeUnload.close();
    if (['module', 'designer'].includes(redirect)) {
      window.open(
        'https://movie.xiudodo.com/designer/workbench/#/myworks',
        '_self',
      );
    } else {
      window.open('https://xiudodo.com/myspace/drafts', '_self');
    }
  };

  switch (btnType) {
    case BtnType.reload:
      okText = '刷新';
      handleOk = () => {
        windowBeforeUnload.close();
        window.location.reload();
      };
      break;
    default:
  }

  Modal.confirm({
    title: <h3>{title}</h3>,
    content,
    okText,
    zIndex: 99999999999,
    centered: true,
    mask: true,
    okCancel: false,
    icon: null,
    onOk: handleOk,
  });
}

export function useLoadError() {
  return { open: openLoadError };
}

export const openSaveError = (msg: string) => {
  function onCancel() {
    goPrev();
    Modal.destroyAll();
  }

  Modal.warning({
    title: (
      <h3 style={{ marginBottom: 0 }}>操作失败,已为你自动撤销当前操作!</h3>
    ),
    closable: true,
    content: (
      <div style={{ textAlign: 'center' }}>
        <img
          style={{ margin: '6px 0px' }}
          alt=""
          src={serviceQRcode}
          width={100}
          height={100}
        />
        <div style={{ marginTop: 12 }}>扫码向客服反馈失败类型</div>
        <div style={{ color: '#7D5630', marginTop: 8 }}>失败类型: {msg}</div>
        <Button
          type="primary"
          block
          style={{ width: 240, height: 40, marginTop: 16 }}
          onClick={onCancel}
        >
          知道了
        </Button>
      </div>
    ),
    // okText,
    zIndex: 99999999999,
    centered: true,
    mask: true,
    className: 'saveError-modal',
    onCancel,
  });
};
