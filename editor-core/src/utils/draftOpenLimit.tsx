import { Modal } from 'antd';
import { setLocalstorage, windowBeforeUnload } from './single';
import getUrlProps from './urlProps';

export function draftOpenLimit(draftId?: string | string) {
  let { upicId } = getUrlProps();

  if (draftId) upicId = draftId;

  if (!upicId) return;

  setLocalstorage(upicId, Date.now());

  function onStorage(e: StorageEvent) {
    if (e.key === upicId) {
      setLocalstorage(`-${upicId}`, Date.now());
    }
    if (e.key === `-${upicId}`) {
      Modal.confirm({
        title: <h3>您的草稿已在其他页面打开</h3>,
        content:
          '继续编辑将会覆盖原有草稿数据，为避免数据错乱，请复制新草稿后再进入编辑',
        okText: '确定',
        zIndex: 99999999999,
        centered: true,
        mask: true,
        okCancel: false,
        icon: null,
        onOk: () => {
          windowBeforeUnload.close();
          window.open('https://xiudodo.com/myspace/videos?tag=all', '_self');
        },
      });
    }
  }
  window.removeEventListener('storage', onStorage);
  window.addEventListener('storage', onStorage, false);
}
