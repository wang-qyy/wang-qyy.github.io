import { useState } from 'react';
import { Tooltip, Dropdown, Menu, message } from 'antd';

import { useUpdateTitle } from '@/store/adapter/useTemplateInfo';

import XiuIcon from '@/components/XiuIcon';
import { handleSave } from '@/utils/userSave';
import { useUserInfo } from '@/store/adapter/useUserInfo';
import { useUserLoginModal } from '@/store/adapter/useGlobalStatus';

import UpdateInput from '../Header/UpdateInput';

import styles from './index.less';

const XiudodoHeader = ({ onClose }) => {
  const userInfo = useUserInfo();
  const userLoginModal = useUserLoginModal();

  const { update: updateTitle, value: templateTitle } = useUpdateTitle();

  const [editable, setEditable] = useState(false);

  const menu = (
    <Menu>
      {/* <Menu.Item>重新设计</Menu.Item> */}
      <Menu.Item
        key="draft"
        onClick={() => {
          if (userInfo.id < 0) {
            // 未登录 弹出登录窗口
            userLoginModal.showLoginModal();
            return;
          }
          window.open('https://xiudodo.com/my/download?type=draft', '_self');
        }}
      >
        最近草稿
      </Menu.Item>
    </Menu>
  );

  const alterName = async (value: string) => {
    setEditable(false);
    await updateTitle(value);
    handleSave({
      info: { title: value },
      onSuccess: res => {
        if (res.stat === 1) {
          message.success('修改成功');
        }
      },
    });
  };

  return (
    <>
      <div className={styles.headerWrap}>
        <div className={styles.left}>
          <a href="https://xiudodo.com/">
            <div className={styles.logo} />
          </a>

          <Dropdown
            overlay={menu}
            overlayClassName={styles['cover-dropdown']}
            getPopupContainer={ele => ele}
          >
            <div className={`${styles.headerItem} ${styles['btn-bg']}`}>
              <XiuIcon className={`${styles.icon}`} type="iconsheji" />
              我的设计
            </div>
          </Dropdown>

          <div
            onClick={() => {
              setEditable(true);
            }}
            // onDoubleClick={() => {
            //   setEditable(true);
            // }}
            className={`${styles.headerItem} ${styles['btn-bg']} ${styles.templateTitle}`}
          >
            {editable ? (
              <UpdateInput
                editable={editable}
                alterName={alterName}
                templateInfoTitle={String(templateTitle)}
              />
            ) : (
              <Tooltip
                overlayClassName={styles['overlay-tooltip']}
                title="点击修改"
              >
                <span className={styles.title}>{templateTitle}</span>
              </Tooltip>
            )}
          </div>

          {/* <Tooltip title="上一步">
            <XiuIcon
              className={classnames(styles.icon, {
                [styles.disabled]: !value.hasPrev,
              })}
              type="iconchexiao1"
              onClick={() => {
                if (value.hasPrev) {
                  goPrev();
                }
              }}
            />
          </Tooltip>
          <Tooltip title="下一步">
            <XiuIcon
              className={classnames(styles.icon, styles.next, {
                [styles.disabled]: !value.hasNext,
              })}
              type="iconchexiao1"
              onClick={() => {
                if (value.hasNext) {
                  goNext();
                }
              }}
            />
          </Tooltip> */}
        </div>
        <div className={styles.right}>
          <div
            className={styles.rightbutton}
            onClick={() => {
              onClose();
            }}
          >
            退出
          </div>
          <div
            className={styles.rightbutton2}
            onClick={() => {
              onClose();
            }}
          >
            保存设置
          </div>
        </div>
      </div>
    </>
  );
};

export default XiudodoHeader;
