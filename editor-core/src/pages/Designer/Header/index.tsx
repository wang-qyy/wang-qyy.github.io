import { useState } from 'react';
import { Button } from 'antd';
import classNames from 'classnames';
import {
  useHistoryRecordByObserver,
  observer,
  pauseVideo,
} from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';
import PreviewVideo from '@/pages/Designer/GlobalModal/Preview';
import getUrlProps from '@/utils/urlProps';
import { handleSave } from '@/utils/userSave';
import { useUserSave } from '@/store/adapter/useGlobalStatus';
import SubmitModal from '../GlobalModal/SubmitModal';
import TemplateSubmit from '../GlobalModal/SubmitModal/Content';
import SubmitModuleModal from '../GlobalModal/SubmitModuleModal';

import styles from './index.modules.less';

function Header() {
  const { value, goNext, goPrev } = useHistoryRecordByObserver();

  const { stat: saveStat } = useUserSave();
  const [submitModalVisible, setSubmitModalVisible] = useState(false); // 模板提交
  const [submitModuleModalVisible, setSubmitModuleModalVisible] =
    useState(false); // 组件提交

  const [previewModal, setPreviewModal] = useState(false);

  const { redirect } = getUrlProps();

  return (
    <>
      <div className={styles['designer-header']} onMouseDown={pauseVideo}>
        <div className={styles['header-left']}>
          <div
            className={classNames(
              styles['flex-box-item'],
              styles['header-home'],
            )}
            onClick={() => {
              window.open(
                'https://movie.xiudodo.com/designer/workbench/#/myworks',
                '_self',
              );
            }}
          >
            <XiuIcon type="iconshouye" />
          </div>
          {/* <div className={classNames(styles['flex-box-item'])}>未命名作品</div> */}
        </div>
        <div className={classNames(styles['header-right'], styles['flex-box'])}>
          <div
            className={classNames(styles['flex-box-item'], {
              [styles['flex-box-item-disabled']]: !value.hasPrev,
            })}
            onClick={() => {
              value.hasPrev && goPrev();
            }}
          >
            <XiuIcon type="iconchexiao1" />
          </div>

          <div
            className={classNames(styles['flex-box-item'], {
              [styles['flex-box-item-disabled']]: !value.hasNext,
            })}
            onClick={() => {
              value.hasNext && goNext();
            }}
          >
            <XiuIcon
              type="iconchexiao1"
              style={{ transform: 'rotateY(180deg)' }}
            />
          </div>

          <div
            className={classNames(
              styles['flex-box-item'],
              styles['header-save'],
              // { [styles['save-loading']]: saveStat === 1 },
            )}
            onClick={() => handleSave({})}
          >
            <XiuIcon type="iconbaocun1" className={styles.icon} />
            {{ 0: '保存', 1: '保存中', 2: '已保存' }[saveStat]}
          </div>

          {redirect === 'designer' && (
            <div
              className={classNames(
                styles['flex-box-item'],
                styles['header-preview'],
              )}
              onClick={() => setPreviewModal(true)}
            >
              <XiuIcon type="iconbofang" className={styles.icon} /> 预览
            </div>
          )}

          <div
            className={classNames(
              styles['flex-box-item'],
              styles['header-submit'],
            )}
            onClick={() =>
              redirect === 'designer'
                ? setSubmitModalVisible(true)
                : setSubmitModuleModalVisible(true)
            }
          >
            <Button
              type="primary"
              size="large"
              style={{ width: '150px', fontSize: 14 }}
            >
              确认提交
            </Button>
          </div>
        </div>
      </div>
      <SubmitModal
        title="完善视频详细信息"
        visible={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        Content={TemplateSubmit}
      />

      <SubmitModal
        title="提交信息设置"
        visible={submitModuleModalVisible}
        onCancel={() => setSubmitModuleModalVisible(false)}
        Content={SubmitModuleModal}
      />

      {previewModal && (
        <PreviewVideo
          visible={previewModal}
          onCancel={() => setPreviewModal(false)}
        />
      )}
    </>
  );
}
export default observer(Header);
