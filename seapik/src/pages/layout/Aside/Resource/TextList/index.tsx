import { observer } from 'mobx-react';
import { Button, Divider, Spin } from 'antd';
import textMockData, { commonText } from '@/mock/texts';
import { addText } from './handler';
import { config } from '@/config/constants';

import { useTexts } from '@/pages/store/texts';

import './index.less';
import Tooltip from 'antd/es/tooltip';
import IconFont from '@/components/Icon';

function TextList() {
  const { loading, texts } = useTexts();

  return (
    <div className="flex-box flex-col">
      <div className="resource-panel-header">Texts</div>
      <div className="common-text-wrap">
        <div className="common-text">
          <div
            className="common-text-preview"
            onClick={() =>
              addText(
                commonText.header.info,
                commonText.header.position,
                commonText.header.sizeRatio,
              )
            }
          >
            <div></div>
            <div></div>
          </div>
          <div className="title">Header</div>
        </div>
        <div className="common-text">
          <div
            className="common-text-preview"
            onClick={() =>
              addText(
                commonText.text.info,
                commonText.text.position,
                commonText.text.sizeRatio,
              )
            }
          >
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="title">Body</div>
        </div>
        <div className="common-text">
          <div
            className="common-text-preview"
            onClick={() =>
              addText(
                commonText.caption.info,
                commonText.caption.position,
                commonText.caption.sizeRatio,
              )
            }
          >
            <div></div>
            <div></div>
          </div>
          <div className="title">Caption</div>
        </div>
      </div>
      <Divider />
      <Spin spinning={loading}>
        <div className="aside-text-list">
          {texts.map((text, index) => (
            <Button
              type="text"
              key={text.id}
              className="text-list-item"
              onClick={() => addText(text.doc.assets[0])}
            >
              {!!config.is_designer && text.online == 1 && (
                <div className="online-mark">
                  <IconFont type="iconshangxian" />
                </div>
              )}
              <div
                className={`text-preview`}
                style={{
                  background: `url('${text.image_url}') center / contain no-repeat`,
                }}
              />
              {!!config.is_designer && (
                <Tooltip title="编辑">
                  <div
                    className="edit-btn"
                    onClick={() =>
                      window.open(
                        `/?is_designer=1&draft_id=${text.id}`,
                        '_blank',
                      )
                    }
                  >
                    <IconFont type="iconwenbenshuru" />
                  </div>
                </Tooltip>
              )}
            </Button>
          ))}
        </div>
      </Spin>
    </div>
  );
}

export default observer(TextList);
