import { Tooltip } from 'antd';
import classNames from 'classnames';

import { useUserSave } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';
import XiuIcon from '@/components/XiuIcon';
import { observer } from '@hc/editor-core';
import { manualSave } from '@/utils/userSave';
import { useState } from 'react';
import { getSaveStatusOption } from './options';
import styles from './index.modules.less';

// import styles from './index.less';

const Save = () => {
  const { stat: saveStat } = useUserSave();

  const option = getSaveStatusOption(saveStat);

  return (
    <div
      id="userSave"
      className={classNames(
        'xiudodo-header-item',
        'xiudodo-header-save',
        'xiudodo-header-item-hover',
        {
          'xiudodo-header-save-loading': saveStat === 1,
        },
      )}
      style={{ padding: '0 3px' }}
      onClick={() => {
        clickActionWeblog('header_save');
        manualSave();
      }}
    >
      {/* Tooltip包在外层会有问题 */}
      {option.tooltip ? (
        <Tooltip title={option.tooltip} getTooltipContainer={ele => ele}>
          <div className={styles.item}>
            {option.iconType && (
              <XiuIcon
                type={option.iconType}
                className={classNames('xiudodo-header-icon', styles.icon)}
              />
            )}
            {option.text}
            {/* <span className="xiudodo-header-item-desc">{option.text}</span> */}
          </div>
        </Tooltip>
      ) : (
        <div className={styles.item}>
          {option.iconType && (
            <XiuIcon
              type={option.iconType}
              className={classNames('xiudodo-header-icon', styles.icon)}
            />
          )}
          {option.text}
          {/* <span className="xiudodo-header-item-desc">{option.text}</span> */}
        </div>
      )}
    </div>
  );
};

export default observer(Save);
