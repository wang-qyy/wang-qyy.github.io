import classNames from 'classnames';
import { Button, message, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { useHistoryRecord } from '@/kernel';
import Icon from '@/components/Icon';
import useDownload from '@/hooks/useDownload';
import { isLogin } from '@/pages/store/userInfo';
import { openImgModal } from '@/pages/store/global';

import { config } from '@/config/constants';
import { onSave } from '@/utils/userSave';
import { getTemplateInfo } from '@/pages/store/template';
import { globalLink } from '@/config/urls';

import Size from './Size';

import './index.less';
import IconFont from '@/components/Icon';

function Header() {
  const { value, goNext, goPrev } = useHistoryRecord();

  const { start } = useDownload({ onSuccess() {} });

  return (
    <>
      <div className="flex-box">
        <a href={globalLink.home}>
          <img
            src={globalLink.logo}
            height="30px"
            style={{ marginRight: 16, cursor: 'pointer' }}
          />
        </a>

        <Tooltip title="undo">
          <Button
            disabled={!value.hasPrev}
            type="text"
            className="undo"
            icon={<Icon type="iconchexiao1" />}
            onClick={goPrev}
          />
        </Tooltip>
        <Tooltip title="redo">
          <Button
            disabled={!value.hasNext}
            type="text"
            className={classNames('redo')}
            icon={
              <Icon
                type="iconchexiao1"
                style={{ transform: 'rotateY(180deg)' }}
              />
            }
            onClick={goNext}
          />
        </Tooltip>
      </div>
      <div className="flex-box gap-16">
        {!config.is_designer && (
          <>
            {Window?.location?.host !== 'edit.pngtree.com' && (
              <Button onClick={() => openImgModal(true)}>
                <IconFont type="iconjiahao" /> New image
              </Button>
            )}
            <Size />
            <Button
              type="primary"
              icon={<Icon type="icondownload" />}
              onClick={() => {
                if (isLogin()) {
                  start();
                } else {
                  message.info({ content: '请返回首页登录后进行下载' });
                }
              }}
              className="download-btn"
            >
              Download
            </Button>
          </>
        )}

        {/* 内容生产可操作按钮 */}
        {!!config.is_designer && (
          <>
            <Button onClick={() => window.open('/?is_designer=1', '_blank')}>
              新增设计
            </Button>
            {getTemplateInfo()?.draft_id && (
              <>
                {getTemplateInfo()?.online == 1 && (
                  <Button onClick={() => onSave({ info: { online: 0 } })}>
                    下线
                  </Button>
                )}
                {getTemplateInfo()?.online == 0 && (
                  <Button onClick={() => onSave({ info: { online: 1 } })}>
                    上线
                  </Button>
                )}
                <Button onClick={() => onSave({ info: { online: -1 } })}>
                  删除设计
                </Button>
              </>
            )}
            <Button type="primary" onClick={() => onSave()}>
              保存
            </Button>
          </>
        )}
      </div>
    </>
  );
}

export default observer(Header);
