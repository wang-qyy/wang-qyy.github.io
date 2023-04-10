import { Radio } from 'antd';

import { useEditMode, useLayersVisit } from '@/store/adapter/useGlobalStatus';
import { observer } from '@hc/editor-core';
import { XiuIcon } from '@/components';

import styles from './index.modules.less';
import { clickActionWeblog } from '@/utils/webLog';

// import styles from './index.less';

const plainOptions = [
  {
    label: (
      <div className={styles.button}>
        <XiuIcon type="shijianzhou" />
        &nbsp;专业版
      </div>
    ),
    value: 'professional',
  },
  {
    label: (
      <div className={styles.button}>
        <XiuIcon type="jisuban" />
        &nbsp;极速版
      </div>
    ),
    value: 'concise',
  },
];

const SwitchMode = () => {
  const { editMode, setEditMode } = useEditMode();
  const { close } = useLayersVisit();

  const onChange = (value: 'professional' | 'concise') => {
    setEditMode(value);
    localStorage.setItem('editMode', value);
    close();
    clickActionWeblog('concise_switch');
  };

  return (
    <div className={styles.SwitchMode}>
      <Radio.Group
        options={plainOptions}
        onChange={({ target: { value } }) => {
          onChange(value);
        }}
        value={editMode}
        optionType="button"
        buttonStyle="solid"
      />
    </div>
  );
};

export default observer(SwitchMode);
