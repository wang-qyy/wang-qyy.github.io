import React from 'react';
import classNames from 'classnames';
import { Dropdown, Menu, Modal, message } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { deleteFilesWithinType } from '@/api/upload';
import styles from './index.less';
import { clickActionWeblog } from '@/utils/webLog';

const MoreDropdown = (props: any) => {
  const { data, handleReload } = props;

  const bindWorksDel = () => {
    Modal.confirm({
      title: '删除文件',
      content: '删除后将无法找回，确定要删除该文件嘛！',
      cancelText: '取消',
      okText: '确认',
      onOk: () => {
        const { id } = data;
        deleteFilesWithinType([id]).then(res => {
          if (res.code === 0) {
            message.success('删除成功');
            handleReload && handleReload();
          }
        });
        clickActionWeblog('concise19');
      },
      onCancel: () => {},
    });
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={bindWorksDel}>删除</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      trigger={['hover']}
      overlay={menu}
      placement="bottomLeft"
      overlayClassName="moreDropdown"
      // getPopupContainer={() => document.querySelector(`.class${data.id}`)}
    >
      <span
        className={classNames({
          [styles.moreDropdown]: true,
        })}
        onClick={() => {
          clickActionWeblog('concise20');
        }}
      >
        <XiuIcon type="icongengduo_tianchong" className={styles.itemIcon} />
      </span>
    </Dropdown>
  );
};

export default MoreDropdown;
