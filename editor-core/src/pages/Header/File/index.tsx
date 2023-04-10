import React, { PropsWithChildren, useState } from 'react';
import { Dropdown, Menu, message, Tooltip } from 'antd';
import classNames from 'classnames';
import {
  useUpdateTitle,
  useUpdateCanvasInfo,
} from '@/store/adapter/useTemplateInfo';

import { clickActionWeblog } from '@/utils/webLog';
import urlProps from '@/utils/urlProps';
import { XiuIcon } from '@/components';
import styles from './index.less';
import CreateCopy from './CreateCopy';
import UploadTitle from './UploadTitle';
import ReferenceLine from './ReferenceLine';

function File(props: PropsWithChildren<{ className?: string }>) {
  const params = urlProps();
  const { className } = props;
  const [visible, setVisible] = useState(false);
  const { update: updateTitle, value: templateTitle } = useUpdateTitle();
  const { value } = useUpdateCanvasInfo();
  // 复制草稿id
  const copyText = () => {
    navigator.clipboard.writeText(`草稿ID：${params.upicId}`);
    message.success('草稿ID复制成功！');
  };
  const menu = (
    <Menu>
      <div className={styles.fileDropdownMenu}>
        <UploadTitle templateTitle={templateTitle} updateTitle={updateTitle} />
        <div className={styles.fileDropdownMenuXs}>
          {value.width}像素 X {value.height}像素
        </div>
        <div className={styles.fileDropdownMenuPicId} onClick={copyText}>
          草稿ID：{params.upicId}
          <XiuIcon type="copy" style={{ marginLeft: 18, fontSize: 15 }} />
        </div>
        <div className={styles.fileDropdownMenuLine} />
        <div
          onClick={() => {
            setVisible(false);
          }}
        >
          <CreateCopy templateTitle={templateTitle} />
        </div>
        <div className={styles.fileDropdownMenuLine} />
        <ReferenceLine />
        <div className={styles.fileDropdownMenuLine} />

        <div
          className={styles.fileDropdownMenuWork}
          onClick={() => {
            clickActionWeblog('toWorkspace');
            window.open('//xiudodo.com/myspace/videos', '_blank');
          }}
        >
          我的工作台
        </div>
      </div>
    </Menu>
  );

  return (
    <>
      <Dropdown
        overlay={menu}
        visible={visible}
        placement="bottomLeft"
        getPopupContainer={ele => ele}
        overlayClassName={styles.referenceLineDropdown}
        onVisibleChange={visible => {
          setVisible(visible);
        }}
      >
        <div className={classNames(styles.file, className)}>文件</div>
      </Dropdown>
    </>
  );
}

export default File;
