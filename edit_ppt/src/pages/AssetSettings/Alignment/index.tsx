import classNames from 'classnames';
import { Button } from 'antd';
import { observer } from 'mobx-react';

import { useTextAlign } from '@/kernel';
import Icon from '@/components/Icon';
import './index.less';

const ALIGN = [
  { key: 'left', icon: 'iconzuoduiqi1' },
  { key: 'center', icon: 'iconcenter' },
  { key: 'right', icon: 'iconyouduiqi1' },
];

function Alignment() {
  const [value, update] = useTextAlign();

  return (
    <div className="alignment mb-24">
      <label className="label">Alignment:</label>
      <div className="flex-box">
        {ALIGN.map((item) => (
          <Button
            className={classNames('alignment-item', {
              'alignment-item-active': value === item.key,
            })}
            type="text"
            key={item.key}
            value={item.key}
            onClick={() => update(item.key)}
          >
            <Icon type={item.icon} />
          </Button>
        ))}
      </div>
    </div>
  );
}

export default observer(Alignment);
