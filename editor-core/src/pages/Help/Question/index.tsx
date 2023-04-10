import { CSSProperties, PropsWithChildren, useState } from 'react';
import { Drawer, message, ModalProps, Tooltip } from 'antd';
import copy from 'copy-to-clipboard';

import { useUserInfo } from '@/store/adapter/useUserInfo';
import { problemHelpWebLog } from '@/utils/webLog';
import { ossEditorPath } from '@/config/urls';
import { useEditMode } from '@/store/adapter/useGlobalStatus';

import Content from './Content';

import './index.less';
import { XiuIcon } from '@/components';

interface QuestionProps {
  style?: CSSProperties;
}
export default function Question(props: PropsWithChildren<QuestionProps>) {
  const { style, ...others } = props;
  const { username, id } = useUserInfo();
  const { isConcise } = useEditMode();

  const [modalVisible, setModalVisible] = useState(false);

  function handleCopyUID() {
    copy(`${id}`);
    message.success(`复制成功UID：${id}`);
  }

  return (
    <>
      <Drawer
        visible={modalVisible}
        title={
          <div className="questions-modal-header">
            您好！
            {id > -1 && (
              <span>
                {username}
                （UID：
                <Tooltip title="点击复制UID">
                  <span
                    className="questions-modal-header-UID"
                    onClick={handleCopyUID}
                  >
                    {id}
                  </span>
                </Tooltip>
                ）
              </span>
            )}
          </div>
        }
        footer={false}
        onClose={() => setModalVisible(false)}
        maskClosable={false}
        width={374}
        height={300}
        className="questions-modal-wrap"
        getContainer={false}
        mask={false}
      >
        <Content onClose={() => setModalVisible(false)} />
      </Drawer>

      {!isConcise && (
        <Tooltip title="问题帮助">
          <div
            className="questions"
            style={style}
            onClick={() => {
              setModalVisible(true);
              problemHelpWebLog({ action: 'open' });
            }}
          >
            <XiuIcon type="iconhelp" />
            {/* <img src={ossEditorPath('/image/help/help.png')} alt="help" /> */}
          </div>
        </Tooltip>
      )}
    </>
  );
}
